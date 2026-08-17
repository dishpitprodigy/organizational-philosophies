import type { CanonicalArtifact, ExternalProjection } from '../../contracts';
import { AtlassianArtifactStore } from './atlassianArtifactStore';
import { AtlassianTransport } from './transport';

const artifact: CanonicalArtifact = {
  artifact: {} as CanonicalArtifact['artifact'],
  content: '{"proposal":"WP-42"}\n',
  sha256: '8f07120278cf3823c9cdad07f9483b4e73f711c93eb170d8e720e5cf69e5951f',
  filename: 'WP-42-rev-0-aaaaaaaa.json',
};
const anchor: ExternalProjection = {
  adapterId: 'jpd',
  targetId: 'MDP',
  externalId: 'MDP-42',
};

describe('AtlassianArtifactStore', () => {
  it('uploads the canonical artifact to its anchor and returns an attachment reference', async () => {
    const transport = {
      attachments: jest.fn().mockResolvedValue([]),
      uploadAttachment: jest.fn().mockResolvedValue({
        id: '10001',
        content: 'https://northstar.example/attachment/10001',
      }),
      download: jest.fn(),
    } as unknown as AtlassianTransport;
    const store = new AtlassianArtifactStore({ transport });

    await expect(store.persist(artifact, anchor)).resolves.toEqual({
      sha256: artifact.sha256,
      filename: artifact.filename,
      locator: 'https://northstar.example/attachment/10001',
      externalArtifactIds: ['10001'],
    });
    expect(transport.uploadAttachment).toHaveBeenCalledWith(
      'MDP-42',
      artifact.filename,
      artifact.content,
    );
  });

  it('reuses and verifies exact content-addressed attachment bytes', async () => {
    const transport = {
      attachments: jest.fn().mockResolvedValue([
        {
          id: '10001',
          filename: artifact.filename,
          content: 'https://northstar.example/attachment/10001',
        },
      ]),
      uploadAttachment: jest.fn(),
      download: jest.fn().mockResolvedValue(artifact.content),
    } as unknown as AtlassianTransport;
    const store = new AtlassianArtifactStore({ transport });

    const reference = await store.persist(artifact, anchor);
    expect(reference.externalArtifactIds).toEqual(['10001']);
    await expect(store.verify(reference)).resolves.toBeUndefined();
    expect(transport.uploadAttachment).not.toHaveBeenCalled();
    expect(transport.download).toHaveBeenCalledWith(reference.locator);
  });
});
