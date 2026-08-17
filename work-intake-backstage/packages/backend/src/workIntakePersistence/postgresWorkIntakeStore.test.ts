import { resolve } from 'node:path';

import knex, { type Knex } from 'knex';

import { PublicationError } from '../workIntakePublication/errors';
import { PostgresWorkIntakeStore } from './postgresWorkIntakeStore';

describe('PostgresWorkIntakeStore proposal lineage', () => {
  let database: Knex;
  let store: PostgresWorkIntakeStore;

  beforeEach(async () => {
    database = knex({
      client: 'better-sqlite3',
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    });
    await database.migrate.latest({
      directory: resolve(__dirname, '../../migrations'),
    });
    store = new PostgresWorkIntakeStore(database);
  });

  afterEach(async () => {
    await database.destroy();
  });

  it('retains immutable revisions and returns the complete lineage', async () => {
    await store.saveProposalRevision({
      proposalId: 'WP-2026-0043',
      revision: 1,
      artifact: { proposal: { title: 'First title' } },
      artifactSha256: 'a'.repeat(64),
      schemaVersion: 2,
      actor: 'user:default/avery',
      generatorProvenance: { name: 'work-intake-backstage', version: '1' },
      changeReason: 'Initial capture',
    });
    await store.saveProposalRevision({
      proposalId: 'WP-2026-0043',
      revision: 2,
      artifact: { proposal: { title: 'Revised title' } },
      artifactSha256: 'b'.repeat(64),
      schemaVersion: 2,
      actor: 'user:default/avery',
      generatorProvenance: { name: 'work-intake-backstage', version: '1' },
      changeReason: 'Clarified outcome',
    });

    expect(await store.getProposal('WP-2026-0043')).toMatchObject({
      id: 'WP-2026-0043',
      currentRevision: 2,
      revisions: [
        {
          revision: 1,
          artifactSha256: 'a'.repeat(64),
          artifact: { proposal: { title: 'First title' } },
        },
        {
          revision: 2,
          artifactSha256: 'b'.repeat(64),
          artifact: { proposal: { title: 'Revised title' } },
        },
      ],
    });
  });

  it('rejects changed content under an existing revision', async () => {
    const input = {
      proposalId: 'WP-2026-0043',
      revision: 1,
      artifact: { proposal: { title: 'First title' } },
      artifactSha256: 'a'.repeat(64),
      schemaVersion: 2,
      actor: 'user:default/avery',
      generatorProvenance: { name: 'work-intake-backstage', version: '1' },
      changeReason: 'Initial capture',
    };
    await store.saveProposalRevision(input);

    await expect(
      store.saveProposalRevision({
        ...input,
        artifact: { proposal: { title: 'Silently replaced' } },
        artifactSha256: 'c'.repeat(64),
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<PublicationError>>({
        kind: 'RevisionRequired',
      }),
    );
    expect(
      (await store.getProposalRevision('WP-2026-0043', 1))?.artifact,
    ).toEqual({ proposal: { title: 'First title' } });
  });

  it('requires each later saved revision to advance the lineage by one', async () => {
    const input = {
      proposalId: 'WP-2026-0043',
      revision: 4,
      artifact: { proposal: { title: 'Imported current revision' } },
      artifactSha256: 'a'.repeat(64),
      schemaVersion: 2,
      actor: 'user:default/avery',
      generatorProvenance: { name: 'work-intake-backstage', version: '1' },
      changeReason: 'Initial durable capture',
    };
    await store.saveProposalRevision(input);

    await expect(
      store.saveProposalRevision({
        ...input,
        revision: 6,
        artifactSha256: 'b'.repeat(64),
      }),
    ).rejects.toMatchObject({ kind: 'RevisionRequired' });
  });

  it('creates a new revision for every ordinary save and routes missing evidence to Assisted Intake', async () => {
    const first = await store.saveProposalChange({
      artifact: { title: 'Investigate metrics lifecycle' },
      missingEvidence: [
        { id: 'desired-outcome', label: 'Desired operating outcome' },
      ],
      actor: 'user:default/avery',
      changeReason: 'Initial demand capture',
    });
    const second = await store.saveProposalChange({
      proposalId: first.proposalId,
      artifact: {
        title: 'Investigate metrics lifecycle',
        desiredOutcome: 'Select a supported capability',
      },
      missingEvidence: [],
      actor: 'user:default/avery',
      changeReason: 'Added outcome evidence',
    });

    expect(first).toMatchObject({
      revision: 0,
      intakeRoute: 'assisted-intake',
      missingEvidence: [
        { id: 'desired-outcome', label: 'Desired operating outcome' },
      ],
    });
    expect(second).toMatchObject({
      proposalId: first.proposalId,
      revision: 1,
      intakeRoute: 'proposal-development',
      missingEvidence: [],
    });
    expect((await store.getProposal(first.proposalId))?.revisions).toHaveLength(
      2,
    );
  });
});

describe('PostgresWorkIntakeStore publication claims', () => {
  let database: Knex;
  let store: PostgresWorkIntakeStore;

  beforeEach(async () => {
    database = knex({
      client: 'better-sqlite3',
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    });
    await database.migrate.latest({
      directory: resolve(__dirname, '../../migrations'),
    });
    store = new PostgresWorkIntakeStore(database);
    await store.saveProposalRevision({
      proposalId: 'WP-2026-0043',
      revision: 1,
      artifact: { proposal: { title: 'First title' } },
      artifactSha256: 'a'.repeat(64),
      schemaVersion: 2,
      actor: 'user:default/avery',
      generatorProvenance: { name: 'work-intake-backstage', version: '1' },
      changeReason: 'Initial capture',
    });
  });

  afterEach(async () => {
    await database.destroy();
  });

  it('claims one publication per proposal revision and profile and replays its receipt', async () => {
    const input = {
      sourceKind: 'proposal-revision' as const,
      sourceId: 'WP-2026-0043',
      sourceRevision: 1,
      publicationProfileId: 'jira-work-management',
      sourceSha256: 'a'.repeat(64),
    };
    const first = await store.claimPublication(input);
    expect(first.status).toBe('claimed');
    await expect(store.claimPublication(input)).resolves.toEqual({
      status: 'concurrent',
    });
    if (first.status !== 'claimed') throw new Error('Expected claim');

    const receipt = {
      profileId: 'jira-work-management',
      proposal: { id: 'WP-2026-0043', revision: 1 },
      artifact: {
        status: 'verified' as const,
        sha256: 'a'.repeat(64),
        filename: 'WP-2026-0043-rev-1.json',
        locator: 'jira:NWI-43',
      },
      results: [
        {
          placementId: 'jira-proposal',
          adapterId: 'jira',
          targetId: 'NWI',
          localId: 'proposal',
          externalId: '10043',
          url: 'https://example.atlassian.net/browse/NWI-43',
          action: 'created' as const,
          canonicalArtifactSha256: 'a'.repeat(64),
        },
      ],
      relations: [],
      notes: [],
      partial: false,
      retryable: false,
    };
    await store.completePublication(first.publicationId, receipt);

    await expect(store.claimPublication(input)).resolves.toEqual({
      status: 'completed',
      receipt,
    });
    await expect(
      database('publication_result').where({
        publication_id: first.publicationId,
      }),
    ).resolves.toMatchObject([
      {
        placement_id: 'jira-proposal',
        external_id: '10043',
        published_sha256: 'a'.repeat(64),
        state: 'published',
      },
    ]);
  });
});
