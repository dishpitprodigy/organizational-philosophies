import type { Knex } from 'knex';

import type {
  JournalEntry,
  JournalKey,
  JournalObservation,
  PublicationJournal,
} from '../workIntakePublication/contracts';
import { PublicationError } from '../workIntakePublication/errors';

type JournalRow = {
  profile_id: string;
  placement_id: string;
  adapter_id: string;
  target_id: string;
  proposal_id: string;
  proposal_revision: number;
  local_id: string;
  logical_fingerprint: string;
  target_fingerprint: string;
  mapping_version: number;
  state: JournalEntry['state'];
  external_id?: string | null;
  external_url?: string | null;
  last_observation?: JournalEntry['lastObservation'] | string | null;
};

const journalIdentityColumns = [
  'profile_id',
  'placement_id',
  'adapter_id',
  'target_id',
  'proposal_id',
  'proposal_revision',
  'local_id',
] as const;

function requireMatchingFingerprint(
  existing: JournalRow | undefined,
  entry: JournalEntry,
) {
  if (existing?.target_fingerprint !== entry.targetFingerprint) {
    throw new PublicationError(
      'RevisionRequired',
      `${entry.localId} changed without a proposal revision increment.`,
    );
  }
}

function keyWhere(key: JournalKey) {
  return {
    profile_id: key.profileId,
    placement_id: key.placementId,
    adapter_id: key.adapterId,
    target_id: key.targetId,
    proposal_id: key.proposalId,
    proposal_revision: key.proposalRevision,
    local_id: key.localId,
  };
}

function toRow(entry: JournalEntry, client: string): JournalRow {
  let lastObservation: JournalRow['last_observation'] = null;
  if (entry.lastObservation) {
    lastObservation =
      client === 'pg'
        ? entry.lastObservation
        : JSON.stringify(entry.lastObservation);
  }
  return {
    ...keyWhere(entry),
    logical_fingerprint: entry.logicalFingerprint,
    target_fingerprint: entry.targetFingerprint,
    mapping_version: entry.mappingVersion,
    state: entry.state,
    external_id: entry.externalId ?? null,
    external_url: entry.url ?? null,
    last_observation: lastObservation,
  };
}

function fromRow(row: JournalRow): JournalEntry {
  const lastObservation =
    typeof row.last_observation === 'string'
      ? JSON.parse(row.last_observation)
      : row.last_observation;
  return {
    profileId: row.profile_id,
    placementId: row.placement_id,
    adapterId: row.adapter_id,
    targetId: row.target_id,
    proposalId: row.proposal_id,
    proposalRevision: row.proposal_revision,
    localId: row.local_id,
    logicalFingerprint: row.logical_fingerprint,
    targetFingerprint: row.target_fingerprint,
    mappingVersion: row.mapping_version,
    state: row.state,
    ...(row.external_id ? { externalId: row.external_id } : {}),
    ...(row.external_url ? { url: row.external_url } : {}),
    ...(lastObservation ? { lastObservation } : {}),
  };
}

export class DatabasePublicationJournal implements PublicationJournal {
  private readonly localLocks = new Set<string>();

  constructor(private readonly database: Knex) {}

  private get client(): string {
    return this.database.client.config.client;
  }

  async withLock<T>(identity: string, operation: () => Promise<T>): Promise<T> {
    if (this.database.client.config.client !== 'pg') {
      if (this.localLocks.has(identity)) {
        throw new PublicationError(
          'ConcurrentPublication',
          `Publication ${identity} is already running.`,
        );
      }
      this.localLocks.add(identity);
      try {
        return await operation();
      } finally {
        this.localLocks.delete(identity);
      }
    }

    const connection = await this.database.client.acquireConnection();
    try {
      const claim = await this.database
        .raw(
          'SELECT pg_try_advisory_lock(hashtextextended(?, 0)) AS acquired',
          [identity],
        )
        .connection(connection);
      if (!claim.rows[0]?.acquired) {
        throw new PublicationError(
          'ConcurrentPublication',
          `Publication ${identity} is already running.`,
        );
      }
      try {
        return await operation();
      } finally {
        await this.database
          .raw('SELECT pg_advisory_unlock(hashtextextended(?, 0))', [identity])
          .connection(connection);
      }
    } finally {
      await this.database.client.releaseConnection(connection);
    }
  }

  async observe(keys: JournalKey[]): Promise<JournalObservation> {
    const entries: JournalEntry[] = [];
    for (const key of keys) {
      const row = await this.database<JournalRow>('publication_journal_entry')
        .where(keyWhere(key))
        .first();
      if (row) entries.push(fromRow(row));
    }
    return { entries };
  }

  async reserve(entries: JournalEntry[]): Promise<void> {
    await this.database.transaction(async transaction => {
      for (const entry of entries) {
        await transaction<JournalRow>('publication_journal_entry')
          .insert(toRow(entry, this.client))
          .onConflict([...journalIdentityColumns])
          .ignore();
        const existing = await transaction<JournalRow>(
          'publication_journal_entry',
        )
          .where(keyWhere(entry))
          .first();
        requireMatchingFingerprint(existing, entry);
      }
    });
  }

  async recordPublished(entries: JournalEntry[]): Promise<void> {
    await this.database.transaction(async transaction => {
      for (const entry of entries) {
        const existing = await transaction<JournalRow>(
          'publication_journal_entry',
        )
          .where(keyWhere(entry))
          .first();
        if (existing) requireMatchingFingerprint(existing, entry);
        await transaction<JournalRow>('publication_journal_entry')
          .insert(toRow(entry, this.client))
          .onConflict([...journalIdentityColumns])
          .merge(toRow(entry, this.client));
      }
    });
  }
}
