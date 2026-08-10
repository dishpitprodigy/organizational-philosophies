import type { PublicationReceipt } from '../contracts';

const sha256 = '0'.repeat(64);

export const mixedPublicationReceipt: PublicationReceipt = {
  profileId: 'atlassian-discovery',
  proposal: { id: 'WP-2026-0042', revision: 4 },
  artifact: {
    sha256,
    locator: 'atlassian:MDP-1:artifact.json',
    filename: 'artifact.json',
  },
  artifactVerified: true,
  results: [
    {
      placementId: 'jpd-proposal',
      adapterId: 'jpd',
      targetId: 'MDP',
      localId: 'proposal',
      externalId: 'MDP-1',
      url: 'https://example.atlassian.net/browse/MDP-1',
      action: 'created',
      canonicalArtifactSha256: sha256,
    },
    {
      placementId: 'jira-reviews',
      adapterId: 'jira',
      targetId: 'NWI',
      localId: 'review-1',
      externalId: 'NWI-1',
      url: 'https://example.atlassian.net/browse/NWI-1',
      action: 'created',
      canonicalArtifactSha256: sha256,
    },
  ],
  relations: [{ type: 'precedes', action: 'created' }],
  notes: [],
  partial: false,
  retryable: false,
};
