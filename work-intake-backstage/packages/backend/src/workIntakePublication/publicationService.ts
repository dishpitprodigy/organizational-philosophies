import { createHash } from 'node:crypto';

import {
  workProposalArtifactSchema,
  type WorkProposalArtifact,
} from '../workIntake/domain/artifactSchema';
import {
  canonicalJson,
  workProposalSha256,
} from '../workIntake/domain/canonicalJson';
import {
  AuthenticatedActor,
  CanonicalArtifact,
  PublicationPlan,
  PublicationProfile,
  PublicationProfileSummary,
  PublicationReceipt,
  PublicationRecord,
  PublicationRelation,
  PublicationRequest,
  PublicationTarget,
  ResolvedCatalogRouting,
  ResolvedTargetBinding,
  StructuredPublicationContent,
  TargetBinding,
  WorkProposalPublication,
} from './contracts';
import { PublicationError } from './errors';

export type CatalogReview = {
  stage: number;
  name: string;
  decisionOwner: string;
  reason: string;
};

export type CatalogDelivery = {
  recordId: string;
  targetId: string;
  routing: ResolvedCatalogRouting;
};

export type CatalogPublicationResolution = {
  proposalRouting: ResolvedCatalogRouting;
  reviews: CatalogReview[];
  deliveries: Record<string, CatalogDelivery>;
};

export interface CatalogPublicationResolver {
  resolve(
    artifact: WorkProposalArtifact,
    actor: AuthenticatedActor,
  ): Promise<CatalogPublicationResolution>;
}

export type PublicationServiceOptions = {
  profiles: PublicationProfile[];
  targetBindings: TargetBinding[];
  targets: Map<string, PublicationTarget>;
  catalog: CatalogPublicationResolver;
  resolveConfig(configRef: string): Readonly<Record<string, unknown>>;
};

type CandidateRecord =
  WorkProposalArtifact['candidateDelivery']['records'][number] & {
    projectKey?: string;
  };

type DeliveryAuthorization = {
  authorizedWorkProposal?: {
    id?: string;
    proposalId?: string;
    proposalRevision?: number;
    state?: string;
  };
  planningInterval?: string;
  acceptanceAuthority?: { decisionOwner?: string; state?: string };
  capacityAcceptances?: Array<{ projectKey?: string; state?: string }>;
};

function sha256(value: unknown) {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}

function canonicalArtifact(artifact: WorkProposalArtifact): CanonicalArtifact {
  const { publication: ignored, ...contentValue } =
    artifact as WorkProposalArtifact & {
      publication?: unknown;
    };
  void ignored;
  const content = `${canonicalJson(contentValue)}\n`;
  const digest = workProposalSha256(artifact);
  return {
    artifact,
    content,
    sha256: digest,
    filename: `${artifact.proposal.id}-rev-${artifact.proposal.revision}-${digest}.json`,
  };
}

function proposalContent(
  artifact: WorkProposalArtifact,
): StructuredPublicationContent {
  const { proposal } = artifact;
  return {
    summary: [
      { label: 'Artifact', value: `${proposal.id} rev ${proposal.revision}` },
      { label: 'State', value: proposal.state },
      { label: 'Authority', value: proposal.authority },
    ],
    sections: [
      {
        heading: 'Current State',
        paragraphs: [
          proposal.currentState.summary,
          proposal.currentState.architecture,
          proposal.currentState.workloadEvidence,
          proposal.currentState.constraints,
        ],
      },
      {
        heading: 'Desired Outcome',
        paragraphs: [proposal.desiredOutcome.summary],
        fields: [
          { label: 'Scope', value: proposal.desiredOutcome.scope },
          { label: 'Capability', value: proposal.desiredOutcome.capability },
          { label: 'Proof', value: proposal.desiredOutcome.proof },
          { label: 'Horizon', value: proposal.desiredOutcome.horizon },
        ],
      },
      {
        heading: 'Required Difference',
        paragraphs: [proposal.requiredDifference.summary],
        fields: [
          { label: 'Preserve', value: proposal.requiredDifference.preserve },
          { label: 'Change', value: proposal.requiredDifference.change },
          {
            label: 'Evidence basis',
            value: proposal.requiredDifference.evidenceBasis,
          },
        ],
      },
      {
        heading: 'Requirements',
        items: proposal.requirements.map(
          item =>
            `${item.id}: ${item.condition} — Verification: ${item.verification}`,
        ),
      },
      {
        heading: 'Acceptance Conditions',
        items: proposal.acceptanceConditions.map(
          item =>
            `${item.id}: ${item.result} — Evidence: ${item.evidenceMethod}`,
        ),
      },
      {
        heading: 'Non-Goals',
        items: proposal.nonGoals.map(
          item => `${item.id}: ${item.exclusion} — ${item.reason}`,
        ),
      },
    ],
  };
}

function makeRecord(
  record: Omit<PublicationRecord, 'idempotencyKey' | 'logicalFingerprint'>,
): PublicationRecord {
  const idempotencyKey = `${record.identity.proposalId}:rev-${record.identity.proposalRevision}:${record.localId}`;
  const logicalFingerprint = sha256({ ...record, idempotencyKey });
  return { ...record, idempotencyKey, logicalFingerprint };
}

function validateDeliveryAuthority(
  artifact: WorkProposalArtifact,
  records: CandidateRecord[],
  catalog: CatalogPublicationResolution,
) {
  const authorization = (
    artifact.candidateDelivery as { authorization?: DeliveryAuthorization }
  ).authorization;
  const workProposal = authorization?.authorizedWorkProposal;
  if (!authorization || !workProposal || workProposal.state !== 'Authorized') {
    throw new PublicationError(
      'AuthorityViolation',
      'Authorized candidate delivery requires an Authorized Work Proposal record.',
    );
  }
  if (
    workProposal.proposalId !== artifact.proposal.id ||
    workProposal.proposalRevision !== artifact.proposal.revision
  ) {
    throw new PublicationError(
      'AuthorityViolation',
      'The Authorized Work Proposal does not govern this proposal revision.',
    );
  }
  if (!authorization.planningInterval) {
    throw new PublicationError(
      'AuthorityViolation',
      'Authorized candidate delivery requires a Planning Interval.',
    );
  }
  if (
    !authorization.acceptanceAuthority?.decisionOwner ||
    authorization.acceptanceAuthority.state !== 'Accepted'
  ) {
    throw new PublicationError(
      'AuthorityViolation',
      'Acceptance Authority must record an Accepted decision.',
    );
  }
  const accepted = new Set(
    (authorization.capacityAcceptances ?? [])
      .filter(item => item.state === 'Accepted')
      .map(item => item.projectKey),
  );
  for (const record of records) {
    const targetId = catalog.deliveries[record.id]?.targetId;
    if (!targetId || !accepted.has(targetId)) {
      throw new PublicationError(
        'CapacityNotAccepted',
        `Capacity Acceptance is missing for ${targetId ?? record.id}.`,
      );
    }
  }
  return authorization;
}

function catalogEnrichedArtifact(
  artifact: WorkProposalArtifact,
  catalog: CatalogPublicationResolution,
): WorkProposalArtifact {
  const enriched = JSON.parse(JSON.stringify(artifact)) as WorkProposalArtifact & {
    reviews?: CatalogReview[];
  };
  enriched.reviews = catalog.reviews;
  enriched.routingRequest.routingEvidence = {
    source: 'backstage-catalog',
    affectedEntities: catalog.proposalRouting.affectedEntities,
    ...catalog.proposalRouting.evidence,
  };
  enriched.candidateDelivery.records = enriched.candidateDelivery.records.map(
    record => {
      const delivery = catalog.deliveries[record.id];
      if (!delivery) return record;
      return {
        ...record,
        projectKey: delivery.targetId,
        routingEvidence: {
          source: 'backstage-catalog',
          projectKey: delivery.targetId,
          ...delivery.routing.evidence,
        },
      };
    },
  );
  return enriched;
}

function logicalBatch(
  profileId: string,
  artifact: WorkProposalArtifact,
  catalog: CatalogPublicationResolution,
) {
  const enrichedArtifact = catalogEnrichedArtifact(artifact, catalog);
  const identity = {
    proposalId: enrichedArtifact.proposal.id,
    proposalRevision: enrichedArtifact.proposal.revision,
  };
  const records: PublicationRecord[] = [
    makeRecord({
      localId: 'proposal',
      kind: 'proposal',
      identity,
      title: `[${enrichedArtifact.proposal.id} rev ${enrichedArtifact.proposal.revision}] ${enrichedArtifact.proposal.title}`,
      content: proposalContent(enrichedArtifact),
      routing: catalog.proposalRouting,
    }),
  ];
  const relations: PublicationRelation[] = [];
  const notes: string[] = [];

  if (enrichedArtifact.proposal.sponsor.accepted) {
    [...catalog.reviews]
      .sort(
        (left, right) =>
          left.stage - right.stage || left.name.localeCompare(right.name),
      )
      .forEach((review, index) => {
        const localId = `review-${index + 1}`;
        records.push(
          makeRecord({
            localId,
            kind: 'ordered-review',
            identity,
            title: `[${enrichedArtifact.proposal.id}] Stage ${review.stage}: ${review.name}`,
            content: {
              summary: [
                { label: 'Decision Owner', value: review.decisionOwner },
                {
                  label: 'Initial state',
                  value:
                    index === 0
                      ? 'Ready for review'
                      : 'Waiting for predecessor',
                },
              ],
              sections: [{ heading: 'Reason', paragraphs: [review.reason] }],
            },
            routing: catalog.proposalRouting,
          }),
        );
        relations.push({
          type: 'governs',
          fromLocalId: 'proposal',
          toLocalId: localId,
        });
        if (index > 0) {
          relations.push({
            type: 'precedes',
            fromLocalId: `review-${index}`,
            toLocalId: localId,
          });
        }
      });
  } else {
    notes.push(
      'Ordered review work was not published because durable, attributable sponsor approval is not attached to this proposal revision.',
    );
  }

  const candidateRecords = enrichedArtifact.candidateDelivery
    .records as CandidateRecord[];
  if (!enrichedArtifact.candidateDelivery.authorized) {
    notes.push(
      `Candidate delivery was not published: ${enrichedArtifact.candidateDelivery.reason}`,
    );
  } else {
    const authorization = validateDeliveryAuthority(
      enrichedArtifact,
      candidateRecords,
      catalog,
    );
    const recordIds = new Set(candidateRecords.map(record => record.id));
    for (const delivery of candidateRecords) {
      const resolved = catalog.deliveries[delivery.id];
      if (!resolved) {
        throw new PublicationError(
          'CatalogRoutingFailure',
          `Backstage catalog did not route delivery record ${delivery.id}.`,
        );
      }
      const localId = `delivery-${delivery.id}`;
      records.push(
        makeRecord({
          localId,
          kind: 'authorized-delivery',
          identity,
          title: delivery.title,
          content: {
            summary: [
              { label: 'Candidate type', value: delivery.type },
              {
                label: 'Planning Interval',
                value: authorization.planningInterval!,
              },
              {
                label: 'Acceptance Authority',
                value: authorization.acceptanceAuthority!.decisionOwner!,
              },
            ],
            sections: [
              {
                heading: 'Outcome / Exit Condition',
                paragraphs: [delivery.outcome],
              },
            ],
          },
          routing: resolved.routing,
        }),
      );
      relations.push({
        type: 'governs',
        fromLocalId: 'proposal',
        toLocalId: localId,
      });
      for (const dependencyId of delivery.deliveryDependsOn) {
        if (!recordIds.has(dependencyId)) {
          throw new PublicationError(
            'InvalidArtifact',
            `Delivery record ${delivery.id} depends on unknown record ${dependencyId}.`,
          );
        }
        relations.push({
          type: 'blocks',
          fromLocalId: `delivery-${dependencyId}`,
          toLocalId: localId,
        });
      }
    }
  }
  return {
    profileId,
    artifact: canonicalArtifact(enrichedArtifact),
    records,
    relations,
    notes,
  };
}

function roleKind(role: PublicationProfile['placements'][number]['role']) {
  return role === 'proposal'
    ? 'proposal'
    : role === 'review'
    ? 'ordered-review'
    : 'authorized-delivery';
}

export class PublicationService implements WorkProposalPublication {
  constructor(private readonly options: PublicationServiceOptions) {}

  async profiles(
    _actor: AuthenticatedActor,
  ): Promise<PublicationProfileSummary[]> {
    return Promise.all(
      this.options.profiles.map(async profile => {
        const bindings = profile.placements.map(placement =>
          this.options.targetBindings.find(
            binding => binding.id === placement.bindingId,
          ),
        );
        if (bindings.some(binding => !binding)) {
          return {
            id: profile.id,
            displayName: profile.displayName,
            available: false,
            unavailableReason: 'Profile binding is not configured.',
          };
        }
        for (const binding of bindings as TargetBinding[]) {
          const target = this.options.targets.get(binding.adapterId);
          if (!target) {
            return {
              id: profile.id,
              displayName: profile.displayName,
              available: false,
              unavailableReason: `Adapter ${binding.adapterId} is not configured.`,
            };
          }
          if (binding.target.kind === 'fixed') {
            const status = await target.status(
              this.resolveBinding(binding, binding.target.targetId),
            );
            if (!status.available) {
              return {
                id: profile.id,
                displayName: profile.displayName,
                available: false,
                unavailableReason: status.reason,
              };
            }
          }
        }
        return {
          id: profile.id,
          displayName: profile.displayName,
          available: true,
        };
      }),
    );
  }

  async preview(
    actor: AuthenticatedActor,
    request: PublicationRequest,
  ): Promise<PublicationPlan> {
    const profile = this.options.profiles.find(
      item => item.id === request.profileId,
    );
    if (!profile) {
      throw new PublicationError(
        'ProfileNotAllowed',
        `Publication profile ${request.profileId} is not available.`,
      );
    }
    const artifactResult = workProposalArtifactSchema.safeParse(
      request.artifact,
    );
    if (!artifactResult.success) {
      throw new PublicationError(
        'InvalidArtifact',
        'Invalid Work Proposal artifact.',
      );
    }
    const artifact = artifactResult.data;
    if (artifact.submission.authenticatedActor !== actor.principal) {
      throw new PublicationError(
        'AuthorityViolation',
        'Submission actor does not match the authenticated user.',
      );
    }
    const catalog = await this.options.catalog.resolve(artifact, actor);
    const batch = logicalBatch(profile.id, artifact, catalog);
    const placements: PublicationPlan['placements'] = [];
    for (const placement of profile.placements) {
      const binding = this.options.targetBindings.find(
        item => item.id === placement.bindingId,
      );
      if (!binding) {
        throw new PublicationError(
          'TargetConfigurationError',
          `Target binding ${placement.bindingId} is not configured.`,
        );
      }
      const matching = batch.records.filter(
        record => record.kind === roleKind(placement.role),
      );
      const targets = new Map<string, string[]>();
      for (const record of matching) {
        const targetId =
          binding.target.kind === 'fixed'
            ? binding.target.targetId
            : record.routing.deliveryTargetId;
        if (!targetId) {
          throw new PublicationError(
            'CatalogRoutingFailure',
            `No concrete target was resolved for ${record.localId}.`,
          );
        }
        targets.set(targetId, [
          ...(targets.get(targetId) ?? []),
          record.localId,
        ]);
      }
      for (const [targetId, recordLocalIds] of targets) {
        placements.push({
          placement,
          binding: this.resolveBinding(binding, targetId),
          recordLocalIds,
        });
      }
    }
    return { ...batch, placements };
  }

  async publish(
    _actor: AuthenticatedActor,
    _request: PublicationRequest,
  ): Promise<PublicationReceipt> {
    throw new PublicationError(
      'TargetConfigurationError',
      'Publication execution is not composed.',
    );
  }

  private resolveBinding(
    binding: TargetBinding,
    targetId: string,
  ): ResolvedTargetBinding {
    return {
      ...binding,
      target: { kind: 'resolved', targetId },
      config: this.options.resolveConfig(binding.configRef),
    };
  }
}

export function targetFingerprint(
  record: PublicationRecord,
  placementId: string,
  binding: ResolvedTargetBinding,
) {
  return sha256({
    logicalFingerprint: record.logicalFingerprint,
    placementId,
    adapterId: binding.adapterId,
    targetId: binding.target.targetId,
    mappingVersion: binding.mappingVersion,
  });
}
