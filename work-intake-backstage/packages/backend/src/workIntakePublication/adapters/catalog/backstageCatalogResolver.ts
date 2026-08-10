import type { WorkProposalArtifact } from '../../../workIntake/domain/artifactSchema';
import type {
  AuthenticatedActor,
  ResolvedCatalogRouting,
} from '../../contracts';
import type {
  CatalogPublicationResolution,
  CatalogPublicationResolver,
  CatalogReview,
} from '../../publicationService';
import { PublicationError } from '../../errors';

const PROJECT = 'northstar.example/jira-project-key';
const REVIEWER = 'northstar.example/technical-reviewer-role';
const REVIEW_PROFILE = 'northstar.example/work-intake-review-profile';
const DEPENDS_ON = 'northstar.example/depends-on';

type CatalogEntity = {
  kind?: string;
  metadata?: {
    name?: string;
    namespace?: string;
    title?: string;
    tags?: string[];
    annotations?: Record<string, string>;
  };
  spec?: { type?: string };
  relations?: Array<{ type: string; targetRef: string }>;
};

function normalize(ref: string) {
  const match = ref.match(/^([^:]+):(?:(.+)\/)?([^/]+)$/);
  if (!match)
    throw new PublicationError(
      'CatalogRoutingFailure',
      `Invalid entity reference ${ref}.`,
    );
  return `${match[1].toLowerCase()}:${(
    match[2] ?? 'default'
  ).toLowerCase()}/${match[3].toLowerCase()}`;
}

function entityRef(entity: CatalogEntity) {
  return `${entity.kind?.toLowerCase()}:${(
    entity.metadata?.namespace ?? 'default'
  ).toLowerCase()}/${entity.metadata?.name?.toLowerCase()}`;
}

export class BackstageCatalogPublicationResolver
  implements CatalogPublicationResolver
{
  constructor(private readonly entities: () => Promise<CatalogEntity[]>) {}

  async resolve(
    artifact: WorkProposalArtifact,
    _actor: AuthenticatedActor,
  ): Promise<CatalogPublicationResolution> {
    const all = await this.entities();
    const byRef = new Map(all.map(entity => [entityRef(entity), entity]));
    const affectedEntities = this.closure(
      artifact.routingRequest.affectedEntities,
      byRef,
    );
    const affected = affectedEntities.map(ref => byRef.get(ref)!);
    const reviews = this.reviews(artifact, affected, affectedEntities, byRef);
    const deliveries: CatalogPublicationResolution['deliveries'] = {};
    for (const record of artifact.candidateDelivery.records) {
      const owner = byRef.get(normalize(record.ownerEntity));
      const ownerGroupRef =
        owner?.kind?.toLowerCase() === 'group'
          ? normalize(record.ownerEntity)
          : owner?.relations?.find(relation => relation.type === 'ownedBy')
              ?.targetRef;
      const ownerGroup = ownerGroupRef
        ? byRef.get(normalize(ownerGroupRef))
        : undefined;
      const targetId = ownerGroup?.metadata?.annotations?.[PROJECT];
      if (!ownerGroup || ownerGroup.spec?.type !== 'team' || !targetId) {
        throw new PublicationError(
          'CatalogRoutingFailure',
          `Delivery record ${record.id} does not resolve to a configured Backstage delivery team.`,
        );
      }
      const recordClosure = this.closure(record.affectedEntities, byRef);
      const owned = new Set<string>();
      for (const ref of recordClosure) {
        const entity = byRef.get(ref)!;
        if (entity.kind?.toLowerCase() === 'group') owned.add(ref);
        for (const relation of entity.relations ?? []) {
          if (relation.type === 'ownedBy')
            owned.add(normalize(relation.targetRef));
        }
      }
      if (!owned.has(normalize(ownerGroupRef!))) {
        throw new PublicationError(
          'CatalogRoutingFailure',
          `${normalize(ownerGroupRef!)} does not own an affected entity for ${
            record.id
          }.`,
        );
      }
      const routing: ResolvedCatalogRouting = {
        affectedEntities: recordClosure,
        ownerEntity: normalize(record.ownerEntity),
        ownerGroup: normalize(ownerGroupRef!),
        deliveryTargetId: targetId,
        evidence: { source: 'backstage-catalog', projectKey: targetId },
      };
      deliveries[record.id] = { recordId: record.id, targetId, routing };
    }
    return {
      proposalRouting: {
        affectedEntities,
        evidence: { source: 'backstage-catalog' },
      },
      reviews,
      deliveries,
    };
  }

  private closure(start: string[], byRef: Map<string, CatalogEntity>) {
    const found = new Set<string>();
    const queue = start.map(normalize);
    while (queue.length) {
      const ref = queue.shift()!;
      if (found.has(ref)) continue;
      const entity = byRef.get(ref);
      if (!entity) {
        throw new PublicationError(
          'CatalogRoutingFailure',
          `Backstage catalog entity not found: ${ref}`,
        );
      }
      found.add(ref);
      queue.push(
        ...(entity.relations ?? [])
          .filter(relation => relation.type === 'dependsOn')
          .map(relation => normalize(relation.targetRef)),
        ...String(entity.metadata?.annotations?.[DEPENDS_ON] ?? '')
          .split(',')
          .map(value => value.trim())
          .filter(Boolean)
          .map(normalize),
      );
    }
    return [...found];
  }

  private reviews(
    artifact: WorkProposalArtifact,
    affected: CatalogEntity[],
    affectedRefs: string[],
    byRef: Map<string, CatalogEntity>,
  ) {
    const reviews: CatalogReview[] = [];
    const add = (
      stage: number,
      name: string,
      groupName: string,
      reason: string,
    ) => {
      const group = byRef.get(`group:default/${groupName}`);
      const decisionOwner = group?.metadata?.annotations?.[REVIEWER];
      if (!decisionOwner) {
        throw new PublicationError(
          'CatalogRoutingFailure',
          `Backstage review group ${groupName} has no reviewer annotation.`,
        );
      }
      reviews.push({ stage, name, decisionOwner, reason });
    };
    add(
      1,
      'Administrative Authority Review',
      'portfolio',
      'Decides whether the proposal may consume evaluation capacity.',
    );
    const facts = artifact.routingRequest.facts as Record<string, unknown>;
    const tags = new Set(
      affected.flatMap(entity => entity.metadata?.tags ?? []),
    );
    const profiles = affected
      .map(entity => entity.metadata?.annotations?.[REVIEW_PROFILE] ?? '')
      .join(' ');
    if (
      facts.production ||
      facts.customerFacing ||
      facts.sensitiveData ||
      facts.authenticationPath ||
      facts.internetExposed ||
      tags.has('production') ||
      tags.has('internet-facing') ||
      /authentication|internet|sensitive-data/.test(profiles)
    )
      add(
        2,
        'Security Review Board',
        'security',
        'Catalog facts cross a security or production boundary.',
      );
    if (facts.sensitiveData || /sensitive-data/.test(profiles))
      add(
        3,
        'Privacy & Data Review',
        'privacy',
        'Catalog facts identify a sensitive-data boundary.',
      );
    if (facts.purchase || Number(facts.spendUsd) > 0)
      add(
        3,
        'Finance & Procurement Review',
        'finance',
        'The proposal may create a financial commitment.',
      );
    if (
      affectedRefs.length > 1 ||
      ['Migration', 'Redesign'].includes(String(facts.intent))
    )
      add(
        3,
        'Architecture Review',
        'architecture',
        'The dependency closure crosses system boundaries.',
      );
    if (
      facts.production ||
      facts.customerFacing ||
      tags.has('production') ||
      tags.has('customer-facing')
    )
      add(
        3,
        'Reliability & Operations Review',
        'sre',
        'Catalog facts identify a production operating condition.',
      );
    const owners = new Set(
      affected.flatMap(entity =>
        (entity.relations ?? [])
          .filter(relation => relation.type === 'ownedBy')
          .map(relation => normalize(relation.targetRef)),
      ),
    );
    for (const ref of owners) {
      const group = byRef.get(ref);
      if (group?.spec?.type !== 'team') continue;
      const decisionOwner = group.metadata?.annotations?.[REVIEWER];
      if (!decisionOwner) continue;
      reviews.push({
        stage: 3,
        name: `${
          group.metadata?.title ?? group.metadata?.name
        } Technical Review`,
        decisionOwner,
        reason: `${
          group.metadata?.title ?? group.metadata?.name
        } owns an affected catalog entity.`,
      });
    }
    return reviews;
  }
}
