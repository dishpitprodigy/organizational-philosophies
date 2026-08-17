import { resolve } from 'node:path';

import knex, { Knex } from 'knex';

import { DatabasePublicationJournal } from './databasePublicationJournal';
import { PostgresWorkIntakeStore } from './postgresWorkIntakeStore';

const enabled = process.env.WORK_INTAKE_POSTGRES_INTEGRATION === '1';
const describePostgres = enabled ? describe : describe.skip;

function connection() {
  return {
    host: process.env.POSTGRES_HOST ?? '127.0.0.1',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER ?? 'work_intake',
    password: process.env.POSTGRES_PASSWORD ?? 'work_intake',
    database: process.env.POSTGRES_DB ?? 'backstage',
    allowExitOnIdle: true,
  };
}

describePostgres('PostgresWorkIntakeStore on PostgreSQL', () => {
  const schema = `work_intake_test_${process.pid}`;
  let administrativeDatabase: Knex;
  let database: Knex;
  let store: PostgresWorkIntakeStore;

  beforeAll(async () => {
    administrativeDatabase = knex({ client: 'pg', connection: connection() });
    await administrativeDatabase.raw(`CREATE SCHEMA "${schema}"`);
    database = knex({
      client: 'pg',
      connection: connection(),
      searchPath: [schema],
    });
    await database.migrate.latest({
      directory: resolve(__dirname, '../../migrations'),
    });
    store = new PostgresWorkIntakeStore(database);
  });

  afterAll(async () => {
    await database?.destroy();
    if (administrativeDatabase) {
      await administrativeDatabase.raw(`DROP SCHEMA "${schema}" CASCADE`);
      await administrativeDatabase.destroy();
    }
  });

  it('runs against PostgreSQL 18', async () => {
    const version = await database.raw('SHOW server_version_num');
    expect(Number(version.rows[0].server_version_num)).toBeGreaterThanOrEqual(
      180000,
    );
    expect(Number(version.rows[0].server_version_num)).toBeLessThan(190000);
  });

  it('persists an owner-scoped immutable proposal lineage', async () => {
    const first = await store.saveProposalChange({
      artifact: {
        form: { id: 'technical-work-proposal', version: 1 },
        answers: {},
      },
      missingEvidence: [{ id: 'outcome', label: 'Desired outcome' }],
      actor: 'user:default/avery',
      changeReason: 'Initial demand capture',
    });
    const second = await store.saveProposalChange({
      proposalId: first.proposalId,
      artifact: {
        form: { id: 'technical-work-proposal', version: 1 },
        answers: { outcome: 'Reduce detection time' },
      },
      missingEvidence: [],
      actor: 'user:default/avery',
      changeReason: 'Added desired outcome',
    });

    expect(second.revision).toBe(1);
    await expect(
      store.getProposal(first.proposalId, 'user:default/avery'),
    ).resolves.toMatchObject({ currentRevision: 1 });
    await expect(
      store.getProposal(first.proposalId, 'user:default/mallory'),
    ).resolves.toBeUndefined();
    await expect(
      database('proposal_revision')
        .where({ proposal_id: first.proposalId, revision: 0 })
        .update({ change_reason: 'mutated' }),
    ).rejects.toThrow('proposal_revision is append-only');
  });

  it('reclaims expired publication work while fencing the abandoned attempt', async () => {
    const input = {
      sourceKind: 'proposal-revision' as const,
      sourceId: 'WP-PG18-FENCE',
      sourceRevision: 0,
      publicationProfileId: 'jira-work-management',
      sourceSha256: 'a'.repeat(64),
    };
    const first = await store.claimPublication(input);
    if (first.status !== 'claimed') throw new Error('Expected first claim');
    await database('publication')
      .where({ id: first.publicationId })
      .update({ lease_expires_at: new Date(0) });

    const repair = await store.claimPublication(input);
    if (repair.status !== 'claimed') throw new Error('Expected repair claim');
    expect(repair.publicationId).toBe(first.publicationId);
    expect(repair.attemptId).not.toBe(first.attemptId);

    await store.failPublication(first.publicationId, first.attemptId, 'late');
    await expect(
      database('publication').where({ id: first.publicationId }).first(),
    ).resolves.toMatchObject({
      state: 'publishing',
      active_attempt_id: repair.attemptId,
    });
  });

  it('persists and replays the same completed publication receipt', async () => {
    const input = {
      sourceKind: 'proposal-revision' as const,
      sourceId: 'WP-PG18-COMPLETE',
      sourceRevision: 3,
      publicationProfileId: 'jira-work-management',
      sourceSha256: 'b'.repeat(64),
    };
    const claim = await store.claimPublication(input);
    if (claim.status !== 'claimed') throw new Error('Expected claim');
    const receipt = {
      profileId: input.publicationProfileId,
      proposal: { id: input.sourceId, revision: input.sourceRevision },
      artifact: {
        status: 'verified' as const,
        sha256: input.sourceSha256,
        filename: 'WP-PG18-COMPLETE-rev-3.json',
        locator: 'jira:NWI-180',
        externalArtifactIds: ['attachment-180'],
      },
      results: [
        {
          placementId: 'jira-proposal',
          adapterId: 'jira',
          targetId: 'NWI',
          localId: 'proposal',
          externalId: '10180',
          externalKey: 'NWI-180',
          url: 'https://example.atlassian.net/browse/NWI-180',
          action: 'created' as const,
          canonicalArtifactSha256: input.sourceSha256,
        },
      ],
      relations: [],
      notes: [],
      partial: false,
      retryable: false,
    };
    await store.completePublication(
      claim.publicationId,
      claim.attemptId,
      receipt,
    );

    await expect(store.claimPublication(input)).resolves.toEqual({
      status: 'completed',
      receipt,
    });
    await expect(
      database('publication_result')
        .where({ publication_id: claim.publicationId })
        .first(),
    ).resolves.toMatchObject({
      external_id: '10180',
      external_key: 'NWI-180',
      artifact_ids: ['attachment-180'],
    });
  });

  it('serializes publication work with a PostgreSQL advisory lock', async () => {
    const journal = new DatabasePublicationJournal(database);
    let release!: () => void;
    let entered!: () => void;
    const operationEntered = new Promise<void>(resolveEntered => {
      entered = resolveEntered;
    });
    const releaseOperation = new Promise<void>(resolveRelease => {
      release = resolveRelease;
    });
    const first = journal.withLock('WP-PG18-LOCK:rev-1:jira', async () => {
      entered();
      await releaseOperation;
      return 'completed';
    });
    await operationEntered;

    await expect(
      journal.withLock('WP-PG18-LOCK:rev-1:jira', async () => 'duplicate'),
    ).rejects.toMatchObject({ kind: 'ConcurrentPublication' });
    release();
    await expect(first).resolves.toBe('completed');
  });
});
