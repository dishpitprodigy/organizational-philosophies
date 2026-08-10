import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';

import type { WorkProposalPublication } from './contracts';
import { BackstageCatalogPublicationResolver } from './adapters/catalog/backstageCatalogResolver';
import { getProductionPublication } from './factory';
import { loadAtlassianEnvironment } from './environment';
import { createRouter } from './router';

/** Creates the plugin around the composed publication module. Composition belongs to P10. */
export function createWorkIntakePublicationPlugin(
  publication: WorkProposalPublication,
) {
  return createBackendPlugin({
    pluginId: 'work-intake-publication',
    register(env) {
      env.registerInit({
        deps: {
          httpAuth: coreServices.httpAuth,
          httpRouter: coreServices.httpRouter,
          logger: coreServices.logger,
        },
        async init({ httpAuth, httpRouter, logger }) {
          httpRouter.use(createRouter({ httpAuth, publication, logger }));
        },
      });
    },
  });
}

const workIntakePublicationPlugin = createBackendPlugin({
  pluginId: 'work-intake-publication',
  register(env) {
    env.registerInit({
      deps: {
        auth: coreServices.auth,
        catalog: catalogServiceRef,
        config: coreServices.rootConfig,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
      },
      async init({ auth, catalog, config, httpAuth, httpRouter, logger }) {
        loadAtlassianEnvironment();
        const baseUrl =
          config.getOptionalString('workIntakePublication.atlassian.baseUrl') ??
          process.env.ATLASSIAN_URL;
        const email =
          config.getOptionalString('workIntakePublication.atlassian.email') ??
          process.env.ATLASSIAN_EMAIL;
        const token =
          config.getOptionalString('workIntakePublication.atlassian.token') ??
          process.env.ATLASSIAN_TOKEN;
        const catalogResolver = new BackstageCatalogPublicationResolver(
          async () => {
            const credentials = await auth.getOwnServiceCredentials();
            const response = await catalog.getEntities({}, { credentials });
            return response.items;
          },
        );
        const publication = getProductionPublication({
          catalog: catalogResolver,
          ...(baseUrl && email && token
            ? { atlassian: { baseUrl, email, token } }
            : {}),
        });
        httpRouter.use(createRouter({ httpAuth, publication, logger }));
      },
    });
  },
});

export default workIntakePublicationPlugin;
