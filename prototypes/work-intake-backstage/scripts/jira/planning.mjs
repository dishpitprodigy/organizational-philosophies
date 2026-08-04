import { createHash } from 'node:crypto';

const JIRA_PROJECT_ANNOTATION = 'northstar.example/jira-project-key';
const TECHNICAL_REVIEWER_ANNOTATION =
  'northstar.example/technical-reviewer-role';
const REVIEW_PROFILE_ANNOTATION =
  'northstar.example/work-intake-review-profile';
const DEPENDENCY_ANNOTATION = 'northstar.example/depends-on';

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
    const relationDependencies = (entity.relations ?? [])
      .filter(relation => relation.type === 'dependsOn')
      .map(relation => relation.targetRef);
    const annotatedDependencies = String(
      entity.metadata?.annotations?.[DEPENDENCY_ANNOTATION] ?? '',
    )
      .split(',')
      .map(ref => ref.trim())
      .filter(Boolean);
    queue.push(...relationDependencies, ...annotatedDependencies);
  }
  return [...discovered];
}

function catalogGroup(name, entitiesByRef) {
  const group = entitiesByRef.get(`group:default/${name}`);
  if (!group) throw new Error(`Backstage catalog group not found: ${name}`);
  return group;
}

function reviewerFor(group) {
  return required(
    group.metadata?.annotations?.[TECHNICAL_REVIEWER_ANNOTATION],
    `Backstage group ${entityRef(group)} has no technical reviewer annotation.`,
  );
}

function reviewRecord(stage, name, group, reason) {
  return {
    stage,
    name,
    decisionOwner: reviewerFor(group),
    state: stage === 1 ? 'Ready for review' : 'Waiting for predecessor',
    reason,
  };
}

function catalogReviews(routingRequest, entitiesByRef) {
  const affectedEntities = dependencyClosure(
    required(
      routingRequest.affectedEntities?.length,
      'Backstage review routing requires at least one affected entity.',
    ) && routingRequest.affectedEntities,
    entitiesByRef,
  );
  const entities = affectedEntities.map(ref => entitiesByRef.get(ref));
  const profiles = new Set(
    entities
      .map(entity => entity.metadata?.annotations?.[REVIEW_PROFILE_ANNOTATION])
      .filter(Boolean),
  );
  const tags = new Set(entities.flatMap(entity => entity.metadata?.tags ?? []));
  const facts = routingRequest.facts ?? {};
  const reviews = [
    reviewRecord(
      1,
      'Administrative Authority Review',
      catalogGroup('portfolio', entitiesByRef),
      'Decides whether this proposal may consume evaluation or bounded discovery capacity.',
    ),
  ];

  const securityTriggered =
    facts.production ||
    facts.customerFacing ||
    facts.sensitiveData ||
    facts.authenticationPath ||
    facts.internetExposed ||
    tags.has('production') ||
    tags.has('internet-facing') ||
    [...profiles].some(profile =>
      /authentication|internet|sensitive-data/.test(profile),
    );
  if (securityTriggered) {
    reviews.push(
      reviewRecord(
        2,
        'Security Review Board',
        catalogGroup('security', entitiesByRef),
        'Backstage catalog facts cross a security, trust, production, or exposure boundary.',
      ),
    );
  }
  if (
    facts.sensitiveData ||
    [...profiles].some(profile => /sensitive-data/.test(profile))
  ) {
    reviews.push(
      reviewRecord(
        3,
        'Privacy & Data Review',
        catalogGroup('privacy', entitiesByRef),
        'Backstage catalog facts identify a sensitive-data boundary.',
      ),
    );
  }
  if (facts.purchase || Number(facts.spendUsd) > 0) {
    reviews.push(
      reviewRecord(
        3,
        'Finance & Procurement Review',
        catalogGroup('finance', entitiesByRef),
        'The proposal may create a commercial or financial commitment.',
      ),
    );
  }
  if (
    affectedEntities.length > 1 ||
    ['Migration', 'Redesign'].includes(facts.intent)
  ) {
    reviews.push(
      reviewRecord(
        3,
        'Architecture Review',
        catalogGroup('architecture', entitiesByRef),
        'The Backstage dependency closure crosses system boundaries.',
      ),
    );
  }
  if (
    facts.production ||
    facts.customerFacing ||
    tags.has('production') ||
    tags.has('customer-facing')
  ) {
    reviews.push(
      reviewRecord(
        3,
        'Reliability & Operations Review',
        catalogGroup('sre', entitiesByRef),
        'Backstage catalog facts identify a production or customer-visible operating condition.',
      ),
    );
  }

  const ownerRefs = [];
  for (const entity of entities) {
    const ownerRef = entity.relations?.find(
      relation => relation.type === 'ownedBy',
    )?.targetRef;
    if (ownerRef && !ownerRefs.includes(normalizedEntityRef(ownerRef))) {
      ownerRefs.push(normalizedEntityRef(ownerRef));
    }
  }
  for (const ownerRef of ownerRefs) {
    const group = entitiesByRef.get(ownerRef);
    if (!group || group.spec?.type !== 'team') continue;
    reviews.push(
      reviewRecord(
        3,
        `${group.metadata?.title ?? group.metadata?.name} Technical Review`,
        group,
        `${
          group.metadata?.title ?? group.metadata?.name
        } owns an affected Backstage entity or derived dependency.`,
      ),
    );
  }

  return { affectedEntities, reviews };
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

export function projectionFingerprint(issue) {
  return createHash('sha256')
    .update(
      JSON.stringify({
        localId: issue.localId,
        projectKey: issue.projectKey,
        issueType: issue.issueType,
        parentLocalId: issue.parentLocalId ?? null,
        summary: issue.summary,
        description: issue.description,
        labels: issue.labels,
      }),
    )
    .digest('hex');
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

  const routingRequest = required(
    routed.routingRequest,
    'Publication requires a Backstage catalog routingRequest.',
  );
  const reviewRouting = catalogReviews(routingRequest, entitiesByRef);
  routed.reviews = reviewRouting.reviews;
  routed.routingRequest.routingEvidence = {
    source: 'backstage-catalog',
    affectedEntities: reviewRouting.affectedEntities,
  };

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
      const affectedOwnerGroups = new Set();
      for (const affectedRef of affectedEntities) {
        const affectedEntity = entitiesByRef.get(affectedRef);
        if (affectedEntity?.kind?.toLowerCase() === 'group') {
          affectedOwnerGroups.add(affectedRef);
        }
        for (const relation of affectedEntity?.relations ?? []) {
          if (relation.type === 'ownedBy') {
            affectedOwnerGroups.add(normalizedEntityRef(relation.targetRef));
          }
        }
      }
      const normalizedOwnerGroupRef = normalizedEntityRef(ownerGroupRef);
      if (!affectedOwnerGroups.has(normalizedOwnerGroupRef)) {
        throw new Error(
          `Backstage catalog does not show ${normalizedOwnerGroupRef} owning an affected entity for delivery record ${record.id}.`,
        );
      }
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
  if (
    artifact.routingRequest?.routingEvidence?.source !== 'backstage-catalog'
  ) {
    throw new Error(
      'Work-intake reviews must be resolved through the Backstage catalog before publication.',
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
