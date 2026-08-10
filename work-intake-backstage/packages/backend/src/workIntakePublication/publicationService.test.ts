import { workProposalArtifactSchema } from '../workIntake/domain/artifactSchema';
import {
  authenticatedActorFromPrincipal,
  PublicationTarget,
} from './contracts';
import { jiraWorkManagementProfile, targetBindings } from './fixtures/profiles';
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
) {
  return new PublicationService({
    profiles: [jiraWorkManagementProfile],
    targetBindings,
    targets: new Map([[target.id, target]]),
    catalog,
    resolveConfig: () => ({}),
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
});
