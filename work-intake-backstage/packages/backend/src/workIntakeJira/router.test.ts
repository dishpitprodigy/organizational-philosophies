import express from 'express';
import request from 'supertest';

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
      authenticatedActor: 'user:default/browser-claim',
      submittedAt: '2026-08-10T12:00:00.000Z',
    },
    proposal: {
      id: 'WP-1',
      revision: 4,
      title: 'Metrics',
      state: 'Ready',
      authority: 'Review',
      problem: { statement: 'Problem', benefit: 'Benefit' },
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
      feasibilityBasis: {
        assessments: [
          {
            id: 'FB-1',
            covers: ['R-1', 'A-1'],
            target: 'Target',
            hardLimits: 'Hard limits',
            evidence: 'Evidence',
            assumptions: 'Assumptions',
            margin: 'Margin',
            finding: 'supported',
          },
        ],
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

function testApp(
  publish = jest.fn().mockResolvedValue({
    profileId: 'jira-work-management',
    results: [{ localId: 'proposal', externalId: 'NWI-1', action: 'reused' }],
    partial: false,
  }),
) {
  const profiles = jest
    .fn()
    .mockResolvedValue([
      { id: 'jira-work-management', displayName: 'Jira', available: true },
    ]);
  const credentials = jest.fn().mockResolvedValue({
    principal: { type: 'user', userEntityRef: 'user:default/test-user' },
  });
  const logger = { error: jest.fn(), info: jest.fn() };
  const app = express();
  app.use(
    createRouter({
      httpAuth: { credentials } as never,
      publication: { profiles, publish, preview: jest.fn() } as never,
      logger: logger as never,
    }),
  );
  return { app, profiles, publish, credentials, logger };
}

describe('work-intake Jira compatibility router', () => {
  it('reports Jira profile availability through the shared Module', async () => {
    const fixture = testApp();
    await request(fixture.app).get('/health').expect(200, { connected: true });
    expect(fixture.profiles).toHaveBeenCalledWith(
      expect.objectContaining({ principal: 'user:default/test-user' }),
    );
  });

  it('delegates schema-v2 publication and binds actor provenance', async () => {
    const fixture = testApp();
    await request(fixture.app)
      .post('/publish')
      .send(artifact())
      .expect(200)
      .expect(response => {
        expect(response.body.issues[0].issueKey).toBe('NWI-1');
      });
    expect(fixture.publish).toHaveBeenCalledWith(
      expect.objectContaining({ principal: 'user:default/test-user' }),
      expect.objectContaining({
        profileId: 'jira-work-management',
        artifact: expect.objectContaining({
          submission: expect.objectContaining({
            authenticatedActor: 'user:default/test-user',
          }),
        }),
      }),
    );
  });

  it('rejects malformed and legacy artifacts without another publisher path', async () => {
    const fixture = testApp();
    await request(fixture.app)
      .post('/publish')
      .send({ proposal: {} })
      .expect(400);
    await request(fixture.app)
      .post('/publish')
      .send({
        schemaVersion: 1,
        proposal: { id: 'WP-1' },
        routingRequest: { affectedEntities: ['system:default/metrics'] },
      })
      .expect(400);
    expect(fixture.publish).not.toHaveBeenCalled();
  });

  it('returns a controlled gateway error when shared publication fails', async () => {
    const fixture = testApp(
      jest.fn().mockRejectedValue(new Error('Jira refused publication')),
    );
    await request(fixture.app)
      .post('/publish')
      .send(artifact())
      .expect(502, { error: 'Jira refused publication' });
    expect(fixture.logger.error).toHaveBeenCalled();
  });
});
