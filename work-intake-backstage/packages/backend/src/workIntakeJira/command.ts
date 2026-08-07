import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';

type ProcessResult = { stdout: string; stderr: string };
type RunProcess = (
  file: string,
  args: string[],
  options: { cwd: string; env: NodeJS.ProcessEnv },
) => Promise<ProcessResult>;

const execFileAsync = promisify(execFile);

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
    runProcess?: RunProcess;
  } = {},
) {
  const rootDir = options.rootDir ?? findPrototypeRoot();
  const backstageUrl =
    options.backstageUrl ??
    process.env.BACKSTAGE_URL ??
    'http://localhost:7007';
  const runProcess = options.runProcess ?? defaultRunProcess;
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
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    },
  };
}

export type JiraCommandService = ReturnType<typeof createJiraCommandService>;
