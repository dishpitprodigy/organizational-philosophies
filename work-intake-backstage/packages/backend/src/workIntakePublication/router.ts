import { HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { z } from 'zod/v3';

import { workProposalArtifactSchema } from '../workIntake/domain/artifactSchema';
import { bindSubmissionProvenance } from '../workIntake/domain/submissionProvenance';
import type { PostgresWorkIntakeStore } from '../workIntakePersistence/postgresWorkIntakeStore';
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
  store?: Pick<PostgresWorkIntakeStore, 'getProposal' | 'getProposalRevision'>;
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
  router.get('/proposals/:id', async (req, res) => {
    await actor(req);
    const proposal = await options.store?.getProposal(req.params.id);
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
    await actor(req);
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
