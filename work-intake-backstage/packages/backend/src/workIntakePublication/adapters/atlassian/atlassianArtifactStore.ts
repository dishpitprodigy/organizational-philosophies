import { createHash } from 'node:crypto';

import type {
  ArtifactStore,
  CanonicalArtifact,
  CanonicalArtifactReference,
  ExternalProjection,
} from '../../contracts';
import { AtlassianTransport, AtlassianTransportError } from './transport';

export class AtlassianArtifactStore implements ArtifactStore {
  constructor(private readonly options: { transport: AtlassianTransport }) {}

  async persist(
    artifact: CanonicalArtifact,
    anchor: ExternalProjection,
  ): Promise<CanonicalArtifactReference> {
    const attachments = await this.options.transport.attachments(
      anchor.externalId,
    );
    const existing = attachments.find(
      attachment => attachment.filename === artifact.filename,
    );
    if (existing) {
      const locator = existing.content;
      if (!locator)
        throw new AtlassianTransportError({
          operation: 'persist artifact',
          detail: `Attachment ${existing.id} has no downloadable content URL.`,
        });
      const reference = {
        sha256: artifact.sha256,
        filename: artifact.filename,
        locator,
      };
      await this.verifyContent(reference, artifact.content);
      return reference;
    }
    const revisionPrefix = artifact.filename.replace(/[a-f0-9]{64}\.json$/, '');
    const conflict = attachments.find(
      attachment =>
        attachment.filename?.startsWith(revisionPrefix) &&
        attachment.filename !== artifact.filename,
    );
    if (conflict)
      throw new AtlassianTransportError({
        operation: 'persist artifact',
        detail: `Anchor ${anchor.externalId} already has a different canonical JSON artifact (${conflict.filename}).`,
      });
    const created = await this.options.transport.uploadAttachment(
      anchor.externalId,
      artifact.filename,
      artifact.content,
    );
    return {
      sha256: artifact.sha256,
      filename: artifact.filename,
      locator:
        created.content ??
        `${
          this.options.transport.baseUrl
        }/rest/api/3/attachment/content/${encodeURIComponent(created.id)}`,
    };
  }

  async verify(reference: CanonicalArtifactReference): Promise<void> {
    const content = await this.options.transport.download(reference.locator);
    const sha256 = createHash('sha256').update(content).digest('hex');
    if (sha256 !== reference.sha256) {
      throw new AtlassianTransportError({
        operation: 'verify artifact',
        detail: `Attachment ${reference.filename} does not match SHA-256 ${reference.sha256}.`,
      });
    }
  }

  private async verifyContent(
    reference: CanonicalArtifactReference,
    expected: string,
  ): Promise<void> {
    const actual = await this.options.transport.download(reference.locator);
    if (actual !== expected)
      throw new AtlassianTransportError({
        operation: 'verify artifact',
        detail: `Attachment ${reference.filename} does not match its canonical content.`,
      });
  }
}
