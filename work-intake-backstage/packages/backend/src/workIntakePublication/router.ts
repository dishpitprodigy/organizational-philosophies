import { HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { z } from 'zod/v3';

import { workProposalArtifactSchema } from '../workIntake/domain/artifactSchema';
import { canonicalJson } from '../workIntake/domain/canonicalJson';
import { bindSubmissionProvenance } from '../workIntake/domain/submissionProvenance';
import {
  allocateProposalId,
  type PostgresWorkIntakeStore,
} from '../workIntakePersistence/postgresWorkIntakeStore';
import {
  authenticatedActorFromPrincipal,
  type WorkProposalPublication,
} from './contracts';
import { PublicationError } from './errors';

const publicationRequestSchema = z
  .object({
    profileId: z.string().min(1),
    artifact: workProposalArtifactSchema,
  })
  .strict();

const proposalSaveRequestSchema = z
  .object({
    proposalId: z.string().min(1).optional(),
    artifact: z
      .object({
        form: z
          .object({
            id: z.literal('technical-work-proposal'),
            version: z.number().int().positive(),
          })
          .passthrough(),
        answers: z.record(z.unknown()),
        demand: z
          .object({
            requester: z.string(),
            requestingTeam: z.string(),
            title: z.string(),
          })
          .strict(),
        route: z.string().min(1),
        state: z.record(z.unknown()),
      })
      .strict(),
    reviewableArtifact: z.record(z.unknown()).optional(),
    missingEvidence: z.array(
      z.object({ id: z.string().min(1), label: z.string().min(1) }).strict(),
    ),
    changeReason: z.string().min(1),
  })
  .strict();

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function publicationErrorResponse(error: PublicationError) {
  const statusByKind: Record<PublicationError['kind'], number> = {
    InvalidArtifact: 400,
    CatalogRoutingFailure: 422,
    AuthorityViolation: 403,
    CapacityNotAccepted: 409,
    ProfileNotAllowed: 403,
    TargetConfigurationError: 500,
    TargetAuthenticationError: 502,
    TargetUnavailable: 503,
    RevisionRequired: 409,
    ConcurrentPublication: 409,
    IndeterminatePublication: 409,
    PartialPublication: 409,
  };
  return {
    status: statusByKind[error.kind],
    body: {
      error: {
        kind: error.kind,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
      },
    },
  };
}

export function createRouter(options: {
  httpAuth: HttpAuthService;
  publication: WorkProposalPublication;
  logger: LoggerService;
  store?: Pick<
    PostgresWorkIntakeStore,
    'getProposal' | 'getProposalRevision' | 'saveProposalChange'
  >;
}) {
  const router = Router();
  router.use(express.json({ limit: '1mb' }));

  async function actor(req: express.Request) {
    const credentials = await options.httpAuth.credentials(req, {
      allow: ['user'],
    });
    return authenticatedActorFromPrincipal(credentials.principal.userEntityRef);
  }

  async function requestBody(
    req: express.Request,
    res: express.Response,
    principal: string,
  ) {
    const supplied = req.body as { artifact?: unknown };
    const artifact =
      supplied?.artifact &&
      typeof supplied.artifact === 'object' &&
      !Array.isArray(supplied.artifact)
        ? bindSubmissionProvenance(
            supplied.artifact as Record<string, unknown>,
            principal,
          )
        : supplied?.artifact;
    const parsed = publicationRequestSchema.safeParse({
      ...(req.body as object),
      artifact,
    });
    if (!parsed.success) {
      res.status(400).json({
        error: {
          kind: 'InvalidArtifact',
          message: 'Expected a profileId and valid Work Proposal artifact.',
        },
      });
      return undefined;
    }
    return parsed.data;
  }

  async function invoke(
    req: express.Request,
    res: express.Response,
    operation: 'preview' | 'publish',
  ) {
    const authenticatedActor = await actor(req);
    const body = await requestBody(req, res, authenticatedActor.principal);
    if (!body) return;
    try {
      res.json(await options.publication[operation](authenticatedActor, body));
    } catch (error) {
      options.logger.error(`Work proposal ${operation} failed`, {
        profileId: body.profileId,
        error: errorMessage(error),
      });
      if (error instanceof PublicationError) {
        const response = publicationErrorResponse(error);
        res.status(response.status).json(response.body);
        return;
      }
      res.status(500).json({
        error: {
          kind: 'TargetConfigurationError',
          message: 'Publication request failed.',
        },
      });
    }
  }

  router.get('/profiles', async (req, res) => {
    const authenticatedActor = await actor(req);
    try {
      res.json(await options.publication.profiles(authenticatedActor));
    } catch (error) {
      options.logger.error('Work proposal profile lookup failed', {
        error: errorMessage(error),
      });
      if (error instanceof PublicationError) {
        const response = publicationErrorResponse(error);
        res.status(response.status).json(response.body);
        return;
      }
      res.status(500).json({
        error: {
          kind: 'TargetConfigurationError',
          message: 'Publication profile lookup failed.',
        },
      });
    }
  });
  router.post('/proposals', async (req, res) => {
    const authenticatedActor = await actor(req);
    const parsed = proposalSaveRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          kind: 'InvalidArtifact',
          message:
            'Expected a structured intake artifact, missing-evidence inventory, and change reason.',
        },
      });
      return;
    }
    if (!options.store) {
      res.status(503).json({
        error: {
          kind: 'TargetConfigurationError',
          message: 'Work Intake persistence is unavailable.',
        },
      });
      return;
    }
    const proposalId = parsed.data.proposalId ?? allocateProposalId();
    const reviewableArtifact =
      parsed.data.reviewableArtifact && !parsed.data.proposalId
        ? {
            ...parsed.data.reviewableArtifact,
            proposal: {
              ...(parsed.data.reviewableArtifact.proposal as object),
              id: proposalId,
              revision: 0,
            },
          }
        : parsed.data.reviewableArtifact;
    const boundReviewable = reviewableArtifact
      ? bindSubmissionProvenance(
          reviewableArtifact,
          authenticatedActor.principal,
        )
      : undefined;
    const reviewable = workProposalArtifactSchema.safeParse(boundReviewable);
    if (parsed.data.reviewableArtifact && !reviewable.success) {
      res.status(400).json({
        error: {
          kind: 'InvalidArtifact',
          message: 'The claimed reviewable proposal is structurally invalid.',
        },
      });
      return;
    }
    if (
      reviewable.success &&
      (reviewable.data.form.id !== parsed.data.artifact.form.id ||
        reviewable.data.form.version !== parsed.data.artifact.form.version ||
        canonicalJson(reviewable.data.answers) !==
          canonicalJson(parsed.data.artifact.answers) ||
        reviewable.data.proposal.title !== parsed.data.artifact.demand.title ||
        (parsed.data.proposalId !== undefined &&
          reviewable.data.proposal.id !== parsed.data.proposalId))
    ) {
      res.status(400).json({
        error: {
          kind: 'InvalidArtifact',
          message:
            'The saved intake record contradicts its claimed reviewable proposal.',
        },
      });
      return;
    }
    const missingEvidence = [...parsed.data.missingEvidence];
    if (!reviewable.success) {
      missingEvidence.push({
        id: 'reviewable-proposal',
        label: 'Evidence required for a reviewable proposal',
      });
    }
    const { reviewableArtifact: _reviewableArtifact, ...saveRequest } =
      parsed.data;
    try {
      const saved = await options.store.saveProposalChange({
        ...saveRequest,
        proposalId,
        missingEvidence: Array.from(
          new Map(missingEvidence.map(item => [item.id, item])).values(),
        ),
        actor: authenticatedActor.principal,
      });
      res.status(201).json(saved);
    } catch (error) {
      if (error instanceof PublicationError) {
        const response = publicationErrorResponse(error);
        res.status(response.status).json(response.body);
        return;
      }
      throw error;
    }
  });
  router.get('/proposals/:id', async (req, res) => {
    const authenticatedActor = await actor(req);
    const proposal = await options.store?.getProposal(
      req.params.id,
      authenticatedActor.principal,
    );
    if (!proposal) {
      res.status(404).json({
        error: {
          kind: 'NotFound',
          message: `Proposal ${req.params.id} was not found.`,
        },
      });
      return;
    }
    res.json(proposal);
  });
  router.get('/proposals/:id/:revision', async (req, res) => {
    const authenticatedActor = await actor(req);
    const revision = Number(req.params.revision);
    if (!Number.isSafeInteger(revision) || revision < 0) {
      res.status(400).json({
        error: {
          kind: 'InvalidRevision',
          message: 'Proposal revision must be a non-negative integer.',
        },
      });
      return;
    }
    const proposalRevision = await options.store?.getProposalRevision(
      req.params.id,
      revision,
      authenticatedActor.principal,
    );
    if (!proposalRevision) {
      res.status(404).json({
        error: {
          kind: 'NotFound',
          message: `Proposal ${req.params.id} revision ${revision} was not found.`,
        },
      });
      return;
    }
    res.json(proposalRevision);
  });
  router.post('/preview', (req, res) => invoke(req, res, 'preview'));
  router.post('/publish', (req, res) => invoke(req, res, 'publish'));
  return router;
}
