import { createHash, randomUUID } from 'node:crypto';

import type { Knex } from 'knex';

import type { PublicationReceipt } from '../workIntakePublication/contracts';
import { PublicationError } from '../workIntakePublication/errors';
import { canonicalJson } from '../workIntake/domain/canonicalJson';

export type ProposalRevisionInput = {
  proposalId: string;
  revision: number;
  artifact: unknown;
  artifactSha256: string;
  schemaVersion: number;
  actor: string;
  generatorProvenance: Readonly<Record<string, unknown>>;
  changeReason: string;
};

export type StoredProposalRevision = {
  proposalId: string;
  revision: number;
  artifact: unknown;
  artifactSha256: string;
  schemaVersion: number;
  generatorProvenance: Readonly<Record<string, unknown>>;
  changedBy: string;
  changedAt: string;
  changeReason: string;
};

export type StoredProposal = {
  id: string;
  createdBy: string;
  createdAt: string;
  currentRevision: number;
  revisions: StoredProposalRevision[];
};

export type MissingEvidence = { id: string; label: string };

export function allocateProposalId(now = new Date()): string {
  return `WP-${now.getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export type ProposalChangeInput = {
  proposalId?: string;
  artifact: Readonly<Record<string, unknown>>;
  missingEvidence: MissingEvidence[];
  actor: string;
  changeReason: string;
};

export type SavedProposalChange = StoredProposalRevision & {
  intakeRoute: 'assisted-intake' | 'proposal-development';
  missingEvidence: MissingEvidence[];
};

type ProposalRow = {
  id: string;
  created_by: string;
  created_at: Date | string;
};

type ProposalRevisionRow = {
  proposal_id: string;
  revision: number;
  artifact_json: unknown;
  artifact_sha256: string;
  schema_version: number;
  generator_provenance: unknown;
  changed_by: string;
  changed_at: Date | string;
  change_reason: string;
};

export type PublicationClaimInput = {
  sourceKind: 'proposal-revision' | 'authorization' | 'deliverable';
  sourceId: string;
  sourceRevision: number;
  publicationProfileId: string;
  sourceSha256: string;
};

export type PublicationClaim =
  | { status: 'claimed'; publicationId: string; attemptId: string }
  | { status: 'completed'; receipt: PublicationReceipt }
  | { status: 'concurrent' };

type PublicationRow = {
  id: string;
  source_kind: string;
  source_id: string;
  source_revision: number;
  publication_profile_id: string;
  source_sha256: string;
  state: 'publishing' | 'failed' | 'completed';
  active_attempt_id: string;
  lease_expires_at: Date | string;
  receipt_json?: unknown;
  last_error?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  completed_at?: Date | string | null;
};

function jsonValue<T>(value: T | string): T {
  return typeof value === 'string' ? (JSON.parse(value) as T) : value;
}

function iso(value: Date | string): string {
  return new Date(value).toISOString();
}

function storedRevision(row: ProposalRevisionRow): StoredProposalRevision {
  return {
    proposalId: row.proposal_id,
    revision: row.revision,
    artifact: jsonValue(row.artifact_json),
    artifactSha256: row.artifact_sha256,
    schemaVersion: row.schema_version,
    generatorProvenance: jsonValue(
      row.generator_provenance as Readonly<Record<string, unknown>> | string,
    ),
    changedBy: row.changed_by,
    changedAt: iso(row.changed_at),
    changeReason: row.change_reason,
  };
}

export class PostgresWorkIntakeStore {
  constructor(
    private readonly database: Knex,
    private readonly publicationLeaseMs = 5 * 60 * 1000,
  ) {}

  async saveProposalRevision(
    input: ProposalRevisionInput,
  ): Promise<StoredProposalRevision> {
    return this.database.transaction(async transaction => {
      const now = new Date();
      await transaction<ProposalRow>('proposal')
        .insert({
          id: input.proposalId,
          created_by: input.actor,
          created_at: now,
        })
        .onConflict('id')
        .ignore();
      const proposal = await transaction<ProposalRow>('proposal')
        .where({ id: input.proposalId })
        .forUpdate()
        .first();
      this.requireProposalOwner(proposal, input.actor, input.proposalId);

      const existing = await transaction<ProposalRevisionRow>(
        'proposal_revision',
      )
        .where({
          proposal_id: input.proposalId,
          revision: input.revision,
        })
        .first();
      if (existing) {
        if (existing.artifact_sha256 !== input.artifactSha256) {
          throw new PublicationError(
            'RevisionRequired',
            `${input.proposalId} revision ${input.revision} already contains different canonical content.`,
          );
        }
        return storedRevision(existing);
      }

      const latest = await transaction<ProposalRevisionRow>('proposal_revision')
        .where({ proposal_id: input.proposalId })
        .max<{ revision?: number | string | null }>({ revision: 'revision' })
        .first();
      if (
        latest?.revision !== null &&
        latest?.revision !== undefined &&
        input.revision !== Number(latest.revision) + 1
      ) {
        throw new PublicationError(
          'RevisionRequired',
          `${input.proposalId} must advance from revision ${
            latest.revision
          } to ${Number(latest.revision) + 1}.`,
        );
      }

      await transaction<ProposalRevisionRow>('proposal_revision').insert({
        proposal_id: input.proposalId,
        revision: input.revision,
        artifact_json: this.jsonDatabaseValue(input.artifact),
        artifact_sha256: input.artifactSha256,
        schema_version: input.schemaVersion,
        generator_provenance: this.jsonDatabaseValue(input.generatorProvenance),
        changed_by: input.actor,
        changed_at: now,
        change_reason: input.changeReason,
      });
      return (await this.getProposalRevisionWith(
        transaction,
        input.proposalId,
        input.revision,
      ))!;
    });
  }

  async saveProposalChange(
    input: ProposalChangeInput,
  ): Promise<SavedProposalChange> {
    return this.database.transaction(async transaction => {
      const proposalId = input.proposalId ?? allocateProposalId();
      const now = new Date();
      await transaction<ProposalRow>('proposal')
        .insert({ id: proposalId, created_by: input.actor, created_at: now })
        .onConflict('id')
        .ignore();
      const proposal = await transaction<ProposalRow>('proposal')
        .where({ id: proposalId })
        .forUpdate()
        .first();
      this.requireProposalOwner(proposal, input.actor, proposalId);
      const latest = await transaction<ProposalRevisionRow>('proposal_revision')
        .where({ proposal_id: proposalId })
        .max<{ revision?: number | string | null }>({ revision: 'revision' })
        .first();
      const revision =
        latest?.revision === null || latest?.revision === undefined
          ? 0
          : Number(latest.revision) + 1;
      const intakeRoute = input.missingEvidence.length
        ? ('assisted-intake' as const)
        : ('proposal-development' as const);
      const artifact = {
        schemaVersion: 1,
        kind: 'work-intake-record',
        proposal: { id: proposalId, revision },
        intake: {
          route: intakeRoute,
          missingEvidence: input.missingEvidence,
        },
        content: input.artifact,
      };
      const artifactSha256 = createHash('sha256')
        .update(canonicalJson(artifact))
        .digest('hex');
      await transaction<ProposalRevisionRow>('proposal_revision').insert({
        proposal_id: proposalId,
        revision,
        artifact_json: this.jsonDatabaseValue(artifact),
        artifact_sha256: artifactSha256,
        schema_version: 1,
        generator_provenance: this.jsonDatabaseValue({
          name: 'work-intake-backstage',
          component: 'proposal-save-api',
          version: '1.0.0',
        }),
        changed_by: input.actor,
        changed_at: now,
        change_reason: input.changeReason,
      });
      const stored = (await this.getProposalRevisionWith(
        transaction,
        proposalId,
        revision,
      ))!;
      return {
        ...stored,
        intakeRoute,
        missingEvidence: input.missingEvidence,
      };
    });
  }

  async getProposal(
    id: string,
    actor: string,
  ): Promise<StoredProposal | undefined> {
    const proposal = await this.database<ProposalRow>('proposal')
      .where({ id, created_by: actor })
      .first();
    if (!proposal) return undefined;
    const revisions = await this.database<ProposalRevisionRow>(
      'proposal_revision',
    )
      .where({ proposal_id: id })
      .orderBy('revision', 'asc');
    return {
      id: proposal.id,
      createdBy: proposal.created_by,
      createdAt: iso(proposal.created_at),
      currentRevision: revisions.at(-1)!.revision,
      revisions: revisions.map(storedRevision),
    };
  }

  getProposalRevision(
    proposalId: string,
    revision: number,
    actor: string,
  ): Promise<StoredProposalRevision | undefined> {
    return this.database<ProposalRow>('proposal')
      .where({ id: proposalId, created_by: actor })
      .first()
      .then(proposal =>
        proposal
          ? this.getProposalRevisionWith(this.database, proposalId, revision)
          : undefined,
      );
  }

  async claimPublication(
    input: PublicationClaimInput,
  ): Promise<PublicationClaim> {
    return this.database.transaction(async transaction => {
      const publicationId = randomUUID();
      const attemptId = randomUUID();
      const now = new Date();
      const leaseExpiresAt = new Date(now.getTime() + this.publicationLeaseMs);
      await transaction<PublicationRow>('publication')
        .insert({
          id: publicationId,
          source_kind: input.sourceKind,
          source_id: input.sourceId,
          source_revision: input.sourceRevision,
          publication_profile_id: input.publicationProfileId,
          source_sha256: input.sourceSha256,
          state: 'publishing',
          active_attempt_id: attemptId,
          lease_expires_at: leaseExpiresAt,
          created_at: now,
          updated_at: now,
        })
        .onConflict([
          'source_kind',
          'source_id',
          'source_revision',
          'publication_profile_id',
        ])
        .ignore();
      const existing = await transaction<PublicationRow>('publication')
        .where({
          source_kind: input.sourceKind,
          source_id: input.sourceId,
          source_revision: input.sourceRevision,
          publication_profile_id: input.publicationProfileId,
        })
        .forUpdate()
        .first();
      if (!existing) {
        throw new Error('Publication claim was not retained.');
      }
      if (existing.source_sha256 !== input.sourceSha256) {
        throw new PublicationError(
          'RevisionRequired',
          `${input.sourceId} revision ${input.sourceRevision} was already published with different canonical content.`,
        );
      }
      if (existing.id === publicationId) {
        return { status: 'claimed', publicationId, attemptId };
      }
      if (existing.state === 'completed' && existing.receipt_json) {
        return {
          status: 'completed',
          receipt: jsonValue(
            existing.receipt_json as PublicationReceipt | string,
          ),
        };
      }
      if (
        existing.state === 'publishing' &&
        new Date(existing.lease_expires_at).getTime() > now.getTime()
      ) {
        return { status: 'concurrent' };
      }

      await transaction<PublicationRow>('publication')
        .where({ id: existing.id })
        .update({
          state: 'publishing',
          active_attempt_id: attemptId,
          lease_expires_at: leaseExpiresAt,
          updated_at: now,
          last_error: null,
        });
      return { status: 'claimed', publicationId: existing.id, attemptId };
    });
  }

  async failPublication(
    publicationId: string,
    attemptId: string,
    error: string,
  ): Promise<void> {
    await this.database<PublicationRow>('publication')
      .where({
        id: publicationId,
        active_attempt_id: attemptId,
        state: 'publishing',
      })
      .update({
        state: 'failed',
        last_error: error,
        updated_at: new Date(),
      });
  }

  async withPublicationLease<T>(
    publicationId: string,
    attemptId: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    let stopped = false;
    let rejectLeaseLoss!: (error: Error) => void;
    const leaseLoss = new Promise<never>((_resolve, reject) => {
      rejectLeaseLoss = reject;
    });
    const renew = async () => {
      try {
        const retained = await this.renewPublicationLease(
          publicationId,
          attemptId,
        );
        if (!retained) {
          throw new PublicationError(
            'ConcurrentPublication',
            `Publication ${publicationId} lost its fenced attempt lease.`,
          );
        }
      } catch (error) {
        rejectLeaseLoss(
          error instanceof Error ? error : new Error(String(error)),
        );
        return;
      }
      if (!stopped) {
        timer = setTimeout(
          renew,
          Math.max(1, Math.floor(this.publicationLeaseMs / 3)),
        );
        timer.unref();
      }
    };
    timer = setTimeout(
      renew,
      Math.max(1, Math.floor(this.publicationLeaseMs / 3)),
    );
    timer.unref();
    try {
      return await Promise.race([operation(), leaseLoss]);
    } finally {
      stopped = true;
      if (timer) clearTimeout(timer);
    }
  }

  async completePublication(
    publicationId: string,
    attemptId: string,
    receipt: PublicationReceipt,
  ): Promise<void> {
    await this.recordPublicationReceipt(
      publicationId,
      attemptId,
      receipt,
      'completed',
    );
  }

  async recordPartialPublication(
    publicationId: string,
    attemptId: string,
    receipt: PublicationReceipt,
  ): Promise<void> {
    await this.recordPublicationReceipt(
      publicationId,
      attemptId,
      receipt,
      'failed',
    );
  }

  private async recordPublicationReceipt(
    publicationId: string,
    attemptId: string,
    receipt: PublicationReceipt,
    state: 'completed' | 'failed',
  ): Promise<void> {
    await this.database.transaction(async transaction => {
      const active = await transaction<PublicationRow>('publication')
        .where({
          id: publicationId,
          active_attempt_id: attemptId,
          state: 'publishing',
        })
        .forUpdate()
        .first();
      if (!active) {
        throw new PublicationError(
          'ConcurrentPublication',
          `Publication ${publicationId} is owned by a newer attempt.`,
        );
      }
      const artifactIds =
        receipt.artifact.status === 'verified'
          ? receipt.artifact.externalArtifactIds ?? []
          : [];
      await transaction('publication_result')
        .where({ publication_id: publicationId })
        .delete();
      if (receipt.results.length) {
        await transaction('publication_result').insert(
          receipt.results.map(result => ({
            publication_id: publicationId,
            placement_id: result.placementId,
            local_id: result.localId,
            adapter_id: result.adapterId,
            target_id: result.targetId,
            external_id: result.externalId,
            external_key: result.externalKey ?? null,
            external_url: result.url ?? null,
            artifact_ids: this.jsonDatabaseValue(artifactIds),
            published_sha256: result.canonicalArtifactSha256,
            action: result.action,
            state: 'published',
          })),
        );
      }
      const now = new Date();
      await transaction<PublicationRow>('publication')
        .where({ id: publicationId, active_attempt_id: attemptId })
        .update({
          state,
          receipt_json: this.jsonDatabaseValue(receipt),
          last_error:
            state === 'failed'
              ? 'Publication completed only partially and remains retryable.'
              : null,
          updated_at: now,
          completed_at: state === 'completed' ? now : null,
        });
    });
  }

  private async getProposalRevisionWith(
    database: Knex | Knex.Transaction,
    proposalId: string,
    revision: number,
  ): Promise<StoredProposalRevision | undefined> {
    const row = await database<ProposalRevisionRow>('proposal_revision')
      .where({ proposal_id: proposalId, revision })
      .first();
    return row ? storedRevision(row) : undefined;
  }

  private async renewPublicationLease(
    publicationId: string,
    attemptId: string,
  ): Promise<boolean> {
    const now = new Date();
    const updated = await this.database<PublicationRow>('publication')
      .where({
        id: publicationId,
        active_attempt_id: attemptId,
        state: 'publishing',
      })
      .update({
        lease_expires_at: new Date(now.getTime() + this.publicationLeaseMs),
        updated_at: now,
      });
    return updated === 1;
  }

  private requireProposalOwner(
    proposal: ProposalRow | undefined,
    actor: string,
    proposalId: string,
  ): void {
    if (!proposal || proposal.created_by !== actor) {
      throw new PublicationError(
        'AuthorityViolation',
        `${actor} is not authorized to change proposal ${proposalId}.`,
      );
    }
  }

  private jsonDatabaseValue(value: unknown): unknown {
    return this.database.client.config.client === 'pg'
      ? value
      : JSON.stringify(value);
  }
}
