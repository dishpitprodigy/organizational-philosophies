import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createJiraCommandService, findPrototypeRoot } from './command';

describe('JiraCommandService', () => {
  it('finds the prototype root when Backstage starts the backend package', async () => {
    const root = await mkdtemp(join(tmpdir(), 'northstar-backstage-root-'));
    const backendDir = join(root, 'packages', 'backend');
    await mkdir(join(root, 'scripts', 'jira'), { recursive: true });
    await mkdir(backendDir, { recursive: true });
    await writeFile(join(root, 'scripts', 'jira', 'publish.mjs'), '');

    try {
      expect(findPrototypeRoot(backendDir)).toBe(root);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('checks Jira through the credential-safe health command', async () => {
    const calls: Array<{ file: string; args: string[] }> = [];
    const service = createJiraCommandService({
      rootDir: '/prototype',
      runProcess: async (file, args) => {
        calls.push({ file, args });
        return {
          stdout: `${JSON.stringify({
            connected: true,
            projectKeys: ['NWI'],
          })}\n`,
          stderr: '',
        };
      },
    });

    await expect(service.health()).resolves.toEqual({
      connected: true,
      projectKeys: ['NWI'],
    });
    expect(calls[0].file).toBe(process.execPath);
    expect(calls[0].args).toEqual(['/prototype/scripts/jira/health.mjs']);
  });

  it('publishes a temporary artifact with apply and JSON output enabled', async () => {
    let artifactPath = '';
    const service = createJiraCommandService({
      rootDir: '/prototype',
      runProcess: async (_file, args) => {
        artifactPath = args[1];
        expect(JSON.parse(await readFile(artifactPath, 'utf8'))).toEqual({
          schemaVersion: 1,
          proposal: { id: 'WP-2026-0042' },
        });
        return {
          stdout: `${JSON.stringify({
            applied: true,
            issues: [{ issueKey: 'NWI-1', action: 'reused' }],
          })}\n`,
          stderr: '',
        };
      },
    });

    await expect(
      service.publish({
        schemaVersion: 1,
        proposal: { id: 'WP-2026-0042' },
      }),
    ).resolves.toMatchObject({ applied: true });
    await expect(access(artifactPath)).rejects.toMatchObject({
      code: 'ENOENT',
    });
  });

  it('rejects command output that is not a JSON result', async () => {
    const service = createJiraCommandService({
      rootDir: '/prototype',
      runProcess: async () => ({ stdout: 'not json\n', stderr: '' }),
    });

    await expect(service.health()).rejects.toThrow(
      /did not return a JSON result/,
    );
  });
});
