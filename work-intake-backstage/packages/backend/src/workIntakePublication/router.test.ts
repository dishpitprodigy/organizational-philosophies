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
  publication: Partial<WorkProposalPublication> = {},
  store?: {
    getProposal: jest.Mock;
    getProposalRevision: jest.Mock;
    saveProposalChange?: jest.Mock;
  },
) {
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
      store: store as never,
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
    body.artifact.submission.authenticatedActor = 'user:default/attacker';
    await request(fixture.app).post('/preview').send(body).expect(200);
    expect(fixture.preview).toHaveBeenCalledWith(
      expect.objectContaining({ principal: 'user:default/avery' }),
      expect.objectContaining({
        profileId: 'jira',
        artifact: expect.objectContaining({
          submission: expect.objectContaining({
            authenticatedActor: 'user:default/avery',
          }),
        }),
      }),
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

  it('returns proposal lineage and an exact immutable revision', async () => {
    const revision = {
      proposalId: 'WP-1',
      revision: 1,
      artifact: artifact(),
    };
    const proposal = {
      id: 'WP-1',
      currentRevision: 1,
      revisions: [revision],
    };
    const store = {
      getProposal: jest.fn().mockResolvedValue(proposal),
      getProposalRevision: jest.fn().mockResolvedValue(revision),
    };
    const fixture = testApp({}, store);

    await request(fixture.app).get('/proposals/WP-1').expect(200, proposal);
    await request(fixture.app).get('/proposals/WP-1/1').expect(200, revision);
    expect(store.getProposal).toHaveBeenCalledWith(
      'WP-1',
      'user:default/avery',
    );
    expect(store.getProposalRevision).toHaveBeenCalledWith(
      'WP-1',
      1,
      'user:default/avery',
    );
  });

  it('saves incomplete demand as an attributable Assisted Intake revision', async () => {
    const saved = {
      proposalId: 'WP-2026-0045',
      revision: 0,
      intakeRoute: 'assisted-intake',
      missingEvidence: [
        { id: 'desired-outcome', label: 'Desired operating outcome' },
      ],
    };
    const store = {
      getProposal: jest.fn(),
      getProposalRevision: jest.fn(),
      saveProposalChange: jest.fn().mockResolvedValue(saved),
    };
    const fixture = testApp({}, store);

    await request(fixture.app)
      .post('/proposals')
      .send({
        artifact: {
          form: { id: 'technical-work-proposal', version: 1 },
          answers: {},
          demand: {
            requester: 'Avery',
            requestingTeam: 'SRE',
            title: 'Investigate metrics lifecycle',
          },
          route: 'assisted-intake',
          state: {},
        },
        missingEvidence: saved.missingEvidence,
        changeReason: 'Initial demand capture',
      })
      .expect(201, saved);
    expect(store.saveProposalChange).toHaveBeenCalledWith(
      expect.objectContaining({
        actor: 'user:default/avery',
        changeReason: 'Initial demand capture',
      }),
    );
  });

  it('rejects an unstructured save instead of trusting its missing-evidence claim', async () => {
    const store = {
      getProposal: jest.fn(),
      getProposalRevision: jest.fn(),
      saveProposalChange: jest.fn(),
    };
    const fixture = testApp({}, store);
    await request(fixture.app)
      .post('/proposals')
      .send({
        artifact: {},
        missingEvidence: [],
        changeReason: 'Bypass Assisted Intake',
      })
      .expect(400);
    expect(store.saveProposalChange).not.toHaveBeenCalled();
  });

  it('rejects a saved record that contradicts its claimed reviewable artifact', async () => {
    const store = {
      getProposal: jest.fn(),
      getProposalRevision: jest.fn(),
      saveProposalChange: jest.fn(),
    };
    const fixture = testApp({}, store);
    await request(fixture.app)
      .post('/proposals')
      .send({
        proposalId: 'WP-1',
        artifact: {
          form: { id: 'technical-work-proposal', version: 1 },
          answers: {},
          demand: {
            requester: 'Avery',
            requestingTeam: 'SRE',
            title: 'A different title',
          },
          route: 'proposal-development',
          state: {},
        },
        reviewableArtifact: artifact(),
        missingEvidence: [],
        changeReason: 'Contradictory edit',
      })
      .expect(400);
    expect(store.saveProposalChange).not.toHaveBeenCalled();
  });

  it('assigns a server identity without routing a complete first save to Assisted Intake', async () => {
    const store = {
      getProposal: jest.fn(),
      getProposalRevision: jest.fn(),
      saveProposalChange: jest.fn().mockImplementation(input => ({
        proposalId: input.proposalId,
        revision: 0,
        intakeRoute: input.missingEvidence.length
          ? 'assisted-intake'
          : 'proposal-development',
        missingEvidence: input.missingEvidence,
      })),
    };
    const fixture = testApp({}, store);
    const complete = artifact();
    await request(fixture.app)
      .post('/proposals')
      .send({
        artifact: {
          form: complete.form,
          answers: complete.answers,
          demand: {
            requester: 'Avery',
            requestingTeam: 'SRE',
            title: complete.proposal.title,
          },
          route: 'proposal-development',
          state: {},
        },
        reviewableArtifact: complete,
        missingEvidence: [],
        changeReason: 'Complete initial capture',
      })
      .expect(201)
      .expect(response => {
        expect(response.body).toMatchObject({
          revision: 0,
          intakeRoute: 'proposal-development',
          missingEvidence: [],
        });
        expect(response.body.proposalId).toMatch(/^WP-\d{4}-[A-F0-9]{8}$/);
      });
  });

  it("returns an explicit authorization error for another user's lineage", async () => {
    const store = {
      getProposal: jest.fn(),
      getProposalRevision: jest.fn(),
      saveProposalChange: jest
        .fn()
        .mockRejectedValue(
          publicationError(
            'AuthorityViolation',
            'The actor does not own this lineage.',
          ),
        ),
    };
    const fixture = testApp({}, store);
    await request(fixture.app)
      .post('/proposals')
      .send({
        proposalId: 'WP-OTHER',
        artifact: {
          form: { id: 'technical-work-proposal', version: 1 },
          answers: {},
          demand: { requester: '', requestingTeam: '', title: '' },
          route: 'assisted-intake',
          state: {},
        },
        missingEvidence: [{ id: 'title', label: 'Title' }],
        changeReason: 'Unauthorized edit',
      })
      .expect(403, {
        error: {
          kind: 'AuthorityViolation',
          message: 'The actor does not own this lineage.',
        },
      });
  });

  it('returns 404 for an unknown proposal revision', async () => {
    const store = {
      getProposal: jest.fn().mockResolvedValue(undefined),
      getProposalRevision: jest.fn().mockResolvedValue(undefined),
    };
    const fixture = testApp({}, store);

    await request(fixture.app)
      .get('/proposals/WP-404/9')
      .expect(404, {
        error: {
          kind: 'NotFound',
          message: 'Proposal WP-404 revision 9 was not found.',
        },
      });
    expect(store.getProposalRevision).toHaveBeenCalledWith(
      'WP-404',
      9,
      'user:default/avery',
    );
  });
});
