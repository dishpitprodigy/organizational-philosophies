import { homedir } from 'node:os';
import { join } from 'node:path';

import type { ArtifactStore, PublicationTarget } from './contracts';
import {
  jiraWorkManagementProfile,
  mixedAtlassianProfile,
  targetBindings,
} from './fixtures/profiles';
import type { CatalogPublicationResolver } from './publicationService';
import { PublicationService } from './publicationService';
import { FilePublicationJournal } from './journal/journal';
import { AtlassianTransport } from './adapters/atlassian/transport';
import { AtlassianArtifactStore } from './adapters/atlassian/atlassianArtifactStore';
import { JiraTarget } from './adapters/atlassian/jiraTarget';
import { JpdTarget } from './adapters/atlassian/jpdTarget';
import { PublicationError } from './errors';

class UnavailableTarget implements PublicationTarget {
  constructor(readonly id: string, private readonly reason: string) {}
  async status() {
    return { available: false, reason: this.reason };
  }
  async observe(): Promise<never> {
    throw new PublicationError('TargetConfigurationError', this.reason);
  }
  async apply(): Promise<never> {
    throw new PublicationError('TargetConfigurationError', this.reason);
  }
}

class UnavailableArtifactStore implements ArtifactStore {
  constructor(private readonly reason: string) {}
  async persist(): Promise<never> {
    throw new PublicationError('TargetConfigurationError', this.reason);
  }
  async verify(): Promise<never> {
    throw new PublicationError('TargetConfigurationError', this.reason);
  }
}

export function createProductionPublication(options: {
  catalog: CatalogPublicationResolver;
  atlassian?: { baseUrl: string; email: string; token: string };
  journalPath?: string;
}) {
  let artifactStore: ArtifactStore;
  let targets: Map<string, PublicationTarget>;
  if (options.atlassian) {
    const transport = new AtlassianTransport(options.atlassian);
    artifactStore = new AtlassianArtifactStore({ transport });
    targets = new Map<string, PublicationTarget>([
      ['jira', new JiraTarget({ transport })],
      ['jpd', new JpdTarget({ transport })],
    ]);
  } else {
    const reason = 'Atlassian URL, email, and token are not configured.';
    artifactStore = new UnavailableArtifactStore(reason);
    targets = new Map<string, PublicationTarget>([
      ['jira', new UnavailableTarget('jira', reason)],
      ['jpd', new UnavailableTarget('jpd', reason)],
    ]);
  }
  return new PublicationService({
    profiles: [jiraWorkManagementProfile, mixedAtlassianProfile],
    targetBindings,
    targets,
    catalog: options.catalog,
    resolveConfig: () => ({}),
    journal: new FilePublicationJournal(
      options.journalPath ??
        process.env.WORK_INTAKE_PUBLICATION_JOURNAL ??
        process.env.JIRA_PUBLICATION_LEDGER ??
        join(
          homedir(),
          '.local',
          'state',
          'work-intake-backstage',
          'jira-publications.json',
        ),
    ),
    artifactStore,
  });
}

let sharedProductionPublication:
  | ReturnType<typeof createProductionPublication>
  | undefined;

/** Both backend route plugins resolve the same in-process publication module. */
export function getProductionPublication(
  options: Parameters<typeof createProductionPublication>[0],
) {
  sharedProductionPublication ??= createProductionPublication(options);
  return sharedProductionPublication;
}
