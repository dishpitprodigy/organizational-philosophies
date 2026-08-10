import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { JournalEntry, JournalKey } from '../contracts';
import { FilePublicationJournal } from './journal';

const key: JournalKey = {
  profileId: 'delivery',
  placementId: 'jira-proposal',
  adapterId: 'atlassian-jira',
  targetId: 'NWI',
  proposalId: 'nwi-example',
  proposalRevision: 1,
  localId: 'proposal',
};

const entry = (overrides: Partial<JournalEntry> = {}): JournalEntry => ({
  ...key,
  logicalFingerprint: 'logical-v1',
  targetFingerprint: 'target-v1',
  mappingVersion: 1,
  state: 'creating',
  ...overrides,
});

async function journalForTest() {
  const directory = await mkdtemp(join(tmpdir(), 'publication-journal-'));
  return {
    journal: new FilePublicationJournal(join(directory, 'journal.json')),
    cleanup: () => rm(directory, { recursive: true, force: true }),
  };
}

describe('FilePublicationJournal', () => {
  it('uses every destination dimension in its persisted identity', async () => {
    const { journal, cleanup } = await journalForTest();
    try {
      await journal.reserve([entry()]);
      await journal.reserve([
        entry({ targetId: 'OTHER', externalId: 'OTHER-1' }),
      ]);

      expect((await journal.observe([key])).entries).toEqual([entry()]);
      expect(
        (await journal.observe([{ ...key, targetId: 'OTHER' }])).entries,
      ).toEqual([entry({ targetId: 'OTHER', externalId: 'OTHER-1' })]);
    } finally {
      await cleanup();
    }
  });

  it('rejects a retry with a different target fingerprint', async () => {
    const { journal, cleanup } = await journalForTest();
    try {
      await journal.reserve([entry()]);

      await expect(
        journal.reserve([entry({ targetFingerprint: 'target-v2' })]),
      ).rejects.toMatchObject({ name: 'RevisionRequired' });
    } finally {
      await cleanup();
    }
  });

  it('records a reconciled publication and returns it on retry', async () => {
    const { journal, cleanup } = await journalForTest();
    try {
      await journal.reserve([entry()]);
      await journal.recordPublished([
        entry({
          state: 'published',
          externalId: 'NWI-1',
          url: 'https://jira/NWI-1',
        }),
      ]);

      expect((await journal.observe([key])).entries).toEqual([
        entry({
          state: 'published',
          externalId: 'NWI-1',
          url: 'https://jira/NWI-1',
        }),
      ]);
    } finally {
      await cleanup();
    }
  });

  it('rejects concurrent work on the same publication identity', async () => {
    const { journal, cleanup } = await journalForTest();
    try {
      await journal.withLock('proposal-1', async () => {
        await expect(
          journal.withLock('proposal-1', async () => undefined),
        ).rejects.toMatchObject({
          name: 'ConcurrentPublication',
        });
      });
    } finally {
      await cleanup();
    }
  });

  it('reads a legacy Jira ledger record without duplicating it', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'publication-journal-'));
    const path = join(directory, 'journal.json');
    const journal = new FilePublicationJournal(path);
    try {
      await writeFile(
        path,
        `${JSON.stringify({
          publications: {
            'nwi-example': { state: 'published', issueKey: 'NWI-1' },
          },
        })}\n`,
      );

      expect((await journal.observe([key])).entries).toEqual([
        {
          ...key,
          logicalFingerprint: '',
          targetFingerprint: '',
          mappingVersion: 0,
          state: 'published',
          externalId: 'NWI-1',
        },
      ]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
