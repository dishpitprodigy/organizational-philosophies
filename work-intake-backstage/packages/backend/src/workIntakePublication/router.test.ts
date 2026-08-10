import express from 'express';
import request from 'supertest';

import type { WorkProposalPublication } from './contracts';
import { publicationError } from './errors';
import { createRouter } from './router';

function artifact() {
  return {
    schemaVersion: 2,
    form: { id: 'technical-work-proposal', version: 1 },
    answers: {},
    submission: {
      requester: 'Avery',
      requestingTeam: 'group:default/sre',
      source: 'backstage',
      authenticatedActor: 'user:default/avery',
      submittedAt: '2026-08-10T12:00:00.000Z',
    },
    proposal: {
      id: 'WP-1',
      revision: 1,
      title: 'Metrics',
      state: 'Ready',
      authority: 'Review',
      currentState: {
        summary: 'Now',
        baseline: { mode: 'define', delta: 'Delta' },
        architecture: 'Architecture',
        workloadEvidence: 'Evidence',
        constraints: 'Constraints',
      },
      desiredOutcome: {
        summary: 'Later',
        scope: 'Scope',
        capability: 'Capability',
        proof: 'Proof',
        horizon: 'Horizon',
      },
      requiredDifference: {
        summary: 'Difference',
        preserve: 'Preserve',
        change: 'Change',
        evidenceBasis: 'Evidence',
      },
      requirements: [
        {
          id: 'R-1',
          modality: 'shall',
          condition: 'Condition',
          verification: 'Verification',
        },
      ],
      acceptanceConditions: [
        {
          id: 'A-1',
          context: 'Context',
          result: 'Result',
          evidenceMethod: 'Method',
        },
      ],
      nonGoals: [{ id: 'N-1', exclusion: 'Exclusion', reason: 'Reason' }],
      affectedEntities: ['system:default/metrics'],
      dependencies: [],
      preconditions: [],
      sponsor: {
        name: 'Sponsor',
        level: 'VP',
        accepted: true,
        assertedAccepted: true,
        verificationStatus: 'verified',
        acceptedBy: 'user:default/sponsor',
        acceptedAt: '2026-08-10T11:00:00.000Z',
        evidence: 'Evidence',
      },
      acceptanceAuthority: 'Sponsor',
      knownUncertainty: { present: false, question: '' },
    },
    classifications: { workFunctions: [], decisionImpacts: [], tags: [] },
    routingRequest: { affectedEntities: ['system:default/metrics'], facts: {} },
    candidateDelivery: {
      authorized: false,
      reason: 'Not authorized',
      records: [],
    },
  };
}

function testApp(publication: Partial<WorkProposalPublication> = {}) {
  const profiles =
    publication.profiles ??
    jest
      .fn()
      .mockResolvedValue([
        { id: 'jira', displayName: 'Jira', available: true },
      ]);
  const preview =
    publication.preview ??
    jest.fn().mockResolvedValue({ profileId: 'jira', records: [] });
  const publish =
    publication.publish ??
    jest.fn().mockResolvedValue({ profileId: 'jira', results: [] });
  const credentials = jest.fn().mockResolvedValue({
    principal: { type: 'user', userEntityRef: 'user:default/avery' },
  });
  const logger = { error: jest.fn(), info: jest.fn() };
  const app = express();
  app.use(
    createRouter({
      httpAuth: { credentials } as never,
      publication: { profiles, preview, publish },
      logger: logger as never,
    }),
  );
  return { app, profiles, preview, publish, credentials, logger };
}

describe('work-intake publication router', () => {
  it('authenticates before listing profiles and binds the actor on the server', async () => {
    const fixture = testApp();
    await request(fixture.app)
      .get('/profiles')
      .expect(200, [{ id: 'jira', displayName: 'Jira', available: true }]);
    expect(fixture.credentials).toHaveBeenCalledWith(expect.anything(), {
      allow: ['user'],
    });
    expect(fixture.profiles).toHaveBeenCalledWith(
      expect.objectContaining({ principal: 'user:default/avery' }),
    );
  });

  it.each(['preview', 'publish'] as const)(
    '%s accepts only a profile and validated artifact',
    async route => {
      const fixture = testApp();
      await request(fixture.app)
        .post(`/${route}`)
        .send({ profileId: 'jira', artifact: artifact(), targetId: 'injected' })
        .expect(400);
      expect(fixture[route]).not.toHaveBeenCalled();
    },
  );

  it('passes the server-authenticated actor and request to preview', async () => {
    const fixture = testApp();
    const body = { profileId: 'jira', artifact: artifact() };
    await request(fixture.app).post('/preview').send(body).expect(200);
    expect(fixture.preview).toHaveBeenCalledWith(
      expect.objectContaining({ principal: 'user:default/avery' }),
      body,
    );
  });

  it('maps normalized publication errors without leaking arbitrary errors', async () => {
    const fixture = testApp({
      publish: jest.fn().mockRejectedValue(
        publicationError('TargetUnavailable', 'Jira is unavailable', {
          retryAfter: 60,
        }),
      ),
    });
    await request(fixture.app)
      .post('/publish')
      .send({ profileId: 'jira', artifact: artifact() })
      .expect(503, {
        error: {
          kind: 'TargetUnavailable',
          message: 'Jira is unavailable',
          details: { retryAfter: 60 },
        },
      });
    expect(fixture.logger.error).toHaveBeenCalled();
  });
});
