import type { PublicationProfile, TargetBinding } from './contracts';
import { createPublicationProfileRegistry } from './profiles';

const bindings: TargetBinding[] = [
  {
    id: 'jira',
    adapterId: 'jira',
    target: { kind: 'fixed', targetId: 'NWI' },
    configRef: 'atlassian.default',
    mappingVersion: 1,
  },
];
const profile: PublicationProfile = {
  id: 'jira',
  displayName: 'Jira',
  artifactPlacementId: 'proposal',
  failurePolicy: 'stop-after-failure',
  placements: [
    { id: 'proposal', role: 'proposal', bindingId: 'jira', dependsOn: [] },
    {
      id: 'review',
      role: 'review',
      bindingId: 'jira',
      dependsOn: ['proposal'],
    },
  ],
};

describe('publication profile registry', () => {
  it('exposes only validated profiles and configured bindings', () => {
    const registry = createPublicationProfileRegistry({
      profiles: [profile],
      targetBindings: bindings,
    });
    expect(registry.profile('jira')).toEqual(profile);
    expect(registry.binding('jira')).toEqual(bindings[0]);
  });

  it.each<[string, PublicationProfile]>([
    ['missing anchor', { ...profile, artifactPlacementId: 'missing' }],
    ['anchor is not proposal', { ...profile, artifactPlacementId: 'review' }],
    [
      'unknown binding',
      {
        ...profile,
        placements: [{ ...profile.placements[0], bindingId: 'missing' }],
      },
    ],
    [
      'unknown dependency',
      {
        ...profile,
        placements: [
          { ...profile.placements[0] },
          { ...profile.placements[1], dependsOn: ['missing'] },
        ],
      },
    ],
    [
      'cyclic dependencies',
      {
        ...profile,
        placements: [
          { ...profile.placements[0], dependsOn: ['review'] },
          { ...profile.placements[1] },
        ],
      },
    ],
  ])('rejects a profile with %s', (_reason, invalidProfile) => {
    expect(() =>
      createPublicationProfileRegistry({
        profiles: [invalidProfile],
        targetBindings: bindings,
      }),
    ).toThrow(/profile/i);
  });
});
