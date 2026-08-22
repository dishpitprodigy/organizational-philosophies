import { workProposalArtifactSchema } from './artifactSchema';

function atomicArtifact() {
  return {
    schemaVersion: 2,
    form: { id: 'technical-work-proposal', version: 1 },
    answers: {
      'proposal.current-state.baseline-mode': 'reference',
      'proposal.requirements': [
        {
          id: 'SHALL-001',
          modality: 'shall',
          condition: 'The candidate shall sustain the accepted workload.',
          verification: 'Replay and reconcile the retained workload.',
        },
      ],
    },
    submission: {
      requester: 'Avery Shah',
      requestingTeam: 'group:default/sre',
      source: 'backstage-work-intake',
      authenticatedActor: 'user:default/avery-shah',
      submittedAt: '2026-08-05T12:00:00.000Z',
    },
    proposal: {
      id: 'WP-2026-0042',
      revision: 0,
      title: 'Select the next engineering metrics capability',
      state: 'Work Proposal — Ready for Ordered Review',
      authority: 'May consume ordered review or bounded Discovery capacity',
      problem: {
        statement:
          'The current metrics service cannot remain supported at the forecast workload.',
        benefit:
          'Closing the gap preserves reliable alerting and returns operating capacity to SRE.',
      },
      currentState: {
        summary: 'The current metrics capability is measurable but expiring.',
        baseline: {
          mode: 'reference',
          reference: 'OBS-ARCH-004 rev 7',
          delta: 'Storage hardware changed; topology did not.',
        },
        architecture: 'Thirty-eight collectors feed three retention tiers.',
        workloadEvidence: 'OBS-WORKLOAD-2026-05 records the measured workload.',
        constraints:
          'Support ends March 31, 2027; recurring work is 56 hours per month.',
      },
      desiredOutcome: {
        summary: 'Northstar has selected a metrics capability.',
        scope: 'All shared engineering metrics producers and consumers.',
        capability: 'A supported, operable metrics capability is selected.',
        proof: 'The accepted workload and failure corpus passes.',
        horizon: 'Five years.',
      },
      requiredDifference: {
        summary: 'The support, capacity, and operating gaps are removed.',
        preserve: 'Prometheus and retention contracts.',
        change: 'Remove the support and capacity deadlines.',
        evidenceBasis: 'Use the same retained workload for every option.',
      },
      requirements: [
        {
          id: 'SHALL-001',
          modality: 'shall',
          condition: 'The candidate shall sustain 1.74M samples per second.',
          verification: 'Replay and reconcile the retained workload.',
        },
      ],
      acceptanceConditions: [
        {
          id: 'AC-001',
          context: 'Equivalent proof work ends.',
          result: 'Every SHALL has retained evidence.',
          evidenceMethod: 'Requirement compliance matrix.',
        },
      ],
      nonGoals: [
        {
          id: 'NG-001',
          exclusion: 'Do not migrate a producer.',
          reason: 'Selection does not authorize delivery.',
        },
      ],
      affectedEntities: ['system:default/metrics-alerting-platform'],
      dependencies: [
        {
          id: 'DEP-001',
          dependency: 'Versioned workload replay',
          owner: 'group:default/sre',
          contribution: 'Freeze the replay before testing.',
          evidence: 'Signed input manifest.',
        },
      ],
      preconditions: [
        {
          id: 'PRE-001',
          condition: 'The current baseline is accepted.',
          evidenceOwner: 'group:default/sre',
        },
      ],
      sponsor: {
        name: 'VP, Infrastructure & Reliability',
        level: 'Vice President',
        accepted: false,
        assertedAccepted: true,
        verificationStatus: 'unverified',
        evidence:
          'No durable, attributable sponsor approval is attached to this prototype revision.',
      },
      acceptanceAuthority: 'VP, Infrastructure & Reliability',
      knownUncertainty: {
        present: true,
        question: 'Which option passes the common test basis?',
      },
    },
    classifications: {
      workFunctions: ['observability'],
      decisionImpacts: ['shared-platform'],
      tags: [],
    },
    routingRequest: {
      affectedEntities: ['system:default/metrics-alerting-platform'],
      facts: { intent: 'Discovery' },
    },
    candidateDelivery: {
      authorized: false,
      reason: 'Review does not authorize delivery.',
      records: [],
    },
  };
}

describe('atomic Work Proposal artifact schema', () => {
  it('accepts individually identified evidence', () => {
    const result = workProposalArtifactSchema.parse(atomicArtifact());
    expect(result.proposal.requirements[0].id).toBe('SHALL-001');
    expect(result.proposal.acceptanceConditions[0].evidenceMethod).toBe(
      'Requirement compliance matrix.',
    );
  });

  it('rejects flattened requirements in schema version 2', () => {
    const artifact = atomicArtifact();
    artifact.proposal.requirements = [
      'The candidate shall sustain 1.74M samples per second.',
    ] as never;

    expect(workProposalArtifactSchema.safeParse(artifact).success).toBe(false);
  });

  it('requires an explicit Current-State Baseline mode', () => {
    const artifact = atomicArtifact();
    delete (artifact.proposal.currentState.baseline as { mode?: string }).mode;

    expect(workProposalArtifactSchema.safeParse(artifact).success).toBe(false);
  });

  it('requires the problem and the benefit of solving it as separate evidence', () => {
    const artifact = atomicArtifact();
    delete (artifact.proposal as { problem?: unknown }).problem;

    expect(workProposalArtifactSchema.safeParse(artifact).success).toBe(false);
  });

  it('rejects artifacts without backend-bound submission provenance', () => {
    const artifact = atomicArtifact();
    delete (artifact.submission as { authenticatedActor?: string })
      .authenticatedActor;
    delete (artifact.submission as { submittedAt?: string }).submittedAt;

    expect(workProposalArtifactSchema.safeParse(artifact).success).toBe(false);
  });

  it('does not accept a browser assertion as verified sponsor approval', () => {
    const artifact = atomicArtifact();
    artifact.proposal.sponsor.accepted = true;

    expect(workProposalArtifactSchema.safeParse(artifact).success).toBe(false);
  });
});
