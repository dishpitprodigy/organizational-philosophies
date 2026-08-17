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
      publish: jest.fn().mockImplementation(async () => {
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
    expect(delegate.publish).toHaveBeenCalledTimes(1);
  });
});
