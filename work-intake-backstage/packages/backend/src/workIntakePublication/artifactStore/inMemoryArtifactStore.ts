import { createHash } from 'node:crypto';

import type {
  ArtifactStore,
  CanonicalArtifact,
  CanonicalArtifactReference,
  ExternalProjection,
} from '../contracts';

function artifactLocator(sha256: string) {
  return `memory://artifacts/${sha256}`;
}

function anchorKey(anchor: ExternalProjection) {
  return JSON.stringify([anchor.adapterId, anchor.targetId, anchor.externalId]);
}

function contentSha256(content: string) {
  return createHash('sha256').update(content).digest('hex');
}

/** Hermetic ArtifactStore conformance adapter for publication integration tests. */
export class InMemoryArtifactStore implements ArtifactStore {
  private readonly contentBySha256 = new Map<string, string>();
  private readonly artifactByAnchor = new Map<string, string>();

  async persist(
    artifact: CanonicalArtifact,
    anchor: ExternalProjection,
  ): Promise<CanonicalArtifactReference> {
    if (contentSha256(artifact.content) !== artifact.sha256) {
      throw new Error(
        `Canonical artifact ${artifact.filename} does not match SHA-256 ${artifact.sha256}.`,
      );
    }

    const key = anchorKey(anchor);
    const anchoredSha256 = this.artifactByAnchor.get(key);
    if (anchoredSha256 && anchoredSha256 !== artifact.sha256) {
      throw new Error(
        `Anchor ${anchor.externalId} already has a different canonical artifact.`,
      );
    }

    this.contentBySha256.set(artifact.sha256, artifact.content);
    this.artifactByAnchor.set(key, artifact.sha256);
    return {
      sha256: artifact.sha256,
      filename: artifact.filename,
      locator: artifactLocator(artifact.sha256),
    };
  }

  async verify(reference: CanonicalArtifactReference): Promise<void> {
    const content = this.contentBySha256.get(reference.sha256);
    if (
      content === undefined ||
      reference.locator !== artifactLocator(reference.sha256)
    ) {
      throw new Error(
        `Canonical artifact ${reference.filename} is unavailable.`,
      );
    }
    if (contentSha256(content) !== reference.sha256) {
      throw new Error(
        `Canonical artifact ${reference.filename} does not match SHA-256 ${reference.sha256}.`,
      );
    }
  }
}
