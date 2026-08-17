import type {
  AuthenticatedActor,
  PublicationPlan,
  PublicationProfileSummary,
  PublicationReceipt,
  PublicationRequest,
  WorkProposalPublication,
} from '../workIntakePublication/contracts';
import { PublicationError } from '../workIntakePublication/errors';
import { PostgresWorkIntakeStore } from './postgresWorkIntakeStore';

type PreparedPublication = WorkProposalPublication & {
  publishPrepared: (plan: PublicationPlan) => Promise<PublicationReceipt>;
};

export class DurableWorkProposalPublication implements WorkProposalPublication {
  private readonly delegate: PreparedPublication;
  private readonly store: PostgresWorkIntakeStore;
  private readonly generatorProvenance: Readonly<Record<string, unknown>>;

  constructor(options: {
    delegate: PreparedPublication;
    store: PostgresWorkIntakeStore;
    generatorProvenance: Readonly<Record<string, unknown>>;
  }) {
    this.delegate = options.delegate;
    this.store = options.store;
    this.generatorProvenance = options.generatorProvenance;
  }

  profiles(actor: AuthenticatedActor): Promise<PublicationProfileSummary[]> {
    return this.delegate.profiles(actor);
  }

  preview(
    actor: AuthenticatedActor,
    request: PublicationRequest,
  ): Promise<PublicationPlan> {
    return this.delegate.preview(actor, request);
  }

  async publish(
    actor: AuthenticatedActor,
    request: PublicationRequest,
  ): Promise<PublicationReceipt> {
    const plan = await this.delegate.preview(actor, request);
    const proposal = plan.artifact.artifact.proposal;
    await this.store.saveProposalRevision({
      proposalId: proposal.id,
      revision: proposal.revision,
      artifact: plan.artifact.artifact,
      artifactSha256: plan.artifact.sha256,
      schemaVersion: plan.artifact.artifact.schemaVersion,
      actor: actor.principal,
      generatorProvenance: this.generatorProvenance,
      changeReason: `Saved for publication through ${plan.profileId}`,
    });
    const claim = await this.store.claimPublication({
      sourceKind: 'proposal-revision',
      sourceId: proposal.id,
      sourceRevision: proposal.revision,
      publicationProfileId: plan.profileId,
      sourceSha256: plan.artifact.sha256,
    });
    if (claim.status === 'completed') return claim.receipt;
    if (claim.status === 'concurrent') {
      throw new PublicationError(
        'ConcurrentPublication',
        `${proposal.id} revision ${proposal.revision} is already publishing through ${plan.profileId}.`,
      );
    }

    try {
      const receipt = await this.delegate.publishPrepared(plan);
      if (receipt.artifact.sha256 !== plan.artifact.sha256) {
        throw new PublicationError(
          'RevisionRequired',
          'The canonical artifact changed after the database publication claim.',
        );
      }
      if (receipt.partial) {
        await this.store.recordPartialPublication(claim.publicationId, receipt);
      } else {
        await this.store.completePublication(claim.publicationId, receipt);
      }
      return receipt;
    } catch (error) {
      await this.store.failPublication(
        claim.publicationId,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }
}
