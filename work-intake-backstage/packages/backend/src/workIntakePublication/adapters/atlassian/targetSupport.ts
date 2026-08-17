import { createHash } from 'node:crypto';

import type {
  JournalObservation,
  PublicationRecord,
  PublicationRelation,
  PublicationTarget,
  ResolvedTargetBinding,
  StructuredPublicationContent,
  TargetBatch,
  TargetObservation,
  TargetReceipt,
  TargetStatus,
} from '../../contracts';
import { AtlassianTransport, toAdf } from './transport';

type SearchResult = { issues?: Array<{ id: string; key: string }> };

export type AtlassianTargetTransport = Pick<
  AtlassianTransport,
  | 'baseUrl'
  | 'project'
  | 'search'
  | 'request'
  | 'setIssueProperty'
  | 'ensureLink'
>;

type AtlassianTargetOptions = {
  id: 'jira' | 'jpd';
  transport: AtlassianTargetTransport;
  issueType(record: PublicationRecord): string;
  additionalFields?(
    record: PublicationRecord,
  ): Promise<Record<string, unknown>>;
};

const PUBLICATION_PROPERTY = 'northstar.publication';

function publicationLabel(idempotencyKey: string) {
  const digest = createHash('sha256')
    .update(idempotencyKey)
    .digest('hex')
    .slice(0, 16);
  return `nwi-${digest}`;
}

function structuredText(content: StructuredPublicationContent) {
  const lines: string[] = [];
  for (const field of content.summary ?? [])
    lines.push(`${field.label}: ${field.value}`);
  for (const section of content.sections) {
    if (lines.length) lines.push('');
    lines.push(section.heading);
    lines.push(...(section.paragraphs ?? []));
    lines.push(
      ...(section.fields ?? []).map(field => `${field.label}: ${field.value}`),
    );
    lines.push(...(section.items ?? []).map(item => `- ${item}`));
  }
  return lines.join('\n');
}

function legacyDescription(record: PublicationRecord) {
  if (record.kind !== 'ordered-review') return structuredText(record.content);
  const decisionOwner = record.content.summary?.find(
    field => field.label === 'Decision Owner',
  )?.value;
  const initialState = record.content.summary?.find(
    field => field.label === 'Initial state',
  )?.value;
  return [
    `Decision Owner: ${decisionOwner}`,
    `Initial state: ${initialState}`,
    '',
    'This issue is a projection of an ordered review record. Resolving it does not commit delivery capacity.',
  ].join('\n');
}

function recordLabels(record: PublicationRecord) {
  let labels: string[];
  if (record.kind === 'proposal') {
    labels = ['northstar-work-intake', 'work-proposal'];
  } else if (record.kind === 'ordered-review') {
    labels = ['northstar-work-intake', 'review-record'];
  } else {
    labels = ['northstar-delivery', 'authorized-work-proposal'];
  }
  return [...labels, publicationLabel(record.idempotencyKey)];
}

function linkType(relation: PublicationRelation) {
  return relation.type === 'blocks' || relation.type === 'precedes'
    ? 'Blocks'
    : 'Relates';
}

export class AtlassianPublicationTarget implements PublicationTarget {
  readonly id: string;

  constructor(private readonly options: AtlassianTargetOptions) {
    this.id = options.id;
  }

  async status(binding: ResolvedTargetBinding): Promise<TargetStatus> {
    try {
      await this.options.transport.project(binding.target.targetId);
      return { available: true };
    } catch (error) {
      return {
        available: false,
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async observe(
    batch: TargetBatch,
    journal: JournalObservation,
  ): Promise<TargetObservation> {
    const results: TargetObservation['results'] = [];
    for (const record of batch.records) {
      try {
        const issue = await this.find(record, batch.binding.target.targetId);
        if (!issue) {
          results.push({ localId: record.localId, status: 'absent' });
          continue;
        }
        const property = await this.options.transport.request<{
          value?: { targetFingerprint?: string; fingerprint?: string };
        }>(
          `/issue/${encodeURIComponent(
            issue.key,
          )}/properties/${encodeURIComponent(PUBLICATION_PROPERTY)}`,
        );
        const observedFingerprint = property.value?.targetFingerprint;
        const legacy = journal.entries.find(
          entry =>
            entry.localId === record.localId && entry.mappingVersion === 0,
        );
        const legacyFingerprint = this.legacyFingerprint(
          record,
          batch.binding.target.targetId,
        );
        const compatibleLegacy =
          legacy !== undefined &&
          property.value?.fingerprint === legacyFingerprint &&
          (!legacy.logicalFingerprint ||
            legacy.logicalFingerprint === legacyFingerprint);
        results.push({
          localId: record.localId,
          status:
            observedFingerprint === batch.targetFingerprints[record.localId] ||
            compatibleLegacy
              ? 'found'
              : 'conflict',
          externalId: issue.id,
          externalKey: issue.key,
          url: this.issueUrl(issue.key),
          targetFingerprint: compatibleLegacy
            ? batch.targetFingerprints[record.localId]
            : observedFingerprint,
          evidence: {
            publicationLabel: publicationLabel(record.idempotencyKey),
          },
        });
      } catch (error) {
        results.push({
          localId: record.localId,
          status: 'indeterminate',
          evidence: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    }
    return { results };
  }

  async apply(batch: TargetBatch): Promise<TargetReceipt> {
    const results: TargetReceipt['results'] = [];
    const externalKeys = new Map<string, string>();
    for (const record of batch.records) {
      const existing = await this.find(record, batch.binding.target.targetId);
      const parent =
        record.kind === 'ordered-review'
          ? await this.findLocalId(batch, 'proposal')
          : undefined;
      const additionalFields =
        (await this.options.additionalFields?.(record)) ?? {};
      const fields = {
        project: { key: batch.binding.target.targetId },
        issuetype: { name: this.options.issueType(record) },
        summary: record.title,
        description: toAdf(structuredText(record.content)),
        labels: recordLabels(record),
        ...(parent ? { parent: { key: parent.key } } : {}),
        ...additionalFields,
      };
      const property = {
        profileId: batch.profileId,
        placementId: batch.placementId,
        proposalId: record.identity.proposalId,
        proposalRevision: record.identity.proposalRevision,
        localId: record.localId,
        logicalFingerprint: record.logicalFingerprint,
        targetFingerprint: batch.targetFingerprints[record.localId],
        mappingVersion: batch.mappingVersion,
        artifactSha256: batch.artifact.sha256,
      };
      let externalId: string;
      let externalKey: string;
      let action: 'created' | 'reconciled';
      if (existing) {
        externalId = existing.id;
        externalKey = existing.key;
        action = 'reconciled';
        await this.options.transport.request(
          `/issue/${encodeURIComponent(externalKey)}`,
          {
            method: 'PUT',
            body: { fields },
          },
        );
        await this.options.transport.setIssueProperty(
          externalKey,
          PUBLICATION_PROPERTY,
          property,
        );
      } else {
        const created = await this.options.transport.request<{
          id: string;
          key: string;
        }>('/issue', {
          method: 'POST',
          body: {
            fields,
            properties: [{ key: PUBLICATION_PROPERTY, value: property }],
          },
        });
        externalId = created.id;
        externalKey = created.key;
        action = 'created';
      }
      externalKeys.set(record.localId, externalKey);
      results.push({
        localId: record.localId,
        idempotencyKey: record.idempotencyKey,
        targetFingerprint: batch.targetFingerprints[record.localId],
        externalId,
        externalKey,
        url: this.issueUrl(externalKey),
        action,
      });
    }

    const relations: TargetReceipt['relations'] = [];
    for (const relation of batch.relations) {
      const from =
        externalKeys.get(relation.fromLocalId) ??
        (await this.findLocalId(batch, relation.fromLocalId))?.key;
      const to =
        externalKeys.get(relation.toLocalId) ??
        (await this.findLocalId(batch, relation.toLocalId))?.key;
      if (!from || !to) continue;
      const linked = await this.options.transport.ensureLink({
        type: linkType(relation),
        inwardKey: to,
        outwardKey: from,
      });
      relations.push({
        type: relation.type,
        action: linked.created ? 'created' : 'reused',
      });
    }
    return { results, relations };
  }

  private async find(record: PublicationRecord, projectKey: string) {
    const label = publicationLabel(record.idempotencyKey);
    const result = (await this.options.transport.search(
      `project = "${projectKey}" AND labels = "${label}"`,
      ['id', 'key'],
    )) as SearchResult;
    if ((result.issues?.length ?? 0) > 1)
      throw new Error(`Multiple Atlassian records use ${label}.`);
    return result.issues?.[0];
  }

  private async findLocalId(batch: TargetBatch, localId: string) {
    const identity = batch.records[0]?.identity;
    if (!identity) return undefined;
    return this.find(
      {
        ...batch.records[0],
        localId,
        idempotencyKey: `${identity.proposalId}:rev-${identity.proposalRevision}:${localId}`,
      },
      batch.binding.target.targetId,
    );
  }

  private issueUrl(issueKey: string) {
    return `${this.options.transport.baseUrl}/browse/${encodeURIComponent(
      issueKey,
    )}`;
  }

  private legacyFingerprint(record: PublicationRecord, projectKey: string) {
    const labels = recordLabels(record);
    return createHash('sha256')
      .update(
        JSON.stringify({
          localId: record.localId,
          projectKey,
          issueType: this.options.issueType(record),
          parentLocalId: record.kind === 'ordered-review' ? 'proposal' : null,
          summary: record.title,
          description: legacyDescription(record),
          labels,
        }),
      )
      .digest('hex');
  }
}
