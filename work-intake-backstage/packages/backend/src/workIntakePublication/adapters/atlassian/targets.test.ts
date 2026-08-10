import type { TargetBatch } from '../../contracts';
import { JiraTarget } from './jiraTarget';
import { JpdTarget } from './jpdTarget';

function batch(adapterId: 'jira' | 'jpd'): TargetBatch {
  const fingerprint = `${adapterId}-fingerprint`;
  return {
    profileId:
      adapterId === 'jira' ? 'jira-work-management' : 'atlassian-discovery',
    placementId: `${adapterId}-proposal`,
    binding: {
      id: `${adapterId}-binding`,
      adapterId,
      target: {
        kind: 'resolved',
        targetId: adapterId === 'jira' ? 'NWI' : 'MDP',
      },
      configRef: 'atlassian.default',
      mappingVersion: 1,
      config: {},
    },
    mappingVersion: 1,
    artifact: {
      artifact: {} as never,
      content: '{}\n',
      sha256: 'a'.repeat(64),
      filename: 'artifact.json',
    },
    records: [
      {
        localId: 'proposal',
        kind: 'proposal',
        identity: { proposalId: 'WP-1', proposalRevision: 4 },
        title: '[WP-1 rev 4] Choose capability',
        content: {
          summary: [{ label: 'State', value: 'Ready for review' }],
          sections: [
            {
              heading: 'Desired Outcome',
              paragraphs: ['Select one.'],
              items: ['Proof retained'],
            },
          ],
        },
        routing: { affectedEntities: ['system:default/metrics'], evidence: {} },
        idempotencyKey: 'WP-1:rev-4:proposal',
        logicalFingerprint: 'logical',
      },
    ],
    relations: [],
    targetFingerprints: { proposal: fingerprint },
  };
}

function fakeTransport() {
  const calls: Array<{ path: string; body?: unknown }> = [];
  return {
    calls,
    baseUrl: 'https://northstar.example',
    project: async () => ({ key: 'NWI' }),
    search: async () => ({ issues: [] }),
    request: async (path: string, options?: { body?: unknown }) => {
      calls.push({ path, body: options?.body });
      return path === '/issue' ? { key: 'NWI-10' } : {};
    },
    setIssueProperty: async () => undefined,
    ensureLink: async () => ({ created: true }),
  };
}

describe.each([
  [
    'Jira',
    (transport: ReturnType<typeof fakeTransport>) =>
      new JiraTarget({ transport: transport as never }),
    'Epic',
  ],
  [
    'JPD',
    (transport: ReturnType<typeof fakeTransport>) =>
      new JpdTarget({ transport: transport as never }),
    'Idea',
  ],
] as const)('%s publication target', (_name, makeTarget, issueType) => {
  it('maps structured content and returns one outcome for every record', async () => {
    const transport = fakeTransport();
    const target = makeTarget(transport);
    const targetBatch = batch(target.id as 'jira' | 'jpd');

    const receipt = await target.apply(targetBatch);

    expect(receipt.results).toEqual([
      expect.objectContaining({
        localId: 'proposal',
        externalId: 'NWI-10',
        action: 'created',
      }),
    ]);
    const create = transport.calls.find(call => call.path === '/issue');
    expect(create?.body).toEqual(
      expect.objectContaining({
        fields: expect.objectContaining({
          issuetype: { name: issueType },
          description: expect.objectContaining({ type: 'doc' }),
        }),
      }),
    );
    expect(JSON.stringify(create?.body)).toContain('Desired Outcome');
  });
});
