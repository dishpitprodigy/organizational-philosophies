import { createHash } from 'node:crypto';

const JIRA_PROJECT_ANNOTATION = 'northstar.example/jira-project-key';

function entityRef(entity) {
  const kind = entity.kind?.toLowerCase();
  const namespace = entity.metadata?.namespace?.toLowerCase() ?? 'default';
  const name = entity.metadata?.name?.toLowerCase();
  return `${kind}:${namespace}/${name}`;
}

function normalizedEntityRef(ref) {
  const match = String(ref).match(/^([^:]+):(?:(.+)\/)?([^/]+)$/);
  if (!match) throw new Error(`Invalid Backstage entity reference: ${ref}`);
  return `${match[1].toLowerCase()}:${(
    match[2] ?? 'default'
  ).toLowerCase()}/${match[3].toLowerCase()}`;
}

function dependencyClosure(startRefs, entitiesByRef) {
  const discovered = new Set();
  const queue = [...startRefs].map(normalizedEntityRef);
  while (queue.length) {
    const ref = queue.shift();
    if (discovered.has(ref)) continue;
    const entity = entitiesByRef.get(ref);
    if (!entity) throw new Error(`Backstage catalog entity not found: ${ref}`);
    discovered.add(ref);
    for (const relation of entity.relations ?? []) {
      if (relation.type === 'dependsOn') queue.push(relation.targetRef);
    }
  }
  return [...discovered];
}

export function firstPositionalArgument(arguments_) {
  return arguments_.find(argument => !argument.startsWith('--'));
}

export function buildBootstrapPlan(groups, existingProjects) {
  const existingKeys = new Set(existingProjects.map(project => project.key));
  const projects = [
    {
      key: 'NWI',
      name: 'Northstar Work Intake',
      purpose: 'intake',
    },
    ...groups
      .filter(group => group.spec?.type === 'team')
      .map(group => ({
        key: group.metadata?.annotations?.[JIRA_PROJECT_ANNOTATION],
        name: `${group.metadata?.title ?? group.metadata?.name} Delivery`,
        purpose: 'delivery',
      }))
      .filter(project => project.key)
      .sort((left, right) => left.key.localeCompare(right.key)),
  ];

  return projects.filter(project => !existingKeys.has(project.key));
}

export function publicationLabel(proposalId, revision, localId) {
  const digest = createHash('sha256')
    .update(`${proposalId}:rev-${revision}:${localId}`)
    .digest('hex')
    .slice(0, 16);
  return `nwi-${digest}`;
}

function required(value, message) {
  if (value === undefined || value === null || value === '') {
    throw new Error(message);
  }
  return value;
}

export function resolveArtifactRouting(artifact, catalogEntities) {
  const routed = structuredClone(artifact);
  const entitiesByRef = new Map(
    catalogEntities.map(entity => [entityRef(entity), entity]),
  );

  routed.candidateDelivery ??= { authorized: false, records: [] };
  routed.candidateDelivery.records = routed.candidateDelivery.records.map(
    record => {
      const ownerRef = normalizedEntityRef(
        required(
          record.ownerEntity,
          `Delivery record ${record.id} requires a Backstage ownerEntity.`,
        ),
      );
      const ownerEntity = entitiesByRef.get(ownerRef);
      if (!ownerEntity) {
        throw new Error(`Backstage catalog owner not found: ${ownerRef}`);
      }

      const ownerGroupRef =
        ownerEntity.kind?.toLowerCase() === 'group'
          ? ownerRef
          : ownerEntity.relations?.find(relation => relation.type === 'ownedBy')
              ?.targetRef;
      const group = ownerGroupRef
        ? entitiesByRef.get(normalizedEntityRef(ownerGroupRef))
        : undefined;
      if (!group || group.spec?.type !== 'team') {
        throw new Error(
          `Delivery record ${record.id} must resolve to a Backstage delivery team.`,
        );
      }

      const projectKey = required(
        group.metadata?.annotations?.[JIRA_PROJECT_ANNOTATION],
        `Backstage delivery team ${entityRef(
          group,
        )} has no Jira project routing annotation.`,
      );
      const affectedEntities = dependencyClosure(
        record.affectedEntities ?? [],
        entitiesByRef,
      );
      const { projectKey: ignoredProjectKey, ...sourceRecord } = record;
      void ignoredProjectKey;

      return {
        ...sourceRecord,
        projectKey,
        routingEvidence: {
          source: 'backstage-catalog',
          ownerEntity: ownerRef,
          ownerGroup: entityRef(group),
          projectKey,
          affectedEntities,
        },
      };
    },
  );
  return routed;
}

function asLines(value) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function proposalDescription(proposal) {
  return [
    `Artifact: ${proposal.id} rev ${proposal.revision}`,
    `State: ${proposal.state}`,
    `Authority: ${proposal.authority}`,
    '',
    'Current State',
    proposal.currentState,
    '',
    'Desired Outcome',
    proposal.desiredOutcome,
    '',
    'Required Difference',
    proposal.requiredDifference,
    '',
    'Requirements',
    ...asLines(proposal.requirements).map(value => `- ${value}`),
    '',
    'Acceptance Conditions',
    ...asLines(proposal.acceptanceConditions).map(value => `- ${value}`),
  ].join('\n');
}

function validateProposal(proposal) {
  required(proposal?.id, 'Proposal id is required.');
  required(proposal?.revision, 'Proposal revision is required.');
  required(proposal?.title, 'Proposal title is required.');
  required(proposal?.state, 'Proposal state is required.');
  required(proposal?.authority, 'Proposal authority is required.');
  required(proposal?.currentState, 'Current State is required.');
  required(proposal?.desiredOutcome, 'Desired Outcome is required.');
  required(proposal?.requiredDifference, 'Required Difference is required.');
  required(
    proposal?.requirements?.length,
    'At least one Requirement is required.',
  );
  required(
    proposal?.acceptanceConditions?.length,
    'At least one Acceptance Condition is required.',
  );
}

function validateDeliveryAuthority(candidateDelivery) {
  const authorization = required(
    candidateDelivery.authorization,
    'Authorized candidate delivery requires an authorization record.',
  );
  const authorizedWorkProposal = required(
    authorization.authorizedWorkProposal,
    'Authorized candidate delivery requires an Authorized Work Proposal record.',
  );
  if (authorizedWorkProposal.state !== 'Authorized') {
    throw new Error('The Authorized Work Proposal state must be Authorized.');
  }
  required(
    authorizedWorkProposal.id,
    'Authorized candidate delivery requires an Authorized Work Proposal identifier.',
  );
  required(
    authorizedWorkProposal.proposalId,
    'Authorized Work Proposal requires the governing proposal identifier.',
  );
  required(
    authorizedWorkProposal.proposalRevision,
    'Authorized Work Proposal requires the governing proposal revision.',
  );
  required(
    authorization.planningInterval,
    'Authorized candidate delivery requires a Planning Interval.',
  );
  const acceptanceAuthority = required(
    authorization.acceptanceAuthority,
    'Authorized candidate delivery requires an Acceptance Authority decision.',
  );
  required(
    acceptanceAuthority.decisionOwner,
    'Acceptance Authority requires a Decision Owner.',
  );
  if (acceptanceAuthority.state !== 'Accepted') {
    throw new Error('Acceptance Authority must record an Accepted decision.');
  }

  const acceptedProjects = new Set(
    (authorization.capacityAcceptances ?? [])
      .filter(decision => decision.state === 'Accepted')
      .map(decision => decision.projectKey),
  );
  for (const record of candidateDelivery.records ?? []) {
    if (!acceptedProjects.has(record.projectKey)) {
      throw new Error(
        `Capacity Acceptance is missing for ${record.projectKey}. Candidate delivery was not published.`,
      );
    }
  }
}

function deliveryIssueType(recordType) {
  const issueTypes = {
    'Discovery Work Package': 'Task',
    'Epic candidate': 'Epic',
    'Initiative candidate': 'Epic',
  };
  const issueType = issueTypes[recordType];
  if (!issueType) {
    throw new Error(`Unsupported candidate delivery type: ${recordType}`);
  }
  return issueType;
}

export function buildPublicationPlan(artifact) {
  if (artifact?.schemaVersion !== 1) {
    throw new Error(
      'Unsupported or missing work-intake publication schemaVersion.',
    );
  }
  validateProposal(artifact.proposal);

  const { proposal } = artifact;
  const issues = [
    {
      localId: 'proposal',
      projectKey: 'NWI',
      issueType: 'Epic',
      summary: `[${proposal.id} rev ${proposal.revision}] ${proposal.title}`,
      description: proposalDescription(proposal),
      labels: ['northstar-work-intake', 'work-proposal'],
    },
  ];

  [...(artifact.reviews ?? [])]
    .sort((left, right) => left.stage - right.stage)
    .forEach((review, index) => {
      issues.push({
        localId: `review-${index + 1}`,
        projectKey: 'NWI',
        issueType: 'Task',
        parentLocalId: 'proposal',
        summary: `[${proposal.id}] Stage ${review.stage}: ${review.name}`,
        description: [
          `Decision Owner: ${review.decisionOwner}`,
          `Initial state: ${review.state}`,
          '',
          'This issue is a projection of an ordered review record. Resolving it does not commit delivery capacity.',
        ].join('\n'),
        labels: ['northstar-work-intake', 'review-record'],
      });
    });

  const links = [];
  const notes = [];
  const candidateDelivery = artifact.candidateDelivery ?? {
    authorized: false,
    records: [],
  };

  if (candidateDelivery.authorized !== true) {
    notes.push(
      `Candidate delivery was not published: ${
        candidateDelivery.reason ?? 'no delivery authorization was recorded.'
      }`,
    );
  } else {
    validateDeliveryAuthority(candidateDelivery);
    const authorizedWorkProposal =
      candidateDelivery.authorization.authorizedWorkProposal;
    if (
      authorizedWorkProposal.proposalId !== proposal.id ||
      authorizedWorkProposal.proposalRevision !== proposal.revision
    ) {
      throw new Error(
        'The Authorized Work Proposal does not govern this proposal revision.',
      );
    }
    const recordIds = new Set(
      candidateDelivery.records.map(record =>
        required(record.id, 'Delivery record id is required.'),
      ),
    );

    for (const record of candidateDelivery.records) {
      required(
        record.projectKey,
        `Delivery record ${record.id} requires a projectKey.`,
      );
      if (
        record.routingEvidence?.source !== 'backstage-catalog' ||
        record.routingEvidence.projectKey !== record.projectKey
      ) {
        throw new Error(
          `Delivery record ${record.id} was not routed through the Backstage catalog.`,
        );
      }
      required(record.title, `Delivery record ${record.id} requires a title.`);
      const localId = `delivery-${record.id}`;
      issues.push({
        localId,
        projectKey: record.projectKey,
        issueType: deliveryIssueType(record.type),
        summary: record.title,
        description: [
          `Candidate type: ${record.type}`,
          `Authorized Work Proposal: ${authorizedWorkProposal.id}`,
          `Governing proposal: ${authorizedWorkProposal.proposalId} rev ${authorizedWorkProposal.proposalRevision}`,
          `Planning Interval: ${candidateDelivery.authorization.planningInterval}`,
          `Acceptance Authority: ${candidateDelivery.authorization.acceptanceAuthority.decisionOwner}`,
          '',
          'Outcome / Exit Condition',
          record.outcome,
        ].join('\n'),
        labels: ['northstar-delivery', 'authorized-work-proposal'],
      });

      for (const dependencyId of record.deliveryDependsOn ?? []) {
        if (!recordIds.has(dependencyId)) {
          throw new Error(
            `Delivery record ${record.id} depends on unknown record ${dependencyId}.`,
          );
        }
        links.push({
          type: 'Blocks',
          inwardLocalId: localId,
          outwardLocalId: `delivery-${dependencyId}`,
        });
      }
      links.push({
        type: 'Relates',
        inwardLocalId: localId,
        outwardLocalId: 'proposal',
      });
    }
  }

  for (const issue of issues) {
    issue.publicationLabel = publicationLabel(
      proposal.id,
      proposal.revision,
      issue.localId,
    );
    issue.labels = [...issue.labels, issue.publicationLabel];
  }

  links.sort((left, right) => {
    if (left.type !== right.type) return left.type === 'Blocks' ? -1 : 1;
    return left.inwardLocalId.localeCompare(right.inwardLocalId);
  });

  return { proposal, issues, links, notes };
}
