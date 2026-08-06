import { bindSubmissionProvenance } from './submissionProvenance';

describe('submission provenance', () => {
  it('binds schema-v2 provenance to the authenticated Backstage actor', () => {
    const artifact = bindSubmissionProvenance(
      {
        schemaVersion: 2,
        submission: {
          requester: 'A claimed requester',
          authenticatedActor: null,
          submittedAt: null,
        },
      },
      'user:default/authenticated-actor',
      new Date('2026-08-05T12:00:00.000Z'),
    );

    expect(artifact.submission).toEqual({
      requester: 'A claimed requester',
      authenticatedActor: 'user:default/authenticated-actor',
      submittedAt: '2026-08-05T12:00:00.000Z',
    });
  });

  it('does not change legacy artifacts', () => {
    const artifact = { schemaVersion: 1, proposal: { id: 'WP-1' } };

    expect(
      bindSubmissionProvenance(artifact, 'user:default/authenticated-actor'),
    ).toBe(artifact);
  });
});
