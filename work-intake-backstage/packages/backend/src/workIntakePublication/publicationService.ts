import { createHash } from 'node:crypto';

import {
  workProposalArtifactSchema,
  type WorkProposalArtifact,
} from '../workIntake/domain/artifactSchema';
import { canonicalJson } from '../workIntake/domain/canonicalJson';
import {
  AuthenticatedActor,
  ArtifactStore,
  CanonicalArtifact,
  CanonicalArtifactReference,
  ExternalProjection,
  JournalEntry,
  JournalKey,
  PublicationPlan,
  PublicationArtifactReceipt,
  PublicationJournal,
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
  TargetBatch,
  WorkProposalPublication,
} from './contracts';
import { PublicationError } from './errors';

function normalizedPublicationError(error: unknown) {
  if (error instanceof PublicationError) return error;
  const candidate = error as {
    name?: string;
    status?: number;
    message?: string;
  };
  if (candidate.name === 'RevisionRequired') {
    return new PublicationError(
      'RevisionRequired',
      candidate.message ?? 'A new revision is required.',
    );
  }
  if (candidate.name === 'ConcurrentPublication') {
    return new PublicationError(
      'ConcurrentPublication',
      candidate.message ?? 'Publication is already running.',
    );
  }
  if (candidate.status === 401 || candidate.status === 403) {
    return new PublicationError(
      'TargetAuthenticationError',
      candidate.message ?? 'Target authentication failed.',
    );
  }
  return new PublicationError(
    'TargetUnavailable',
    candidate.message ?? String(error),
  );
}

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
  journal?: PublicationJournal;
  artifactStore?: ArtifactStore;
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
  const content = `${JSON.stringify(
    JSON.parse(canonicalJson(contentValue)),
    null,
    2,
  )}\n`;
  const digest = createHash('sha256').update(content).digest('hex');
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
        paragraphs: [proposal.currentState.summary],
        fields: [
          {
            label: 'Baseline method',
            value: proposal.currentState.baseline.mode,
          },
          ...(proposal.currentState.baseline.reference
            ? [
                {
                  label: 'Baseline',
                  value: proposal.currentState.baseline.reference,
                },
              ]
            : []),
          ...(proposal.currentState.baseline.delta
            ? [
                {
                  label: 'Baseline delta',
                  value: proposal.currentState.baseline.delta,
                },
              ]
            : []),
          {
            label: 'Architecture and operating path',
            value: proposal.currentState.architecture,
          },
          {
            label: 'Measured production workload',
            value: proposal.currentState.workloadEvidence,
          },
          {
            label: 'Observed constraints',
            value: proposal.currentState.constraints,
          },
        ],
      },
      {
        heading: 'Desired Outcome',
        paragraphs: [proposal.desiredOutcome.summary],
        fields: [
          { label: 'Operating scope', value: proposal.desiredOutcome.scope },
          { label: 'Capability', value: proposal.desiredOutcome.capability },
          { label: 'Decisive proof', value: proposal.desiredOutcome.proof },
          {
            label: 'Operating horizon',
            value: proposal.desiredOutcome.horizon,
          },
        ],
      },
      {
        heading: 'Required Difference',
        paragraphs: [proposal.requiredDifference.summary],
        fields: [
          { label: 'Preserve', value: proposal.requiredDifference.preserve },
          { label: 'Change', value: proposal.requiredDifference.change },
          {
            label: 'Common evidence basis',
            value: proposal.requiredDifference.evidenceBasis,
          },
        ],
      },
      {
        heading: 'Requirements',
        items: proposal.requirements.map(
          item =>
            `${item.id}: ${item.condition}\n  Verification: ${item.verification}`,
        ),
      },
      {
        heading: 'Acceptance Conditions',
        items: proposal.acceptanceConditions.map(
          item =>
            `${item.id}: ${item.context ? `Given ${item.context}, ` : ''}${
              item.result
            }\n  Evidence method: ${item.evidenceMethod}`,
        ),
      },
      {
        heading: 'Non-Goals',
        items: proposal.nonGoals.map(
          item =>
            `${item.id}: ${item.exclusion}${
              item.reason ? `\n  Reason: ${item.reason}` : ''
            }`,
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
  const enriched = JSON.parse(
    JSON.stringify(artifact),
  ) as WorkProposalArtifact & {
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
                label: 'Authorized Work Proposal',
                value: authorization.authorizedWorkProposal!.id!,
              },
              {
                label: 'Governing proposal',
                value: `${
                  authorization.authorizedWorkProposal!.proposalId
                } rev ${
                  authorization.authorizedWorkProposal!.proposalRevision
                }`,
              },
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
  if (role === 'proposal') return 'proposal';
  if (role === 'review') return 'ordered-review';
  return 'authorized-delivery';
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
    actor: AuthenticatedActor,
    request: PublicationRequest,
  ): Promise<PublicationReceipt> {
    return this.publishPrepared(await this.preview(actor, request));
  }

  async publishPrepared(plan: PublicationPlan): Promise<PublicationReceipt> {
    const journal = this.options.journal;
    const artifactStore = this.options.artifactStore;
    if (!journal || !artifactStore) {
      throw new PublicationError(
        'TargetConfigurationError',
        'Publication journal and artifact store are not configured.',
      );
    }
    const profile = this.options.profiles.find(
      item => item.id === plan.profileId,
    )!;
    const lockIdentity = `${plan.profileId}:${plan.artifact.artifact.proposal.id}:${plan.artifact.artifact.proposal.revision}`;
    return journal.withLock(lockIdentity, async () => {
      const results: PublicationReceipt['results'] = [];
      const relationResults: PublicationReceipt['relations'] = [];
      const notes = [...plan.notes];
      let artifactReference: CanonicalArtifactReference | undefined;
      let artifactReceipt: PublicationArtifactReceipt | undefined;
      const completed = new Set<string>();
      const failed = new Set<string>();

      for (const planned of this.orderedPlacements(profile, plan)) {
        if (planned.placement.dependsOn.some(id => failed.has(id))) {
          failed.add(planned.placement.id);
          notes.push(
            `Skipped ${planned.placement.id} because a required placement failed.`,
          );
          continue;
        }
        if (
          planned.placement.dependsOn.some(id => !completed.has(id)) &&
          profile.failurePolicy === 'stop-after-failure'
        ) {
          break;
        }
        try {
          const target = this.options.targets.get(planned.binding.adapterId);
          if (!target) {
            throw new PublicationError(
              'TargetConfigurationError',
              `Adapter ${planned.binding.adapterId} is not configured.`,
            );
          }
          const records = plan.records.filter(record =>
            planned.recordLocalIds.includes(record.localId),
          );
          const fingerprints = Object.fromEntries(
            records.map(record => [
              record.localId,
              targetFingerprint(record, planned.placement.id, planned.binding),
            ]),
          );
          const batch: TargetBatch = {
            profileId: plan.profileId,
            placementId: planned.placement.id,
            binding: planned.binding,
            mappingVersion: planned.binding.mappingVersion,
            artifact: plan.artifact,
            records,
            relations: plan.relations,
            targetFingerprints: fingerprints,
          };
          const keys = records.map(record =>
            this.journalKey(
              plan,
              planned.placement.id,
              planned.binding,
              record,
            ),
          );
          const journalObservation = await journal.observe(keys);
          const existingByLocalId = new Map(
            journalObservation.entries.map(entry => [entry.localId, entry]),
          );
          for (const record of records) {
            const existing = existingByLocalId.get(record.localId);
            if (
              existing?.targetFingerprint &&
              existing.targetFingerprint !== fingerprints[record.localId]
            ) {
              throw new PublicationError(
                'RevisionRequired',
                `${record.localId} changed without a proposal revision increment.`,
              );
            }
          }
          const observed = await target.observe(batch, journalObservation);
          const observedByLocalId = new Map(
            observed.results.map(result => [result.localId, result]),
          );
          const toApply: PublicationRecord[] = [];
          for (const record of records) {
            const observation = observedByLocalId.get(record.localId);
            if (!observation) {
              throw new PublicationError(
                'IndeterminatePublication',
                `Adapter ${target.id} did not report ${record.localId}.`,
              );
            }
            if (observation.status === 'conflict') {
              throw new PublicationError(
                'RevisionRequired',
                `${record.localId} conflicts with the existing external projection.`,
              );
            }
            if (observation.status === 'indeterminate') {
              throw new PublicationError(
                'IndeterminatePublication',
                `The state of ${record.localId} could not be determined safely.`,
              );
            }
            const existing = existingByLocalId.get(record.localId);
            if (
              observation.status === 'found' &&
              existing?.state === 'published' &&
              existing.targetFingerprint === fingerprints[record.localId] &&
              observation.externalId
            ) {
              results.push({
                placementId: planned.placement.id,
                adapterId: target.id,
                targetId: planned.binding.target.targetId,
                localId: record.localId,
                externalId: observation.externalId,
                externalKey: observation.externalKey,
                url: observation.url,
                action: 'reused',
                canonicalArtifactSha256: plan.artifact.sha256,
              });
            } else {
              toApply.push(record);
            }
          }

          if (toApply.length) {
            const reservations = toApply.map(record =>
              this.journalEntry(
                this.journalKey(
                  plan,
                  planned.placement.id,
                  planned.binding,
                  record,
                ),
                record,
                fingerprints[record.localId],
                planned.binding.mappingVersion,
                'creating',
              ),
            );
            await journal.reserve(reservations);
            const applyBatch = {
              ...batch,
              records: toApply,
              targetFingerprints: Object.fromEntries(
                toApply.map(record => [
                  record.localId,
                  fingerprints[record.localId],
                ]),
              ),
            };
            const receipt = await target.apply(applyBatch);
            this.validateTargetReceipt(applyBatch, receipt);
            relationResults.push(...receipt.relations);
            const publishedEntries: JournalEntry[] = [];
            for (const item of receipt.results) {
              const record = toApply.find(
                candidate => candidate.localId === item.localId,
              )!;
              const key = this.journalKey(
                plan,
                planned.placement.id,
                planned.binding,
                record,
              );
              publishedEntries.push({
                ...this.journalEntry(
                  key,
                  record,
                  item.targetFingerprint,
                  planned.binding.mappingVersion,
                  'published',
                ),
                externalId: item.externalId,
                externalKey: item.externalKey,
                url: item.url,
              });
              results.push({
                placementId: planned.placement.id,
                adapterId: target.id,
                targetId: planned.binding.target.targetId,
                localId: item.localId,
                externalId: item.externalId,
                externalKey: item.externalKey,
                url: item.url,
                action: item.action,
                canonicalArtifactSha256: plan.artifact.sha256,
              });
            }
            await journal.recordPublished(publishedEntries);
          }

          if (planned.placement.id === profile.artifactPlacementId) {
            const anchorResult = results.find(
              result =>
                result.placementId === planned.placement.id &&
                result.localId === 'proposal',
            );
            if (!anchorResult) {
              throw new PublicationError(
                'PartialPublication',
                'The proposal anchor was not returned by its Adapter.',
              );
            }
            const anchor: ExternalProjection = {
              adapterId: anchorResult.adapterId,
              targetId: anchorResult.targetId,
              externalId: anchorResult.externalId,
              externalKey: anchorResult.externalKey,
              url: anchorResult.url,
            };
            artifactReceipt = {
              status: 'pending',
              sha256: plan.artifact.sha256,
              filename: plan.artifact.filename,
            };
            artifactReference = await artifactStore.persist(
              plan.artifact,
              anchor,
            );
            await artifactStore.verify(artifactReference);
            artifactReceipt = { status: 'verified', ...artifactReference };
          }
          completed.add(planned.placement.id);
        } catch (error) {
          const normalized = normalizedPublicationError(error);
          failed.add(planned.placement.id);
          if (!results.length) throw normalized;
          notes.push(`${planned.placement.id} failed: ${normalized.message}`);
          if (profile.failurePolicy === 'stop-after-failure') break;
        }
      }

      if (!artifactReceipt) {
        throw new PublicationError(
          'PartialPublication',
          'The canonical artifact was not persisted.',
        );
      }
      return {
        profileId: plan.profileId,
        proposal: {
          id: plan.artifact.artifact.proposal.id,
          revision: plan.artifact.artifact.proposal.revision,
        },
        artifact: artifactReceipt,
        results,
        relations: relationResults,
        notes,
        partial: failed.size > 0,
        retryable: failed.size > 0,
      };
    });
  }

  private orderedPlacements(
    profile: PublicationProfile,
    plan: PublicationPlan,
  ): PublicationPlan['placements'] {
    const remaining = [...plan.placements];
    const ordered: PublicationPlan['placements'] = [];
    const completed = new Set<string>();
    while (remaining.length) {
      const index = remaining.findIndex(item =>
        item.placement.dependsOn.every(id => completed.has(id)),
      );
      if (index < 0) {
        throw new PublicationError(
          'TargetConfigurationError',
          `Profile ${profile.id} contains a placement cycle or missing dependency.`,
        );
      }
      const [next] = remaining.splice(index, 1);
      ordered.push(next);
      completed.add(next.placement.id);
    }
    return ordered;
  }

  private journalKey(
    plan: PublicationPlan,
    placementId: string,
    binding: ResolvedTargetBinding,
    record: PublicationRecord,
  ): JournalKey {
    return {
      profileId: plan.profileId,
      placementId,
      adapterId: binding.adapterId,
      targetId: binding.target.targetId,
      proposalId: record.identity.proposalId,
      proposalRevision: record.identity.proposalRevision,
      localId: record.localId,
    };
  }

  private journalEntry(
    key: JournalKey,
    record: PublicationRecord,
    fingerprint: string,
    mappingVersion: number,
    state: JournalEntry['state'],
  ): JournalEntry {
    return {
      ...key,
      logicalFingerprint: record.logicalFingerprint,
      targetFingerprint: fingerprint,
      mappingVersion,
      state,
    };
  }

  private validateTargetReceipt(
    batch: TargetBatch,
    receipt: Awaited<ReturnType<PublicationTarget['apply']>>,
  ) {
    const requested = new Map(
      batch.records.map(record => [record.localId, record]),
    );
    const seen = new Set<string>();
    for (const result of receipt.results) {
      const record = requested.get(result.localId);
      if (!record || seen.has(result.localId)) {
        throw new PublicationError(
          'PartialPublication',
          `Adapter ${batch.binding.adapterId} returned an unexpected or duplicate result for ${result.localId}.`,
        );
      }
      if (
        result.idempotencyKey !== record.idempotencyKey ||
        result.targetFingerprint !== batch.targetFingerprints[result.localId]
      ) {
        throw new PublicationError(
          'PartialPublication',
          `Adapter ${batch.binding.adapterId} returned mismatched identity for ${result.localId}.`,
        );
      }
      seen.add(result.localId);
    }
    if (seen.size !== requested.size) {
      throw new PublicationError(
        'PartialPublication',
        `Adapter ${batch.binding.adapterId} omitted one or more publication records.`,
      );
    }
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
