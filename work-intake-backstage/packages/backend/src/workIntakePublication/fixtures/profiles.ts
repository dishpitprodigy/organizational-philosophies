import type { PublicationProfile, TargetBinding } from '../contracts';

export const targetBindings: TargetBinding[] = [
  {
    id: 'jira-intake',
    adapterId: 'jira',
    target: { kind: 'fixed', targetId: 'NWI' },
    configRef: 'atlassian.default',
    mappingVersion: 1,
  },
  {
    id: 'jpd-discovery',
    adapterId: 'jpd',
    target: { kind: 'fixed', targetId: 'MDP' },
    configRef: 'atlassian.default',
    mappingVersion: 1,
  },
  {
    id: 'jira-delivery',
    adapterId: 'jira',
    target: { kind: 'catalog-route', route: 'delivery-project' },
    configRef: 'atlassian.default',
    mappingVersion: 1,
  },
];

export const jiraWorkManagementProfile: PublicationProfile = {
  id: 'jira-work-management',
  displayName: 'Jira Work Management',
  artifactPlacementId: 'jira-proposal',
  failurePolicy: 'stop-after-failure',
  placements: [
    {
      id: 'jira-proposal',
      role: 'proposal',
      bindingId: 'jira-intake',
      dependsOn: [],
    },
    {
      id: 'jira-reviews',
      role: 'review',
      bindingId: 'jira-intake',
      dependsOn: ['jira-proposal'],
    },
    {
      id: 'jira-delivery',
      role: 'delivery',
      bindingId: 'jira-delivery',
      dependsOn: ['jira-proposal'],
    },
  ],
};

export const mixedAtlassianProfile: PublicationProfile = {
  id: 'atlassian-discovery',
  displayName: 'Atlassian Discovery',
  artifactPlacementId: 'jpd-proposal',
  failurePolicy: 'stop-after-failure',
  placements: [
    {
      id: 'jpd-proposal',
      role: 'proposal',
      bindingId: 'jpd-discovery',
      dependsOn: [],
    },
    {
      id: 'jira-reviews',
      role: 'review',
      bindingId: 'jira-intake',
      dependsOn: ['jpd-proposal'],
    },
    {
      id: 'jira-delivery',
      role: 'delivery',
      bindingId: 'jira-delivery',
      dependsOn: ['jpd-proposal'],
    },
  ],
};
