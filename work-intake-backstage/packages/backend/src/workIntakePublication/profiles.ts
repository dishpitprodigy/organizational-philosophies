import type { PublicationProfile, TargetBinding } from './contracts';

export type PublicationProfileRegistry = {
  profile(id: string): PublicationProfile | undefined;
  binding(id: string): TargetBinding | undefined;
  allProfiles(): readonly PublicationProfile[];
  allBindings(): readonly TargetBinding[];
};

function duplicate(values: readonly string[]) {
  return new Set(values).size !== values.length;
}

function validateProfile(profile: PublicationProfile, bindingIds: Set<string>) {
  if (!profile.id || !profile.displayName) {
    throw new Error('Publication profile must have an id and display name.');
  }
  if (profile.placements.length === 0) {
    throw new Error(`Publication profile ${profile.id} has no placements.`);
  }
  const placementIds = profile.placements.map(placement => placement.id);
  if (duplicate(placementIds)) {
    throw new Error(
      `Publication profile ${profile.id} has duplicate placement ids.`,
    );
  }
  const placements = new Map(
    profile.placements.map(placement => [placement.id, placement]),
  );
  const anchor = placements.get(profile.artifactPlacementId);
  const proposalPlacements = profile.placements.filter(
    placement => placement.role === 'proposal',
  );
  if (
    !anchor ||
    anchor.role !== 'proposal' ||
    proposalPlacements.length !== 1
  ) {
    throw new Error(
      `Publication profile ${profile.id} must have a proposal artifact anchor.`,
    );
  }
  for (const placement of profile.placements) {
    if (!bindingIds.has(placement.bindingId)) {
      throw new Error(
        `Publication profile ${profile.id} references unknown binding ${placement.bindingId}.`,
      );
    }
    if (duplicate(placement.dependsOn)) {
      throw new Error(
        `Publication profile ${profile.id} has duplicate dependencies for ${placement.id}.`,
      );
    }
    for (const dependency of placement.dependsOn) {
      if (!placements.has(dependency)) {
        throw new Error(
          `Publication profile ${profile.id} has unknown dependency ${dependency}.`,
        );
      }
    }
  }

  const reachesAnchor = (
    placementId: string,
    visiting = new Set<string>(),
  ): boolean => {
    if (placementId === anchor.id) return true;
    if (visiting.has(placementId)) {
      throw new Error(
        `Publication profile ${profile.id} has cyclic dependencies.`,
      );
    }
    visiting.add(placementId);
    const placement = placements.get(placementId)!;
    const result = placement.dependsOn.some(dependency =>
      reachesAnchor(dependency, visiting),
    );
    visiting.delete(placementId);
    return result;
  };

  for (const placement of profile.placements) {
    if (placement.id === anchor.id) {
      if (placement.dependsOn.length !== 0) {
        throw new Error(
          `Publication profile ${profile.id} artifact anchor cannot depend on another placement.`,
        );
      }
      continue;
    }
    if (!reachesAnchor(placement.id)) {
      throw new Error(
        `Publication profile ${profile.id} placement ${placement.id} does not depend on its artifact anchor.`,
      );
    }
  }
}

export function createPublicationProfileRegistry(options: {
  profiles: readonly PublicationProfile[];
  targetBindings: readonly TargetBinding[];
}): PublicationProfileRegistry {
  const profileIds = options.profiles.map(profile => profile.id);
  const bindingIds = options.targetBindings.map(binding => binding.id);
  if (duplicate(profileIds))
    throw new Error('Publication profiles have duplicate ids.');
  if (duplicate(bindingIds))
    throw new Error('Publication target bindings have duplicate ids.');

  const bindings = new Map(
    options.targetBindings.map(binding => [binding.id, binding]),
  );
  for (const profile of options.profiles)
    validateProfile(profile, new Set(bindings.keys()));
  const profiles = new Map(
    options.profiles.map(profile => [profile.id, profile]),
  );

  return {
    profile: id => profiles.get(id),
    binding: id => bindings.get(id),
    allProfiles: () => [...profiles.values()],
    allBindings: () => [...bindings.values()],
  };
}
