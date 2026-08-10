import type { CanonicalArtifact, ExternalProjection } from '../contracts';
import { InMemoryArtifactStore } from './inMemoryArtifactStore';

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

describe('InMemoryArtifactStore', () => {
  it('persists canonical bytes at an anchor and returns a verifiable content-addressed reference', async () => {
    const store = new InMemoryArtifactStore();

    const reference = await store.persist(artifact, anchor);

    expect(reference).toEqual({
      sha256: artifact.sha256,
      filename: artifact.filename,
      locator: `memory://artifacts/${artifact.sha256}`,
    });
    await expect(store.verify(reference)).resolves.toBeUndefined();
  });

  it('reuses an artifact on retry but rejects replacing the anchor with different canonical content', async () => {
    const store = new InMemoryArtifactStore();
    const first = await store.persist(artifact, anchor);

    await expect(store.persist(artifact, anchor)).resolves.toEqual(first);
    await expect(
      store.persist(
        {
          ...artifact,
          content: '{"proposal":"WP-43"}\n',
          sha256:
            '0f3f0e50b58eff5b640ac64ce865cf4d42fa67befb3c07551dcd3e0cc7b24a63',
          filename: 'WP-43-rev-0-bbbbbbbb.json',
        },
        anchor,
      ),
    ).rejects.toThrow('already has a different canonical artifact');
  });

  it('rejects a reference whose canonical bytes are unavailable', async () => {
    const store = new InMemoryArtifactStore();

    await expect(
      store.verify({
        ...artifact,
        sha256:
          '0000000000000000000000000000000000000000000000000000000000000000',
        locator:
          'memory://artifacts/0000000000000000000000000000000000000000000000000000000000000000',
      }),
    ).rejects.toThrow('is unavailable');
  });

  it('verifies empty canonical bytes when their content address is present', async () => {
    const store = new InMemoryArtifactStore();
    const reference = await store.persist(
      {
        ...artifact,
        content: '',
        sha256:
          'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        filename: 'empty.json',
      },
      anchor,
    );

    await expect(store.verify(reference)).resolves.toBeUndefined();
  });

  it('keeps distinct anchors separate when projection identifiers contain separators', async () => {
    const store = new InMemoryArtifactStore();
    await store.persist(artifact, {
      adapterId: 'jpd:MDP',
      targetId: '',
      externalId: '42',
    });

    await expect(
      store.persist(
        {
          ...artifact,
          content: '{"proposal":"WP-43"}\n',
          sha256:
            '0f3f0e50b58eff5b640ac64ce865cf4d42fa67befb3c07551dcd3e0cc7b24a63',
          filename: 'WP-43-rev-0-bbbbbbbb.json',
        },
        { adapterId: 'jpd', targetId: 'MDP:', externalId: '42' },
      ),
    ).resolves.toMatchObject({
      sha256:
        '0f3f0e50b58eff5b640ac64ce865cf4d42fa67befb3c07551dcd3e0cc7b24a63',
    });
  });
});
