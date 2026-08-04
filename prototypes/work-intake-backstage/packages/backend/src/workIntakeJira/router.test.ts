import express from 'express';
import request from 'supertest';

import { createRouter } from './router';

function testApp(options: {
  health?: jest.Mock;
  publish?: jest.Mock;
  credentials?: jest.Mock;
}) {
  const health =
    options.health ?? jest.fn().mockResolvedValue({ connected: true });
  const publish =
    options.publish ??
    jest.fn().mockResolvedValue({
      applied: true,
      issues: [{ issueKey: 'NWI-1', action: 'reused' }],
    });
  const credentials =
    options.credentials ??
    jest.fn().mockResolvedValue({ principal: { type: 'user' } });
  const logger = { error: jest.fn(), info: jest.fn() };
  const app = express();
  app.use(
    createRouter({
      httpAuth: { credentials } as never,
      jira: { health, publish },
      logger: logger as never,
    }),
  );
  return { app, health, publish, credentials, logger };
}

describe('work-intake Jira router', () => {
  const validArtifact = {
    schemaVersion: 1,
    proposal: { id: 'WP-2026-0042' },
    routingRequest: {
      affectedEntities: ['system:default/metrics-alerting-platform'],
    },
  };

  it('reports the backend Jira connection to an authenticated user', async () => {
    const fixture = testApp({});

    await request(fixture.app).get('/health').expect(200, { connected: true });

    expect(fixture.credentials).toHaveBeenCalledWith(expect.anything(), {
      allow: ['user'],
    });
  });

  it('publishes a validated work-intake artifact', async () => {
    const fixture = testApp({});
    const artifact = validArtifact;

    await request(fixture.app)
      .post('/publish')
      .send(artifact)
      .expect(200)
      .expect(response => {
        expect(response.body.issues[0].issueKey).toBe('NWI-1');
      });

    expect(fixture.publish).toHaveBeenCalledWith(artifact);
  });

  it('rejects malformed publication bodies before invoking Jira', async () => {
    const fixture = testApp({});

    await request(fixture.app)
      .post('/publish')
      .send({ proposal: {} })
      .expect(400);

    expect(fixture.publish).not.toHaveBeenCalled();
  });

  it('rejects an artifact that omits the catalog routing request', async () => {
    const fixture = testApp({});

    await request(fixture.app)
      .post('/publish')
      .send({ schemaVersion: 1, proposal: { id: 'WP-2026-0042' } })
      .expect(400);

    expect(fixture.publish).not.toHaveBeenCalled();
  });

  it('returns a controlled gateway error when Jira publication fails', async () => {
    const fixture = testApp({
      publish: jest
        .fn()
        .mockRejectedValue(new Error('Jira refused publication')),
    });

    await request(fixture.app)
      .post('/publish')
      .send(validArtifact)
      .expect(502, { error: 'Jira refused publication' });

    expect(fixture.logger.error).toHaveBeenCalled();
  });
});
