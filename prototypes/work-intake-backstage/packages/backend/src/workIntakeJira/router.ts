import { HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { z } from 'zod/v3';

import { JiraCommandService } from './command';

const publicationSchema = z
  .object({
    schemaVersion: z.literal(1),
    proposal: z
      .object({
        id: z.string().min(1),
      })
      .passthrough(),
    routingRequest: z
      .object({
        affectedEntities: z.array(z.string().min(1)).min(1),
      })
      .passthrough(),
  })
  .passthrough();

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function createRouter(options: {
  httpAuth: HttpAuthService;
  jira: JiraCommandService;
  logger: LoggerService;
}) {
  const router = Router();
  router.use(express.json({ limit: '1mb' }));

  router.get('/health', async (req, res) => {
    await options.httpAuth.credentials(req, { allow: ['user'] });
    try {
      res.json(await options.jira.health());
    } catch (error) {
      options.logger.error('Jira health check failed', {
        error: errorMessage(error),
      });
      res.status(502).json({ error: errorMessage(error), connected: false });
    }
  });

  router.post('/publish', async (req, res) => {
    await options.httpAuth.credentials(req, { allow: ['user'] });
    const parsed = publicationSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: 'Invalid work-intake publication artifact.' });
      return;
    }

    try {
      res.json(await options.jira.publish(parsed.data));
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
