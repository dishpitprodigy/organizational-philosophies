import {
  mkdir,
  open,
  readFile,
  rename,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

export function defaultLedgerPath() {
  return (
    process.env.JIRA_PUBLICATION_LEDGER ??
    join(
      homedir(),
      '.local',
      'state',
      'work-intake-backstage',
      'jira-publications.json',
    )
  );
}

export class PublicationLedger {
  constructor(path = defaultLedgerPath()) {
    this.path = path;
    this.lockPath = `${path}.lock`;
  }

  async read() {
    try {
      return JSON.parse(await readFile(this.path, 'utf8'));
    } catch (error) {
      if (error.code === 'ENOENT') return { publications: {} };
      throw error;
    }
  }

  async write(state) {
    await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
    const temporaryPath = `${this.path}.${process.pid}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, {
      mode: 0o600,
    });
    await rename(temporaryPath, this.path);
  }

  async withLock(operation) {
    await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
    let lock;
    try {
      lock = await open(this.lockPath, 'wx', 0o600);
      await lock.writeFile(`${process.pid}\n`);
    } catch (error) {
      if (error.code === 'EEXIST') {
        throw new Error(
          `Jira publication is already locked at ${this.lockPath}. Refusing concurrent publication.`,
        );
      }
      throw error;
    }

    try {
      return await operation(this);
    } finally {
      await lock.close();
      await unlink(this.lockPath);
    }
  }
}
