import { HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';

import { publicationArtifactSchema } from '../workIntake/domain/artifactSchema';
import { bindSubmissionProvenance } from '../workIntake/domain/submissionProvenance';
import {
  authenticatedActorFromPrincipal,
  type WorkProposalPublication,
} from '../workIntakePublication/contracts';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function createRouter(options: {
  httpAuth: HttpAuthService;
  publication: WorkProposalPublication;
  logger: LoggerService;
}) {
  const router = Router();
  router.use(express.json({ limit: '1mb' }));

  router.get('/health', async (req, res) => {
    const credentials = await options.httpAuth.credentials(req, {
      allow: ['user'],
    });
    try {
      const profiles = await options.publication.profiles(
        authenticatedActorFromPrincipal(credentials.principal.userEntityRef),
      );
      const jira = profiles.find(
        profile => profile.id === 'jira-work-management',
      );
      res.json({
        connected: jira?.available === true,
        ...(jira?.unavailableReason ? { error: jira.unavailableReason } : {}),
      });
    } catch (error) {
      options.logger.error('Jira health check failed', {
        error: errorMessage(error),
      });
      res.status(502).json({ error: errorMessage(error), connected: false });
    }
  });

  router.post('/publish', async (req, res) => {
    const credentials = await options.httpAuth.credentials(req, {
      allow: ['user'],
    });
    const body = bindSubmissionProvenance(
      req.body,
      credentials.principal.userEntityRef,
    );
    const parsed = publicationArtifactSchema.safeParse(body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: 'Invalid work-intake publication artifact.' });
      return;
    }

    try {
      if (parsed.data.schemaVersion === 2) {
        const receipt = await options.publication.publish(
          authenticatedActorFromPrincipal(credentials.principal.userEntityRef),
          { profileId: 'jira-work-management', artifact: parsed.data },
        );
        res.json({
          ...receipt,
          issues: receipt.results.map(result => ({
            localId: result.localId,
            issueKey: result.externalKey ?? result.externalId,
            action: result.action,
            url: result.url,
          })),
        });
      } else {
        res.status(400).json({
          error: 'The compatibility route requires schema version 2.',
        });
      }
    } catch (error) {
      options.logger.error('Jira publication failed', {
        proposalId: parsed.data.proposal.id,
        error: errorMessage(error),
      });
      res.status(502).json({ error: errorMessage(error) });
    }
  });

  return router;
}
