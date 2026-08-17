import { resolve } from 'node:path';

import knex, { type Knex } from 'knex';

import { authenticatedActorFromPrincipal } from '../workIntakePublication/contracts';
import { DurableWorkProposalPublication } from './durableWorkProposalPublication';
import { PostgresWorkIntakeStore } from './postgresWorkIntakeStore';

describe('DurableWorkProposalPublication', () => {
  let database: Knex;

  beforeEach(async () => {
    database = knex({
      client: 'better-sqlite3',
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    });
    await database.migrate.latest({
      directory: resolve(__dirname, '../../migrations'),
    });
  });

  afterEach(async () => {
    await database.destroy();
  });

  it('persists the canonical revision before external work and replays a completed receipt', async () => {
    const events: string[] = [];
    const artifact = {
      schemaVersion: 2,
      proposal: { id: 'WP-2026-0043', revision: 1 },
    };
    const receipt = {
      profileId: 'jira-work-management',
      proposal: { id: 'WP-2026-0043', revision: 1 },
      artifact: {
        status: 'verified' as const,
        sha256: 'a'.repeat(64),
        filename: 'proposal.json',
        locator: 'jira:NWI-43',
      },
      results: [],
      relations: [],
      notes: [],
      partial: false,
      retryable: false,
    };
    const delegate = {
      profiles: jest.fn().mockResolvedValue([]),
      preview: jest.fn().mockResolvedValue({
        profileId: 'jira-work-management',
        artifact: {
          artifact,
          content: '{}',
          sha256: 'a'.repeat(64),
          filename: 'proposal.json',
        },
        records: [],
        relations: [],
        notes: [],
        placements: [],
      }),
      publish: jest.fn(),
      publishPrepared: jest.fn().mockImplementation(async () => {
        const stored = await database('proposal_revision').first();
        events.push(stored ? 'revision-stored' : 'revision-missing');
        return receipt;
      }),
    };
    const publication = new DurableWorkProposalPublication({
      delegate: delegate as never,
      store: new PostgresWorkIntakeStore(database),
      generatorProvenance: { name: 'work-intake-backstage', version: '1' },
    });
    const actor = authenticatedActorFromPrincipal('user:default/avery');
    const request = {
      profileId: 'jira-work-management',
      artifact: artifact as never,
    };

    await expect(publication.publish(actor, request)).resolves.toEqual(receipt);
    await expect(publication.publish(actor, request)).resolves.toEqual(receipt);

    expect(events).toEqual(['revision-stored']);
    expect(delegate.publishPrepared).toHaveBeenCalledTimes(1);
    expect(delegate.publish).not.toHaveBeenCalled();
  });

  it('retains a partial receipt and its external identities for repair', async () => {
    const artifact = {
      schemaVersion: 2,
      proposal: { id: 'WP-2026-0044', revision: 1 },
    };
    const receipt = {
      profileId: 'jira-work-management',
      proposal: { id: 'WP-2026-0044', revision: 1 },
      artifact: {
        status: 'verified' as const,
        sha256: 'b'.repeat(64),
        filename: 'proposal.json',
        locator: 'jira:NWI-44',
        externalArtifactIds: ['10044'],
      },
      results: [
        {
          placementId: 'jira-proposal',
          adapterId: 'jira',
          targetId: 'NWI',
          localId: 'proposal',
          externalId: 'NWI-44',
          action: 'created' as const,
          canonicalArtifactSha256: 'b'.repeat(64),
        },
      ],
      relations: [],
      notes: ['Review placement failed.'],
      partial: true,
      retryable: true,
    };
    const delegate = {
      profiles: jest.fn().mockResolvedValue([]),
      preview: jest.fn().mockResolvedValue({
        profileId: receipt.profileId,
        artifact: {
          artifact,
          content: '{}',
          sha256: 'b'.repeat(64),
          filename: 'proposal.json',
        },
        records: [],
        relations: [],
        notes: [],
        placements: [],
      }),
      publish: jest.fn(),
      publishPrepared: jest.fn().mockResolvedValue(receipt),
    };
    const publication = new DurableWorkProposalPublication({
      delegate: delegate as never,
      store: new PostgresWorkIntakeStore(database),
      generatorProvenance: { name: 'work-intake-backstage', version: '1' },
    });

    await publication.publish(
      authenticatedActorFromPrincipal('user:default/avery'),
      { profileId: receipt.profileId, artifact: artifact as never },
    );

    await expect(database('publication').first()).resolves.toMatchObject({
      state: 'failed',
      receipt_json: expect.stringContaining('10044'),
    });
    await expect(database('publication_result').first()).resolves.toMatchObject(
      {
        external_id: 'NWI-44',
        artifact_ids: expect.stringContaining('10044'),
      },
    );
  });
});
