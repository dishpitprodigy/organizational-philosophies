import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildBootstrapPlan,
  buildPublicationPlan,
  firstPositionalArgument,
  publicationLabel,
  resolveArtifactRouting,
} from './planning.mjs';

const groups = [
  {
    metadata: {
      name: 'sre',
      title: 'Site Reliability Engineering',
      annotations: { 'northstar.example/jira-project-key': 'SRE' },
    },
    spec: { type: 'team' },
  },
  {
    metadata: {
      name: 'platform',
      title: 'Platform Engineering',
      annotations: { 'northstar.example/jira-project-key': 'PLATFORM' },
    },
    spec: { type: 'team' },
  },
  {
    metadata: {
      name: 'security',
      title: 'Information Security',
      annotations: { 'northstar.example/jira-project-key': 'SECURITY' },
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

const catalogEntities = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    metadata: {
      name: 'sre',
      annotations: { 'northstar.example/jira-project-key': 'SRE' },
    },
    spec: { type: 'team' },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    metadata: {
      name: 'platform',
      annotations: { 'northstar.example/jira-project-key': 'PLATFORM' },
    },
    spec: { type: 'team' },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    metadata: {
      name: 'security',
      annotations: { 'northstar.example/jira-project-key': 'SECURITY' },
    },
    spec: { type: 'governance' },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: { name: 'metrics-service' },
    relations: [
      { type: 'ownedBy', targetRef: 'group:default/sre' },
      { type: 'dependsOn', targetRef: 'component:default/container-runtime' },
    ],
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: { name: 'container-runtime' },
    relations: [{ type: 'ownedBy', targetRef: 'group:default/platform' }],
  },
];

test('reviewable proposal publishes intake and review projections, not candidate delivery', () => {
  const plan = buildPublicationPlan(artifact);

  assert.deepEqual(
    plan.issues.map(issue => [
      issue.localId,
      issue.projectKey,
      issue.issueType,
    ]),
    [
      ['proposal', 'NWI', 'Epic'],
      ['review-1', 'NWI', 'Task'],
      ['review-2', 'NWI', 'Task'],
    ],
  );
  assert.equal(plan.links.length, 0);
  assert.match(plan.notes[0], /Candidate delivery was not published/);
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
    plan.issues.slice(3).map(issue => [issue.localId, issue.projectKey]),
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

test('governance groups cannot own candidate delivery', () => {
  const invalid = structuredClone(artifact);
  invalid.candidateDelivery.records[0].ownerEntity = 'group:default/security';
  assert.throws(
    () => resolveArtifactRouting(invalid, catalogEntities),
    /must resolve to a Backstage delivery team/,
  );
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

test('publish CLI selects the artifact after Node and script arguments', () => {
  assert.equal(
    firstPositionalArgument([
      '--apply',
      'examples/northstar/metrics-work-proposal.json',
    ]),
    'examples/northstar/metrics-work-proposal.json',
  );
});
