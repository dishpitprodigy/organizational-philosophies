import { z } from 'zod/v3';

const nonEmpty = z.string().min(1);
const entityReference = nonEmpty.regex(/^[a-z][a-z0-9-]*:[^/]+\/.+$/);

const identifiedEvidence = z.object({
  id: nonEmpty,
});

const requirementSchema = identifiedEvidence.extend({
  modality: z.enum(['will', 'shall', 'should']),
  condition: nonEmpty,
  verification: nonEmpty,
});

const acceptanceConditionSchema = identifiedEvidence.extend({
  context: z.string(),
  result: nonEmpty,
  evidenceMethod: nonEmpty,
});

const nonGoalSchema = identifiedEvidence.extend({
  exclusion: nonEmpty,
  reason: z.string(),
});

const dependencySchema = identifiedEvidence.extend({
  dependency: nonEmpty,
  owner: nonEmpty,
  contribution: nonEmpty,
  evidence: nonEmpty,
});

const preconditionSchema = identifiedEvidence.extend({
  condition: nonEmpty,
  evidenceOwner: nonEmpty,
});

const candidateDeliveryRecordSchema = z
  .object({
    id: nonEmpty,
    type: nonEmpty,
    ownerEntity: entityReference,
    affectedEntities: z.array(entityReference),
    title: nonEmpty,
    outcome: nonEmpty,
    deliveryDependsOn: z.array(nonEmpty),
  })
  .passthrough();

export const workProposalArtifactSchema = z
  .object({
    schemaVersion: z.literal(2),
    form: z.object({
      id: nonEmpty,
      version: z.number().int().positive(),
    }),
    answers: z.record(z.unknown()),
    submission: z
      .object({
        requester: nonEmpty,
        requestingTeam: nonEmpty,
        source: nonEmpty,
        authenticatedActor: entityReference,
        submittedAt: z.string().datetime(),
      })
      .passthrough(),
    proposal: z
      .object({
        id: nonEmpty,
        revision: z.number().int().nonnegative(),
        title: nonEmpty,
        state: nonEmpty,
        authority: nonEmpty,
        currentState: z.object({
          summary: nonEmpty,
          baseline: z.object({
            mode: z.enum(['define', 'reference']),
            reference: z.string().optional(),
            delta: z.string().optional(),
          }),
          architecture: nonEmpty,
          workloadEvidence: nonEmpty,
          constraints: nonEmpty,
        }),
        desiredOutcome: z.object({
          summary: nonEmpty,
          scope: nonEmpty,
          capability: nonEmpty,
          proof: nonEmpty,
          horizon: nonEmpty,
        }),
        requiredDifference: z.object({
          summary: nonEmpty,
          preserve: nonEmpty,
          change: nonEmpty,
          evidenceBasis: nonEmpty,
        }),
        requirements: z.array(requirementSchema).min(1),
        acceptanceConditions: z.array(acceptanceConditionSchema).min(1),
        nonGoals: z.array(nonGoalSchema).min(1),
        affectedEntities: z.array(entityReference).min(1),
        dependencies: z.array(dependencySchema),
        preconditions: z.array(preconditionSchema),
        sponsor: z
          .object({
            name: nonEmpty,
            level: nonEmpty,
            accepted: z.boolean(),
            assertedAccepted: z.boolean(),
            verificationStatus: z.enum(['unverified', 'verified']),
            acceptedBy: entityReference.optional(),
            acceptedAt: z.string().datetime().optional(),
            evidence: nonEmpty,
          })
          .superRefine((sponsor, context) => {
            if (
              sponsor.accepted &&
              (sponsor.verificationStatus !== 'verified' ||
                !sponsor.acceptedBy ||
                !sponsor.acceptedAt)
            ) {
              context.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                  'Accepted sponsorship requires attributable evidence tied to the revision.',
              });
            }
          }),
        acceptanceAuthority: nonEmpty,
        knownUncertainty: z.object({
          present: z.boolean(),
          question: z.string(),
          discoveryTimebox: z.string().optional(),
        }),
        reusableArtifact: z
          .object({
            identifier: nonEmpty,
            contents: nonEmpty,
            completionProof: nonEmpty,
          })
          .optional(),
      })
      .passthrough(),
    classifications: z.object({
      workFunctions: z.array(nonEmpty),
      decisionImpacts: z.array(nonEmpty),
      tags: z.array(nonEmpty),
    }),
    routingRequest: z
      .object({
        affectedEntities: z.array(entityReference).min(1),
        facts: z.record(z.unknown()),
      })
      .passthrough(),
    candidateDelivery: z.object({
      authorized: z.boolean(),
      reason: nonEmpty,
      records: z.array(candidateDeliveryRecordSchema),
    }),
    reviews: z.array(z.record(z.unknown())).optional(),
  })
  .passthrough();

export type WorkProposalArtifact = z.infer<typeof workProposalArtifactSchema>;

export const legacyPublicationArtifactSchema = z
  .object({
    schemaVersion: z.literal(1),
    proposal: z.object({ id: nonEmpty }).passthrough(),
    routingRequest: z
      .object({ affectedEntities: z.array(nonEmpty).min(1) })
      .passthrough(),
  })
  .passthrough();

export const publicationArtifactSchema = z.union([
  legacyPublicationArtifactSchema,
  workProposalArtifactSchema,
]);
