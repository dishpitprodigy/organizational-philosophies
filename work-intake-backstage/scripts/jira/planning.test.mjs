import assert from 'node:assert/strict';
import test from 'node:test';

import {
  artifactAttachment,
  buildBootstrapPlan,
  buildPublicationPlan,
  firstPositionalArgument,
  publicationLabel,
  projectionFingerprint,
  resolveArtifactRouting,
} from './planning.mjs';

const groups = [
  {
    metadata: {
      name: 'sre',
      title: 'Site Reliability Engineering',
      annotations: {
        'northstar.example/jira-project-key': 'SRE',
        'northstar.example/technical-reviewer-role': 'Principal SRE',
      },
    },
    spec: { type: 'team' },
  },
  {
    metadata: {
      name: 'platform',
      title: 'Platform Engineering',
      annotations: {
        'northstar.example/jira-project-key': 'PLATFORM',
        'northstar.example/technical-reviewer-role':
          'Principal Platform Engineer',
      },
    },
    spec: { type: 'team' },
  },
  {
    metadata: {
      name: 'security',
      title: 'Information Security',
      annotations: {
        'northstar.example/jira-project-key': 'SECURITY',
        'northstar.example/technical-reviewer-role': 'Security Review Board',
      },
    },
    spec: { type: 'governance' },
  },
];

test('bootstrap creates one intake project and projects only for delivery teams', () => {
  assert.deepEqual(buildBootstrapPlan(groups, []), [
    {
      key: 'NWI',
      name: 'Northstar Work Intake',
      purpose: 'intake',
    },
    {
      key: 'PLATFORM',
      name: 'Platform Engineering Delivery',
      purpose: 'delivery',
    },
    {
      key: 'SRE',
      name: 'Site Reliability Engineering Delivery',
      purpose: 'delivery',
    },
  ]);
});

test('bootstrap omits projects already present in Jira', () => {
  assert.deepEqual(
    buildBootstrapPlan(groups, [{ key: 'NWI' }, { key: 'SRE' }]),
    [
      {
        key: 'PLATFORM',
        name: 'Platform Engineering Delivery',
        purpose: 'delivery',
      },
    ],
  );
});

const artifact = {
  schemaVersion: 1,
  proposal: {
    id: 'WP-2026-0042',
    revision: 0,
    title: 'Select a successor metrics capability',
    state: 'Ready for Ordered Review',
    authority: 'May consume ordered review or bounded Discovery capacity',
    currentState: 'The current metrics capability has three storage tiers.',
    desiredOutcome: 'Select a supportable capability using retained evidence.',
    requiredDifference: 'Compare retain, redesign, adopt, and buy options.',
    requirements: ['Every candidate shall execute the same workload.'],
    acceptanceConditions: ['The Decision Owner records the selected option.'],
  },
  reviews: [
    {
      stage: 1,
      name: 'Administrative Authority Review',
      decisionOwner: 'Technology Portfolio Council',
      state: 'Ready for review',
    },
    {
      stage: 2,
      name: 'Security Review Board',
      decisionOwner: 'Security Review Board',
      state: 'Waiting for predecessor',
    },
  ],
  routingRequest: {
    affectedEntities: ['component:default/metrics-service'],
    facts: { production: true },
  },
  candidateDelivery: {
    authorized: false,
    reason: 'No Authorized Work Proposal or Capacity Acceptance exists.',
    records: [
      {
        id: 'metrics-discovery',
        type: 'Discovery Work Package',
        ownerEntity: 'component:default/metrics-service',
        affectedEntities: ['component:default/metrics-service'],
        title: 'Evaluate candidate metrics capabilities',
        outcome: 'Produce the accepted Selection Decision Record.',
        deliveryDependsOn: [],
      },
    ],
  },
};

test('artifact attachments are canonical, content-addressed JSON', () => {
  const first = artifactAttachment({
    proposal: { revision: 0, id: 'WP-2026-0042' },
    z: true,
    a: { second: 2, first: 1 },
  });
  const second = artifactAttachment({
    a: { first: 1, second: 2 },
    z: true,
    proposal: { id: 'WP-2026-0042', revision: 0 },
  });

  assert.equal(first.content, second.content);
  assert.equal(first.sha256, second.sha256);
  assert.equal(first.filename, `WP-2026-0042-rev-0-${first.sha256}.json`);
  assert.match(first.content, /^\{\n  "a":/);
});

const catalogEntities = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    metadata: {
      name: 'sre',
      title: 'Site Reliability Engineering',
      annotations: {
        'northstar.example/jira-project-key': 'SRE',
        'northstar.example/technical-reviewer-role': 'Principal SRE',
      },
    },
    spec: { type: 'team' },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    metadata: {
      name: 'platform',
      title: 'Platform Engineering',
      annotations: {
        'northstar.example/jira-project-key': 'PLATFORM',
        'northstar.example/technical-reviewer-role':
          'Principal Platform Engineer',
      },
    },
    spec: { type: 'team' },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    metadata: {
      name: 'security',
      annotations: {
        'northstar.example/jira-project-key': 'SECURITY',
        'northstar.example/technical-reviewer-role': 'Security Review Board',
      },
    },
    spec: { type: 'governance' },
  },
  ...[
    ['portfolio', 'Technology Portfolio Council'],
    ['privacy', 'Privacy Counsel'],
    ['finance', 'Technology Finance Partner'],
    ['architecture', 'Architecture Review Council'],
  ].map(([name, reviewer]) => ({
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    metadata: {
      name,
      annotations: {
        'northstar.example/technical-reviewer-role': reviewer,
      },
    },
    spec: { type: 'governance' },
  })),
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'metrics-service',
      tags: ['production'],
      annotations: {
        'northstar.example/work-intake-review-profile':
          'production-observability',
        'northstar.example/depends-on': 'component:default/container-runtime',
      },
    },
    relations: [{ type: 'ownedBy', targetRef: 'group:default/sre' }],
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: { name: 'container-runtime' },
    relations: [{ type: 'ownedBy', targetRef: 'group:default/platform' }],
  },
];

test('reviewable proposal publishes intake and review projections, not candidate delivery', () => {
  const plan = buildPublicationPlan(
    resolveArtifactRouting(artifact, catalogEntities),
  );

  assert.deepEqual(plan.issues[0], {
    ...plan.issues[0],
    localId: 'proposal',
    projectKey: 'NWI',
    issueType: 'Epic',
  });
  assert.ok(plan.issues.slice(1).every(issue => issue.projectKey === 'NWI'));
  assert.ok(plan.issues.slice(1).every(issue => issue.issueType === 'Task'));
  assert.equal(plan.links.length, 0);
  assert.match(plan.notes[0], /Candidate delivery was not published/);
});

test('schema version 2 renders Jira prose from atomic evidence', () => {
  const atomic = structuredClone(artifact);
  atomic.schemaVersion = 2;
  atomic.form = { id: 'technical-work-proposal', version: 1 };
  atomic.proposal.currentState = {
    summary: 'The current metrics capability has three storage tiers.',
    baseline: {
      mode: 'reference',
      reference: 'OBS-ARCH-004 rev 7',
      delta: 'Storage hardware changed; topology did not.',
    },
    architecture: 'Thirty-eight collectors feed three retention tiers.',
    workloadEvidence: 'OBS-WORKLOAD-2026-05 records the measured workload.',
    constraints: 'Support ends March 31, 2027.',
  };
  atomic.proposal.desiredOutcome = {
    summary: 'Select a supportable capability using retained evidence.',
    scope: 'Shared engineering metrics.',
    capability: 'A supportable capability is selected.',
    proof: 'The accepted workload passes.',
    horizon: 'Five years.',
  };
  atomic.proposal.requiredDifference = {
    summary: 'Compare retain, redesign, adopt, and buy options.',
    preserve: 'Prometheus interfaces.',
    change: 'Remove the support deadline.',
    evidenceBasis: 'Use the same retained workload.',
  };
  atomic.proposal.requirements = [
    {
      id: 'SHALL-001',
      modality: 'shall',
      condition: 'The candidate shall execute the same workload.',
      verification: 'Replay and reconcile OBS-WORKLOAD-2026-05.',
    },
  ];
  atomic.proposal.acceptanceConditions = [
    {
      id: 'AC-001',
      context: 'Equivalent proof work ends.',
      result: 'The Decision Owner records the selected option.',
      evidenceMethod: 'Accepted Selection Decision Record.',
    },
  ];

  const plan = buildPublicationPlan(
    resolveArtifactRouting(atomic, catalogEntities),
  );
  const description = plan.issues[0].description;

  assert.match(description, /Baseline: OBS-ARCH-004 rev 7/);
  assert.match(
    description,
    /SHALL-001: The candidate shall execute the same workload\./,
  );
  assert.match(description, /Verification: Replay and reconcile/);
  assert.match(
    description,
    /AC-001: Given Equivalent proof work ends\., The Decision Owner records/,
  );
  assert.doesNotMatch(description, /\[object Object\]/);
});

test('an unverified schema-v2 draft is indexed without creating review work', () => {
  const draft = structuredClone(artifact);
  draft.schemaVersion = 2;
  draft.proposal.state = 'Draft Work Proposal — sponsor acceptance unverified';
  draft.proposal.authority = 'No authority granted';
  draft.proposal.currentState = {
    summary: artifact.proposal.currentState,
    baseline: { mode: 'define' },
    architecture: artifact.proposal.currentState,
    workloadEvidence: 'Measured workload evidence.',
    constraints: 'Observed operating constraints.',
  };
  draft.proposal.desiredOutcome = {
    summary: artifact.proposal.desiredOutcome,
    scope: 'Shared engineering metrics.',
    capability: artifact.proposal.desiredOutcome,
    proof: 'The accepted proof corpus passes.',
    horizon: 'Five years.',
  };
  draft.proposal.requiredDifference = {
    summary: artifact.proposal.requiredDifference,
    preserve: 'Existing interfaces.',
    change: artifact.proposal.requiredDifference,
    evidenceBasis: 'The retained workload.',
  };
  draft.proposal.requirements = [
    {
      id: 'SHALL-001',
      modality: 'shall',
      condition: artifact.proposal.requirements[0],
      verification: 'Run the retained workload.',
    },
  ];
  draft.proposal.acceptanceConditions = [
    {
      id: 'AC-001',
      context: 'Proof ends.',
      result: artifact.proposal.acceptanceConditions[0],
      evidenceMethod: 'Accepted decision record.',
    },
  ];
  draft.proposal.sponsor = {
    accepted: false,
    assertedAccepted: true,
    verificationStatus: 'unverified',
  };

  const plan = buildPublicationPlan(
    resolveArtifactRouting(draft, catalogEntities),
  );

  assert.deepEqual(
    plan.issues.map(issue => issue.localId),
    ['proposal'],
  );
  assert.match(plan.notes.join('\n'), /sponsor approval/i);
});

test('publication planning rejects reviews that were not resolved by Backstage', () => {
  assert.throws(
    () => buildPublicationPlan(artifact),
    /must be resolved through the Backstage catalog/,
  );
});

test('authorized candidate delivery is routed but remains outside the intake hierarchy', () => {
  const authorized = structuredClone(artifact);
  authorized.candidateDelivery.authorized = true;
  authorized.candidateDelivery.authorization = {
    authorizedWorkProposal: {
      id: 'AWP-2026-0017',
      state: 'Authorized',
      proposalId: 'WP-2026-0042',
      proposalRevision: 0,
    },
    planningInterval: 'FY2027 Q1',
    acceptanceAuthority: {
      decisionOwner: 'Director of Research Infrastructure',
      state: 'Accepted',
    },
    capacityAcceptances: [
      { projectKey: 'SRE', state: 'Accepted' },
      { projectKey: 'PLATFORM', state: 'Accepted' },
    ],
  };
  authorized.candidateDelivery.records.push({
    id: 'platform-readiness',
    type: 'Epic candidate',
    ownerEntity: 'component:default/container-runtime',
    affectedEntities: ['component:default/container-runtime'],
    title: 'Prepare platform capacity for the selected capability',
    outcome: 'The selected capability can operate on the platform.',
    deliveryDependsOn: ['metrics-discovery'],
  });

  const plan = buildPublicationPlan(
    resolveArtifactRouting(authorized, catalogEntities),
  );

  assert.deepEqual(
    plan.issues
      .filter(issue => issue.localId.startsWith('delivery-'))
      .map(issue => [issue.localId, issue.projectKey]),
    [
      ['delivery-metrics-discovery', 'SRE'],
      ['delivery-platform-readiness', 'PLATFORM'],
    ],
  );
  assert.deepEqual(plan.links, [
    {
      type: 'Blocks',
      inwardLocalId: 'delivery-platform-readiness',
      outwardLocalId: 'delivery-metrics-discovery',
    },
    {
      type: 'Relates',
      inwardLocalId: 'delivery-metrics-discovery',
      outwardLocalId: 'proposal',
    },
    {
      type: 'Relates',
      inwardLocalId: 'delivery-platform-readiness',
      outwardLocalId: 'proposal',
    },
  ]);
});

test('candidate delivery requires complete authority and capacity evidence', () => {
  const invalid = structuredClone(artifact);
  invalid.candidateDelivery.authorized = true;
  invalid.candidateDelivery.authorization = {
    authorizedWorkProposal: {
      id: 'AWP-2026-0017',
      state: 'Authorized',
      proposalId: 'WP-2026-0042',
      proposalRevision: 0,
    },
    planningInterval: 'FY2027 Q1',
    acceptanceAuthority: {
      decisionOwner: 'Director of Research Infrastructure',
      state: 'Accepted',
    },
    capacityAcceptances: [{ projectKey: 'SRE', state: 'Not accepted' }],
  };

  assert.throws(
    () =>
      buildPublicationPlan(resolveArtifactRouting(invalid, catalogEntities)),
    /Capacity Acceptance is missing for SRE/,
  );
});

test('Backstage resolves ownership, project routing, and dependency closure', () => {
  const routed = resolveArtifactRouting(artifact, catalogEntities);
  assert.deepEqual(routed.candidateDelivery.records[0].routingEvidence, {
    source: 'backstage-catalog',
    ownerEntity: 'component:default/metrics-service',
    ownerGroup: 'group:default/sre',
    projectKey: 'SRE',
    affectedEntities: [
      'component:default/metrics-service',
      'component:default/container-runtime',
    ],
  });
});

test('Backstage replaces artifact review claims with catalog-derived review routing', () => {
  const request = structuredClone(artifact);
  request.reviews = [
    {
      stage: 99,
      name: 'Requester-chosen review',
      decisionOwner: 'Requester',
      state: 'Approved',
    },
  ];
  request.routingRequest = {
    affectedEntities: ['component:default/metrics-service'],
    facts: { purchase: true, intent: 'Redesign' },
  };

  const routed = resolveArtifactRouting(request, catalogEntities);
  assert.deepEqual(routed.routingRequest.routingEvidence, {
    source: 'backstage-catalog',
    affectedEntities: [
      'component:default/metrics-service',
      'component:default/container-runtime',
    ],
  });
  assert.deepEqual(
    routed.reviews.map(review => [
      review.stage,
      review.name,
      review.decisionOwner,
    ]),
    [
      [1, 'Administrative Authority Review', 'Technology Portfolio Council'],
      [2, 'Security Review Board', 'Security Review Board'],
      [3, 'Finance & Procurement Review', 'Technology Finance Partner'],
      [3, 'Architecture Review', 'Architecture Review Council'],
      [3, 'Reliability & Operations Review', 'Principal SRE'],
      [3, 'Site Reliability Engineering Technical Review', 'Principal SRE'],
      [
        3,
        'Platform Engineering Technical Review',
        'Principal Platform Engineer',
      ],
    ],
  );
});

test('governance groups cannot own candidate delivery', () => {
  const invalid = structuredClone(artifact);
  invalid.candidateDelivery.records[0].ownerEntity = 'group:default/security';
  assert.throws(
    () => resolveArtifactRouting(invalid, catalogEntities),
    /must resolve to a Backstage delivery team/,
  );
});

test('artifact cannot route delivery through a team that owns no affected entity', () => {
  const invalid = structuredClone(artifact);
  invalid.candidateDelivery.records[0].ownerEntity = 'group:default/platform';
  invalid.candidateDelivery.records[0].affectedEntities = [
    'component:default/metrics-service',
  ];
  catalogEntities.find(
    entity => entity.metadata?.name === 'metrics-service',
  ).metadata.annotations['northstar.example/depends-on'] = '';

  try {
    assert.throws(
      () => resolveArtifactRouting(invalid, catalogEntities),
      /does not show group:default\/platform owning an affected entity/,
    );
  } finally {
    catalogEntities.find(
      entity => entity.metadata?.name === 'metrics-service',
    ).metadata.annotations['northstar.example/depends-on'] =
      'component:default/container-runtime';
  }
});

test('authorization must govern the exact proposal revision', () => {
  const invalid = structuredClone(artifact);
  invalid.candidateDelivery.authorized = true;
  invalid.candidateDelivery.authorization = {
    authorizedWorkProposal: {
      id: 'AWP-2026-0017',
      state: 'Authorized',
      proposalId: 'WP-2026-9999',
      proposalRevision: 0,
    },
    planningInterval: 'FY2027 Q1',
    acceptanceAuthority: {
      decisionOwner: 'Director of Research Infrastructure',
      state: 'Accepted',
    },
    capacityAcceptances: [{ projectKey: 'SRE', state: 'Accepted' }],
  };
  assert.throws(
    () =>
      buildPublicationPlan(resolveArtifactRouting(invalid, catalogEntities)),
    /does not govern this proposal revision/,
  );
});

test('candidate delivery rejects unmodeled record types', () => {
  const invalid = structuredClone(artifact);
  invalid.candidateDelivery.authorized = true;
  invalid.candidateDelivery.authorization = {
    authorizedWorkProposal: {
      id: 'AWP-2026-0017',
      state: 'Authorized',
      proposalId: 'WP-2026-0042',
      proposalRevision: 0,
    },
    planningInterval: 'FY2027 Q1',
    acceptanceAuthority: {
      decisionOwner: 'Director of Research Infrastructure',
      state: 'Accepted',
    },
    capacityAcceptances: [{ projectKey: 'SRE', state: 'Accepted' }],
  };
  invalid.candidateDelivery.records[0].type = 'Selection ADR';

  assert.throws(
    () =>
      buildPublicationPlan(resolveArtifactRouting(invalid, catalogEntities)),
    /Unsupported candidate delivery type: Selection ADR/,
  );
});

test('publication labels are deterministic and Jira-safe', () => {
  assert.equal(
    publicationLabel('WP-2026-0042', 0, 'review-1'),
    publicationLabel('WP-2026-0042', 0, 'review-1'),
  );
  assert.match(
    publicationLabel('WP-2026-0042', 0, 'review-1'),
    /^nwi-[a-f0-9]{16}$/,
  );
});

test('projection fingerprints change when Jira-visible content changes', () => {
  const issue = buildPublicationPlan(
    resolveArtifactRouting(artifact, catalogEntities),
  ).issues[0];
  const changed = { ...issue, description: `${issue.description}\nchanged` };
  assert.notEqual(projectionFingerprint(issue), projectionFingerprint(changed));
});

test('publish CLI selects the artifact after Node and script arguments', () => {
  assert.equal(
    firstPositionalArgument([
      '--apply',
      'examples/northstar/metrics-work-proposal.json',
    ]),
    'examples/northstar/metrics-work-proposal.json',
  );
});
