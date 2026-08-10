import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import {
  chmod,
  copyFile,
  mkdir,
  mkdtemp,
  rm,
  writeFile,
} from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';

type ProcessResult = { stdout: string; stderr: string };
type RunProcess = (
  file: string,
  args: string[],
  options: { cwd: string; env: NodeJS.ProcessEnv },
) => Promise<ProcessResult>;

const execFileAsync = promisify(execFile);

function defaultFailedArtifactDir(): string {
  return (
    process.env.WORK_INTAKE_FAILED_ARTIFACT_DIR ??
    join(
      homedir(),
      '.local',
      'state',
      'work-intake-backstage',
      'failed-publications',
    )
  );
}

async function retainFailedArtifact(
  artifactPath: string,
  failedArtifactDir: string,
): Promise<string> {
  await mkdir(failedArtifactDir, { recursive: true, mode: 0o700 });
  const failureDirectory = await mkdtemp(
    join(failedArtifactDir, 'publication-'),
  );
  const retainedPath = join(failureDirectory, 'artifact.json');
  await copyFile(artifactPath, retainedPath);
  await chmod(retainedPath, 0o600);
  return retainedPath;
}

async function defaultRunProcess(
  file: string,
  args: string[],
  options: { cwd: string; env: NodeJS.ProcessEnv },
): Promise<ProcessResult> {
  const result = await execFileAsync(file, args, {
    ...options,
    encoding: 'utf8',
    maxBuffer: 2 * 1024 * 1024,
  });
  return { stdout: String(result.stdout), stderr: String(result.stderr) };
}

function jsonResult(stdout: string): Record<string, unknown> {
  const line = stdout
    .trim()
    .split('\n')
    .map(value => value.trim())
    .filter(Boolean)
    .at(-1);
  try {
    return JSON.parse(line ?? '');
  } catch {
    throw new Error('Jira command did not return a JSON result.');
  }
}

export function findPrototypeRoot(startDir = process.cwd()): string {
  let candidate = resolve(startDir);
  for (;;) {
    if (existsSync(join(candidate, 'scripts', 'jira', 'publish.mjs'))) {
      return candidate;
    }
    const parent = dirname(candidate);
    if (parent === candidate) {
      throw new Error(`Could not locate Jira publisher above ${startDir}`);
    }
    candidate = parent;
  }
}

export function createJiraCommandService(
  options: {
    rootDir?: string;
    backstageUrl?: string;
    failedArtifactDir?: string;
    runProcess?: RunProcess;
  } = {},
) {
  const rootDir = options.rootDir ?? findPrototypeRoot();
  const backstageUrl =
    options.backstageUrl ??
    process.env.BACKSTAGE_URL ??
    'http://localhost:7007';
  const runProcess = options.runProcess ?? defaultRunProcess;
  const failedArtifactDir =
    options.failedArtifactDir ?? defaultFailedArtifactDir();
  const commandEnvironment = {
    ...process.env,
    BACKSTAGE_URL: backstageUrl,
  };

  async function run(scriptName: string, args: string[] = []) {
    const script = join(rootDir, 'scripts', 'jira', scriptName);
    const result = await runProcess(process.execPath, [script, ...args], {
      cwd: rootDir,
      env: commandEnvironment,
    });
    return jsonResult(result.stdout);
  }

  return {
    health: () => run('health.mjs'),
    async publish(artifact: unknown) {
      const directory = await mkdtemp(
        join(tmpdir(), 'northstar-work-intake-jira-'),
      );
      const artifactPath = join(directory, 'artifact.json');
      try {
        await writeFile(artifactPath, `${JSON.stringify(artifact)}\n`, {
          mode: 0o600,
        });
        return await run('publish.mjs', [artifactPath, '--apply', '--json']);
      } catch (error) {
        const retainedPath = await retainFailedArtifact(
          artifactPath,
          failedArtifactDir,
        );
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
          `${message}\nSubmitted artifact retained at ${retainedPath}`,
          { cause: error },
        );
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    },
  };
}

export type JiraCommandService = ReturnType<typeof createJiraCommandService>;
