import {
  jiraWorkManagementProfile,
  mixedAtlassianProfile,
} from './fixtures/profiles';
import { mixedPublicationReceipt } from './fixtures/receipts';

describe('publication contracts', () => {
  it('keeps the artifact anchor explicit and orders every dependent placement after it', () => {
    for (const profile of [jiraWorkManagementProfile, mixedAtlassianProfile]) {
      const anchors = profile.placements.filter(
        placement => placement.id === profile.artifactPlacementId,
      );
      expect(anchors).toHaveLength(1);
      expect(anchors[0].role).toBe('proposal');
      expect(
        profile.placements
          .filter(placement => placement.id !== profile.artifactPlacementId)
          .every(placement =>
            placement.dependsOn.includes(profile.artifactPlacementId),
          ),
      ).toBe(true);
    }
  });

  it('returns destination-neutral links and one canonical artifact identity', () => {
    expect(mixedPublicationReceipt.profileId).toBe('atlassian-discovery');
    expect(
      mixedPublicationReceipt.results.map(result => result.adapterId),
    ).toEqual(['jpd', 'jira']);
    expect(
      new Set(
        mixedPublicationReceipt.results.map(
          result => result.canonicalArtifactSha256,
        ),
      ).size,
    ).toBe(1);
  });
});
