import type { TargetBatch } from '../../contracts';
import { loadAtlassianEnvironment } from '../../environment';
import { JpdTarget } from './jpdTarget';
import { AtlassianTransport } from './transport';

const sandboxDescribe =
  process.env.WORK_INTAKE_JPD_SANDBOX === '1' ? describe : describe.skip;

sandboxDescribe('JPD sandbox', () => {
  it('creates and then reconciles one disposable Idea', async () => {
    loadAtlassianEnvironment();
    const baseUrl = process.env.ATLASSIAN_URL;
    const email = process.env.ATLASSIAN_EMAIL;
    const token = process.env.ATLASSIAN_TOKEN;
    if (!baseUrl || !email || !token) {
      throw new Error('The JPD sandbox test requires Atlassian credentials.');
    }
    const target = new JpdTarget({
      transport: new AtlassianTransport({ baseUrl, email, token }),
    });
    const suffix = Date.now().toString(36);
    const targetFingerprint = `sandbox-target-${suffix}`;
    const batch: TargetBatch = {
      profileId: 'atlassian-discovery',
      placementId: 'jpd-proposal',
      binding: {
        id: 'jpd-discovery',
        adapterId: 'jpd',
        target: { kind: 'resolved', targetId: 'MDP' },
        configRef: 'atlassian.default',
        mappingVersion: 1,
        config: {},
      },
      mappingVersion: 1,
      artifact: {
        artifact: {} as never,
        content: '{}\n',
        sha256: '0'.repeat(64),
        filename: `sandbox-${suffix}.json`,
      },
      records: [
        {
          localId: 'proposal',
          kind: 'proposal',
          identity: {
            proposalId: `SANDBOX-${suffix}`,
            proposalRevision: 1,
          },
          title: `[DISPOSABLE] Work Intake JPD adapter ${suffix}`,
          content: {
            sections: [
              {
                heading: 'Desired Outcome',
                paragraphs: [
                  'Verify create and reconciliation behavior; this Idea may be deleted.',
                ],
              },
            ],
          },
          routing: { affectedEntities: [], evidence: { sandbox: true } },
          idempotencyKey: `SANDBOX-${suffix}:rev-1:proposal`,
          logicalFingerprint: `sandbox-logical-${suffix}`,
        },
      ],
      relations: [],
      targetFingerprints: { proposal: targetFingerprint },
    };

    const created = await target.apply(batch);
    const reconciled = await target.apply(batch);

    expect(created.results[0]).toEqual(
      expect.objectContaining({ action: 'created' }),
    );
    expect(reconciled.results[0]).toEqual(
      expect.objectContaining({
        action: 'reconciled',
        externalId: created.results[0].externalId,
      }),
    );
  }, 30_000);
});
