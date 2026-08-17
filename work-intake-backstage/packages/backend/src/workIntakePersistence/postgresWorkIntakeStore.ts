import { randomUUID } from 'node:crypto';

import type { Knex } from 'knex';

import type { PublicationReceipt } from '../workIntakePublication/contracts';
import { PublicationError } from '../workIntakePublication/errors';

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
  | { status: 'claimed'; publicationId: string }
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
  private readonly publicationAttemptTimeoutMs: number;

  constructor(
    private readonly database: Knex,
    options: { publicationAttemptTimeoutMs?: number } = {},
  ) {
    this.publicationAttemptTimeoutMs =
      options.publicationAttemptTimeoutMs ?? 5 * 60 * 1000;
  }

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

  async getProposal(id: string): Promise<StoredProposal | undefined> {
    const proposal = await this.database<ProposalRow>('proposal')
      .where({ id })
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
  ): Promise<StoredProposalRevision | undefined> {
    return this.getProposalRevisionWith(this.database, proposalId, revision);
  }

  async claimPublication(
    input: PublicationClaimInput,
  ): Promise<PublicationClaim> {
    return this.database.transaction(async transaction => {
      const publicationId = randomUUID();
      const now = new Date();
      await transaction<PublicationRow>('publication')
        .insert({
          id: publicationId,
          source_kind: input.sourceKind,
          source_id: input.sourceId,
          source_revision: input.sourceRevision,
          publication_profile_id: input.publicationProfileId,
          source_sha256: input.sourceSha256,
          state: 'publishing',
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
        return { status: 'claimed', publicationId };
      }
      if (existing.state === 'completed' && existing.receipt_json) {
        return {
          status: 'completed',
          receipt: jsonValue(
            existing.receipt_json as PublicationReceipt | string,
          ),
        };
      }
      if (existing.state === 'publishing') {
        const attemptAge =
          now.getTime() - new Date(existing.updated_at).getTime();
        if (attemptAge < this.publicationAttemptTimeoutMs) {
          return { status: 'concurrent' };
        }
        await transaction<PublicationRow>('publication')
          .where({ id: existing.id })
          .update({ updated_at: now, last_error: null });
        return { status: 'claimed', publicationId: existing.id };
      }

      await transaction<PublicationRow>('publication')
        .where({ id: existing.id, state: 'failed' })
        .update({ state: 'publishing', updated_at: now, last_error: null });
      return { status: 'claimed', publicationId: existing.id };
    });
  }

  async failPublication(publicationId: string, error: string): Promise<void> {
    await this.database<PublicationRow>('publication')
      .where({ id: publicationId })
      .update({
        state: 'failed',
        last_error: error,
        updated_at: new Date(),
      });
  }

  async completePublication(
    publicationId: string,
    receipt: PublicationReceipt,
  ): Promise<void> {
    await this.database.transaction(async transaction => {
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
            external_key: result.externalId,
            external_url: result.url ?? null,
            artifact_ids: this.jsonDatabaseValue({
              canonical: receipt.artifact,
            }),
            published_sha256: result.canonicalArtifactSha256,
            action: result.action,
            state: 'published',
          })),
        );
      }
      const now = new Date();
      await transaction<PublicationRow>('publication')
        .where({ id: publicationId })
        .update({
          state: 'completed',
          receipt_json: this.jsonDatabaseValue(receipt),
          last_error: null,
          updated_at: now,
          completed_at: now,
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

  private jsonDatabaseValue(value: unknown): unknown {
    return this.database.client.config.client === 'pg'
      ? value
      : JSON.stringify(value);
  }
}
