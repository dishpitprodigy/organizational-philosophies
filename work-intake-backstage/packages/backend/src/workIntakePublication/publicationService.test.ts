import { workProposalArtifactSchema } from '../workIntake/domain/artifactSchema';
import {
  authenticatedActorFromPrincipal,
  ArtifactStore,
  JournalEntry,
  JournalKey,
  PublicationJournal,
  PublicationTarget,
} from './contracts';
import {
  jiraWorkManagementProfile,
  mixedAtlassianProfile,
  targetBindings,
} from './fixtures/profiles';
import {
  CatalogPublicationResolver,
  PublicationService,
} from './publicationService';

function artifact() {
  return workProposalArtifactSchema.parse({
    schemaVersion: 2,
    form: { id: 'technical-work-proposal', version: 1 },
    answers: {},
    submission: {
      requester: 'Avery Shah',
      requestingTeam: 'group:default/sre',
      source: 'backstage-work-intake',
      authenticatedActor: 'user:default/avery',
      submittedAt: '2026-08-10T12:00:00.000Z',
    },
    proposal: {
      id: 'WP-1',
      revision: 4,
      title: 'Choose metrics capability',
      state: 'Ready for Ordered Review',
      authority: 'Review only',
      currentState: {
        summary: 'Support is expiring.',
        baseline: { mode: 'reference', reference: 'OBS-1' },
        architecture: 'Collectors feed storage.',
        workloadEvidence: 'A retained replay exists.',
        constraints: 'Support ends in 2027.',
      },
      desiredOutcome: {
        summary: 'A capability is selected.',
        scope: 'Shared metrics',
        capability: 'Supported metrics',
        proof: 'Replay passes',
        horizon: 'Five years',
      },
      requiredDifference: {
        summary: 'Support gap closes.',
        preserve: 'Protocols',
        change: 'Lifecycle',
        evidenceBasis: 'Common replay',
      },
      requirements: [
        {
          id: 'SHALL-1',
          modality: 'shall',
          condition: 'Sustain workload',
          verification: 'Replay',
        },
      ],
      acceptanceConditions: [
        {
          id: 'AC-1',
          context: 'Replay complete',
          result: 'Evidence retained',
          evidenceMethod: 'Manifest',
        },
      ],
      nonGoals: [
        { id: 'NG-1', exclusion: 'No migration', reason: 'Not authorized' },
      ],
      affectedEntities: ['system:default/metrics'],
      dependencies: [],
      preconditions: [],
      sponsor: {
        name: 'VP Infrastructure',
        level: 'VP',
        accepted: true,
        assertedAccepted: true,
        verificationStatus: 'verified',
        acceptedBy: 'user:default/sponsor',
        acceptedAt: '2026-08-10T11:00:00.000Z',
        evidence: 'Signed decision',
      },
      acceptanceAuthority: 'VP Infrastructure',
      knownUncertainty: { present: false, question: '' },
    },
    classifications: { workFunctions: [], decisionImpacts: [], tags: [] },
    routingRequest: {
      affectedEntities: ['system:default/metrics'],
      facts: { requestedProject: 'EVIL' },
    },
    candidateDelivery: {
      authorized: false,
      reason: 'Not authorized',
      records: [],
    },
    reviews: [
      { stage: 99, name: 'Browser supplied', decisionOwner: 'attacker' },
    ],
  });
}

function service(
  target: PublicationTarget,
  catalog: CatalogPublicationResolver,
  execution?: { journal: PublicationJournal; artifactStore: ArtifactStore },
) {
  return new PublicationService({
    profiles: [jiraWorkManagementProfile],
    targetBindings,
    targets: new Map([[target.id, target]]),
    catalog,
    resolveConfig: () => ({}),
    ...execution,
  });
}

describe('PublicationService preview', () => {
  it('re-derives review work and routing without external writes', async () => {
    let writes = 0;
    const target: PublicationTarget = {
      id: 'jira',
      status: async () => ({ available: true }),
      observe: async () => ({ results: [] }),
      apply: async () => {
        writes += 1;
        return { results: [], relations: [] };
      },
    };
    const catalog: CatalogPublicationResolver = {
      resolve: async () => ({
        proposalRouting: {
          affectedEntities: ['system:default/metrics'],
          evidence: { source: 'backstage-catalog' },
        },
        reviews: [
          {
            stage: 1,
            name: 'Architecture Review',
            decisionOwner: 'group:default/architecture',
            reason: 'Catalog dependency closure',
          },
        ],
        deliveries: {},
      }),
    };

    const plan = await service(target, catalog).preview(
      authenticatedActorFromPrincipal('user:default/avery'),
      { profileId: 'jira-work-management', artifact: artifact() },
    );

    expect(writes).toBe(0);
    expect(plan.records.map(record => record.localId)).toEqual([
      'proposal',
      'review-1',
    ]);
    expect(plan.records[1].title).toContain('Architecture Review');
    expect(JSON.stringify(plan)).not.toContain('Browser supplied');
    expect(plan.placements.map(item => item.binding.target.targetId)).toEqual([
      'NWI',
      'NWI',
    ]);
  });

  it('places discovery proposals in JPD and ordered reviews in Jira', async () => {
    const available = (id: string): PublicationTarget => ({
      id,
      status: async () => ({ available: true }),
      observe: async () => ({ results: [] }),
      apply: async () => ({ results: [], relations: [] }),
    });
    const catalog: CatalogPublicationResolver = {
      resolve: async () => ({
        proposalRouting: {
          affectedEntities: ['system:default/metrics'],
          evidence: { source: 'backstage-catalog' },
        },
        reviews: [
          {
            stage: 1,
            name: 'Architecture Review',
            decisionOwner: 'group:default/architecture',
            reason: 'Catalog dependency closure',
          },
        ],
        deliveries: {},
      }),
    };
    const publication = new PublicationService({
      profiles: [mixedAtlassianProfile],
      targetBindings,
      targets: new Map([
        ['jpd', available('jpd')],
        ['jira', available('jira')],
      ]),
      catalog,
      resolveConfig: () => ({}),
    });

    const plan = await publication.preview(
      authenticatedActorFromPrincipal('user:default/avery'),
      { profileId: 'atlassian-discovery', artifact: artifact() },
    );

    expect(
      plan.placements.map(item => [
        item.placement.role,
        item.binding.adapterId,
        item.binding.target.targetId,
      ]),
    ).toEqual([
      ['proposal', 'jpd', 'MDP'],
      ['review', 'jira', 'NWI'],
    ]);
  });
});

describe('PublicationService publish', () => {
  it('persists and verifies the artifact before dependent work and reuses a retry', async () => {
    const events: string[] = [];
    const external = new Map<string, string>();
    let creates = 0;
    const target: PublicationTarget = {
      id: 'jira',
      status: async () => ({ available: true }),
      observe: async batch => ({
        results: batch.records.map(record =>
          external.has(record.localId)
            ? {
                localId: record.localId,
                status: 'found' as const,
                externalId: external.get(record.localId),
                targetFingerprint: batch.targetFingerprints[record.localId],
              }
            : { localId: record.localId, status: 'absent' as const },
        ),
      }),
      apply: async batch => {
        creates += 1;
        events.push(`apply:${batch.placementId}`);
        return {
          results: batch.records.map(record => {
            const externalId = `${batch.binding.target.targetId}-${
              external.size + 1
            }`;
            external.set(record.localId, externalId);
            return {
              localId: record.localId,
              idempotencyKey: record.idempotencyKey,
              targetFingerprint: batch.targetFingerprints[record.localId],
              externalId,
              action: 'created' as const,
            };
          }),
          relations: [],
        };
      },
    };
    const entries = new Map<string, JournalEntry>();
    const key = (value: JournalKey) =>
      [
        value.profileId,
        value.placementId,
        value.adapterId,
        value.targetId,
        value.proposalId,
        value.proposalRevision,
        value.localId,
      ].join(':');
    const journal: PublicationJournal = {
      withLock: async (_identity, operation) => operation(),
      observe: async keys => ({
        entries: keys.flatMap(item => entries.get(key(item)) ?? []),
      }),
      reserve: async values =>
        values.forEach(value => entries.set(key(value), value)),
      recordPublished: async values =>
        values.forEach(value => entries.set(key(value), value)),
    };
    const artifactStore: ArtifactStore = {
      persist: async canonical => {
        events.push('artifact:persist');
        return {
          sha256: canonical.sha256,
          filename: canonical.filename,
          locator: 'memory:artifact',
        };
      },
      verify: async () => {
        events.push('artifact:verify');
      },
    };
    const catalog: CatalogPublicationResolver = {
      resolve: async () => ({
        proposalRouting: {
          affectedEntities: ['system:default/metrics'],
          evidence: { source: 'backstage-catalog' },
        },
        reviews: [
          {
            stage: 1,
            name: 'Architecture Review',
            decisionOwner: 'group:default/architecture',
            reason: 'Catalog dependency closure',
          },
        ],
        deliveries: {},
      }),
    };
    const publication = service(target, catalog, { journal, artifactStore });
    const request = { profileId: 'jira-work-management', artifact: artifact() };
    const actor = authenticatedActorFromPrincipal('user:default/avery');

    const first = await publication.publish(actor, request);
    const second = await publication.publish(actor, request);

    expect(events.slice(0, 4)).toEqual([
      'apply:jira-proposal',
      'artifact:persist',
      'artifact:verify',
      'apply:jira-reviews',
    ]);
    expect(first.results).toHaveLength(2);
    expect(second.results.every(result => result.action === 'reused')).toBe(
      true,
    );
    expect(creates).toBe(2);
  });
});
