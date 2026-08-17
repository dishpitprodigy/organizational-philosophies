import { resolve } from 'node:path';

import knex, { type Knex } from 'knex';

import type { JournalEntry } from '../workIntakePublication/contracts';
import { DatabasePublicationJournal } from './databasePublicationJournal';

function entry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    profileId: 'jira-work-management',
    placementId: 'jira-proposal',
    adapterId: 'jira',
    targetId: 'NWI',
    proposalId: 'WP-2026-0043',
    proposalRevision: 1,
    localId: 'proposal',
    logicalFingerprint: 'a'.repeat(64),
    targetFingerprint: 'b'.repeat(64),
    mappingVersion: 1,
    state: 'creating',
    ...overrides,
  };
}

describe('DatabasePublicationJournal', () => {
  let database: Knex;
  let journal: DatabasePublicationJournal;

  beforeEach(async () => {
    database = knex({
      client: 'better-sqlite3',
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    });
    await database.migrate.latest({
      directory: resolve(__dirname, '../../migrations'),
    });
    journal = new DatabasePublicationJournal(database);
  });

  afterEach(async () => {
    await database.destroy();
  });

  it('durably reserves and completes projection reconciliation records', async () => {
    const reserved = entry();
    await journal.reserve([reserved]);
    await expect(journal.observe([reserved])).resolves.toEqual({
      entries: [reserved],
    });

    const published = {
      ...reserved,
      state: 'published' as const,
      externalId: 'NWI-43',
      url: 'https://example.atlassian.net/browse/NWI-43',
      lastObservation: {
        results: [{ localId: 'proposal', status: 'found' as const }],
      },
    };
    await journal.recordPublished([published]);
    await expect(journal.observe([reserved])).resolves.toEqual({
      entries: [published],
    });
  });

  it('rejects a changed fingerprint under the same publication identity', async () => {
    await journal.reserve([entry()]);
    await expect(
      journal.reserve([entry({ targetFingerprint: 'c'.repeat(64) })]),
    ).rejects.toMatchObject({ kind: 'RevisionRequired' });
  });
});
