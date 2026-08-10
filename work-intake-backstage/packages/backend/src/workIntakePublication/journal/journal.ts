import { createHash } from 'node:crypto';
import {
  mkdir,
  open,
  readFile,
  rename,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { dirname } from 'node:path';

import type {
  JournalEntry,
  JournalKey,
  JournalObservation,
  PublicationJournal,
} from '../contracts';

type JournalStateFile = {
  entries?: Record<string, JournalEntry>;
  publications?: Record<
    string,
    { state: 'creating' | 'published'; issueKey?: string; url?: string }
  >;
};

export class RevisionRequired extends Error {
  constructor(key: string) {
    super(
      `A different target fingerprint already exists for ${key}. A new revision is required.`,
    );
    this.name = 'RevisionRequired';
  }
}

export class ConcurrentPublication extends Error {
  constructor(identity: string) {
    super(`Publication ${identity} is already locked.`);
    this.name = 'ConcurrentPublication';
  }
}

/** A stable, destination-qualified identity for a published logical record. */
export function journalEntryKey(key: JournalKey): string {
  return [
    key.profileId,
    key.placementId,
    key.adapterId,
    key.targetId,
    key.proposalId,
    String(key.proposalRevision),
    key.localId,
  ].join(':');
}

/**
 * Filesystem-backed journal for publication orchestration. Legacy Jira ledgers
 * are read on demand, which makes an upgrade safe without a separate migration.
 */
export class FilePublicationJournal implements PublicationJournal {
  private static readonly heldLocks = new Set<string>();

  constructor(private readonly path: string) {}

  async withLock<T>(identity: string, operation: () => Promise<T>): Promise<T> {
    const lockIdentity = `${this.path}:${identity}`;
    if (FilePublicationJournal.heldLocks.has(lockIdentity)) {
      throw new ConcurrentPublication(identity);
    }

    const lockPath = `${this.path}.${createHash('sha256')
      .update(identity)
      .digest('hex')}.lock`;
    await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
    let lock: Awaited<ReturnType<typeof open>>;
    try {
      lock = await open(lockPath, 'wx', 0o600);
    } catch (error: unknown) {
      if (isCode(error, 'EEXIST')) throw new ConcurrentPublication(identity);
      throw error;
    }

    FilePublicationJournal.heldLocks.add(lockIdentity);
    try {
      return await operation();
    } finally {
      FilePublicationJournal.heldLocks.delete(lockIdentity);
      await lock.close();
      await unlink(lockPath);
    }
  }

  async observe(keys: JournalKey[]): Promise<JournalObservation> {
    const state = await this.read();
    const entries = keys.flatMap(key => {
      const existing = state.entries?.[journalEntryKey(key)];
      if (existing) return [existing];

      const legacy = this.legacyJiraEntry(state, key);
      return legacy ? [legacy] : [];
    });
    return { entries };
  }

  async reserve(entries: JournalEntry[]): Promise<void> {
    const state = await this.read();
    const stored = { ...(state.entries ?? {}) };
    for (const entry of entries) {
      const key = journalEntryKey(entry);
      const existing = stored[key];
      if (existing && existing.targetFingerprint !== entry.targetFingerprint) {
        throw new RevisionRequired(key);
      }
      if (!existing) stored[key] = entry;
    }
    await this.write({ ...state, entries: stored });
  }

  async recordPublished(entries: JournalEntry[]): Promise<void> {
    const state = await this.read();
    const stored = { ...(state.entries ?? {}) };
    for (const entry of entries) {
      const key = journalEntryKey(entry);
      const existing = stored[key];
      if (existing && existing.targetFingerprint !== entry.targetFingerprint) {
        throw new RevisionRequired(key);
      }
      stored[key] = { ...existing, ...entry, state: 'published' };
    }
    await this.write({ ...state, entries: stored });
  }

  private async read(): Promise<JournalStateFile> {
    try {
      return JSON.parse(await readFile(this.path, 'utf8')) as JournalStateFile;
    } catch (error: unknown) {
      if (isCode(error, 'ENOENT')) return {};
      throw error;
    }
  }

  private async write(state: JournalStateFile): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
    const temporaryPath = `${this.path}.${process.pid}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, {
      mode: 0o600,
    });
    await rename(temporaryPath, this.path);
  }

  private legacyJiraEntry(
    state: JournalStateFile,
    key: JournalKey,
  ): JournalEntry | undefined {
    if (!key.adapterId.toLowerCase().includes('jira')) return undefined;
    const legacy =
      state.publications?.[key.proposalId] ?? state.publications?.[key.localId];
    if (!legacy) return undefined;
    return {
      ...key,
      logicalFingerprint: '',
      targetFingerprint: '',
      mappingVersion: 0,
      state: legacy.state,
      externalId: legacy.issueKey,
      ...(legacy.url ? { url: legacy.url } : {}),
    };
  }
}

function isCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === code
  );
}
