import type { WorkProposalArtifact } from '../workIntake/domain/artifactSchema';

declare const authenticatedActorBrand: unique symbol;

export type AuthenticatedActor = {
  readonly principal: string;
  readonly [authenticatedActorBrand]: true;
};

/** Backend-auth boundary only. Never construct this value from request JSON. */
export function authenticatedActorFromPrincipal(
  principal: string,
): AuthenticatedActor {
  return { principal } as AuthenticatedActor;
}

export type PublicationRole = 'proposal' | 'review' | 'delivery';
export type FailurePolicy = 'stop-after-failure' | 'complete-independent';

export type PublicationPlacement = {
  id: string;
  role: PublicationRole;
  bindingId: string;
  dependsOn: string[];
};

export type PublicationProfile = {
  id: string;
  displayName: string;
  placements: PublicationPlacement[];
  artifactPlacementId: string;
  failurePolicy: FailurePolicy;
};

export type TargetBinding = {
  id: string;
  adapterId: string;
  target:
    | { kind: 'fixed'; targetId: string }
    | { kind: 'catalog-route'; route: 'delivery-project' };
  configRef: string;
  mappingVersion: number;
};

export type ResolvedTargetBinding = Omit<TargetBinding, 'target'> & {
  target: { kind: 'resolved'; targetId: string };
  config: Readonly<Record<string, unknown>>;
};

export type PublicationProfileSummary = {
  id: string;
  displayName: string;
  available: boolean;
  unavailableReason?: string;
};

export type StructuredPublicationField = {
  label: string;
  value: string;
};

export type StructuredPublicationSection = {
  heading: string;
  paragraphs?: string[];
  fields?: StructuredPublicationField[];
  items?: string[];
};

export type StructuredPublicationContent = {
  summary?: StructuredPublicationField[];
  sections: StructuredPublicationSection[];
};

export type ResolvedCatalogRouting = {
  affectedEntities: string[];
  ownerEntity?: string;
  ownerGroup?: string;
  deliveryTargetId?: string;
  evidence: Readonly<Record<string, unknown>>;
};

export type PublicationRecord = {
  localId: string;
  kind: 'proposal' | 'ordered-review' | 'authorized-delivery';
  identity: { proposalId: string; proposalRevision: number };
  title: string;
  content: StructuredPublicationContent;
  routing: ResolvedCatalogRouting;
  idempotencyKey: string;
  logicalFingerprint: string;
};

export type PublicationRelation = {
  type: 'precedes' | 'blocks' | 'governs' | 'relates-to';
  fromLocalId: string;
  toLocalId: string;
};

export type CanonicalArtifact = {
  artifact: WorkProposalArtifact;
  content: string;
  sha256: string;
  filename: string;
};

export type CanonicalArtifactReference = {
  sha256: string;
  locator: string;
  filename: string;
};

export type PublicationBatch = {
  profileId: string;
  artifact: CanonicalArtifact;
  records: PublicationRecord[];
  relations: PublicationRelation[];
  notes: string[];
};

export type TargetBatch = {
  profileId: string;
  placementId: string;
  binding: ResolvedTargetBinding;
  mappingVersion: number;
  artifact: CanonicalArtifact;
  records: PublicationRecord[];
  relations: PublicationRelation[];
  targetFingerprints: Record<string, string>;
};

export type ExternalProjection = {
  adapterId: string;
  targetId: string;
  externalId: string;
  url?: string;
};

export type TargetStatus = {
  available: boolean;
  reason?: string;
};

export type JournalState = 'creating' | 'published';

export type JournalKey = {
  profileId: string;
  placementId: string;
  adapterId: string;
  targetId: string;
  proposalId: string;
  proposalRevision: number;
  localId: string;
};

export type JournalEntry = JournalKey & {
  logicalFingerprint: string;
  targetFingerprint: string;
  mappingVersion: number;
  state: JournalState;
  externalId?: string;
  url?: string;
  lastObservation?: TargetObservation;
};

export type JournalObservation = {
  entries: JournalEntry[];
};

export type TargetObservationResult = {
  localId: string;
  status: 'found' | 'absent' | 'indeterminate' | 'conflict';
  externalId?: string;
  url?: string;
  targetFingerprint?: string;
  evidence?: Readonly<Record<string, unknown>>;
};

export type TargetObservation = { results: TargetObservationResult[] };

export type TargetReceipt = {
  results: Array<{
    localId: string;
    idempotencyKey: string;
    targetFingerprint: string;
    externalId: string;
    url?: string;
    action: 'created' | 'reused' | 'reconciled';
  }>;
  relations: Array<{
    type: PublicationRelation['type'];
    action: 'created' | 'reused';
  }>;
};

export interface PublicationTarget {
  readonly id: string;
  status(binding: ResolvedTargetBinding): Promise<TargetStatus>;
  observe(
    batch: TargetBatch,
    journal: JournalObservation,
  ): Promise<TargetObservation>;
  apply(batch: TargetBatch): Promise<TargetReceipt>;
}

export interface ArtifactStore {
  persist(
    artifact: CanonicalArtifact,
    anchor: ExternalProjection,
  ): Promise<CanonicalArtifactReference>;
  verify(reference: CanonicalArtifactReference): Promise<void>;
}

export interface PublicationJournal {
  withLock<T>(identity: string, operation: () => Promise<T>): Promise<T>;
  observe(keys: JournalKey[]): Promise<JournalObservation>;
  reserve(entries: JournalEntry[]): Promise<void>;
  recordPublished(entries: JournalEntry[]): Promise<void>;
}

export type PublicationRequest = {
  profileId: string;
  artifact: WorkProposalArtifact;
};

export type PublicationPlan = PublicationBatch & {
  placements: Array<{
    placement: PublicationPlacement;
    binding: ResolvedTargetBinding;
    recordLocalIds: string[];
  }>;
};

export type PublicationResult = {
  placementId: string;
  adapterId: string;
  targetId: string;
  localId: string;
  externalId: string;
  url?: string;
  action: 'created' | 'reused' | 'reconciled';
  canonicalArtifactSha256: string;
};

export type PublicationReceipt = {
  profileId: string;
  proposal: { id: string; revision: number };
  artifact: CanonicalArtifactReference;
  artifactVerified: boolean;
  results: PublicationResult[];
  relations: TargetReceipt['relations'];
  notes: string[];
  partial: boolean;
  retryable: boolean;
};

export interface WorkProposalPublication {
  profiles(actor: AuthenticatedActor): Promise<PublicationProfileSummary[]>;
  preview(
    actor: AuthenticatedActor,
    request: PublicationRequest,
  ): Promise<PublicationPlan>;
  publish(
    actor: AuthenticatedActor,
    request: PublicationRequest,
  ): Promise<PublicationReceipt>;
}
