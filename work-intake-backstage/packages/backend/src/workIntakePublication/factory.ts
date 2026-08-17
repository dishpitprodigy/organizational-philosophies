import type { Knex } from 'knex';

import type {
  ArtifactStore,
  PublicationTarget,
  WorkProposalPublication,
} from './contracts';
import {
  jiraWorkManagementProfile,
  mixedAtlassianProfile,
  targetBindings,
} from './fixtures/profiles';
import type { CatalogPublicationResolver } from './publicationService';
import { PublicationService } from './publicationService';
import { AtlassianTransport } from './adapters/atlassian/transport';
import { AtlassianArtifactStore } from './adapters/atlassian/atlassianArtifactStore';
import { JiraTarget } from './adapters/atlassian/jiraTarget';
import { JpdTarget } from './adapters/atlassian/jpdTarget';
import { PublicationError } from './errors';
import { DatabasePublicationJournal } from '../workIntakePersistence/databasePublicationJournal';
import { DurableWorkProposalPublication } from '../workIntakePersistence/durableWorkProposalPublication';
import { PostgresWorkIntakeStore } from '../workIntakePersistence/postgresWorkIntakeStore';

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
  database: Knex;
  atlassian?: { baseUrl: string; email: string; token: string };
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
  const publication = new PublicationService({
    profiles: [jiraWorkManagementProfile, mixedAtlassianProfile],
    targetBindings,
    targets,
    catalog: options.catalog,
    resolveConfig: () => ({}),
    journal: new DatabasePublicationJournal(options.database),
    artifactStore,
  });
  const store = new PostgresWorkIntakeStore(options.database);
  return {
    publication: new DurableWorkProposalPublication({
      delegate: publication,
      store,
      generatorProvenance: {
        name: 'work-intake-backstage',
        component: 'backend',
        version: '1.0.0',
      },
    }),
    store,
  };
}

type ProductionPublication = ReturnType<typeof createProductionPublication>;
let sharedProductionPublication: ProductionPublication | undefined;
let resolveProductionPublication: (value: ProductionPublication) => void;
const productionPublicationReady = new Promise<ProductionPublication>(
  resolve => {
    resolveProductionPublication = resolve;
  },
);

export function initializeProductionPublication(
  options: Parameters<typeof createProductionPublication>[0],
) {
  if (!sharedProductionPublication) {
    sharedProductionPublication = createProductionPublication(options);
    resolveProductionPublication(sharedProductionPublication);
  }
  return sharedProductionPublication;
}

/** Compatibility routes wait for the authoritative plugin/database to start. */
export function getProductionPublication() {
  return {
    profiles: async (
      ...args: Parameters<WorkProposalPublication['profiles']>
    ) => (await productionPublicationReady).publication.profiles(...args),
    preview: async (...args: Parameters<WorkProposalPublication['preview']>) =>
      (await productionPublicationReady).publication.preview(...args),
    publish: async (...args: Parameters<WorkProposalPublication['publish']>) =>
      (await productionPublicationReady).publication.publish(...args),
  } satisfies WorkProposalPublication;
}
