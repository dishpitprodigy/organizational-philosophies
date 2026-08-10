import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';

import { BackstageCatalogPublicationResolver } from '../workIntakePublication/adapters/catalog/backstageCatalogResolver';
import { createProductionPublication } from '../workIntakePublication/factory';
import { loadAtlassianEnvironment } from '../workIntakePublication/environment';
import { createRouter } from './router';

const workIntakeJiraPlugin = createBackendPlugin({
  pluginId: 'work-intake-jira',
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
        const publication = createProductionPublication({
          catalog: new BackstageCatalogPublicationResolver(async () => {
            const credentials = await auth.getOwnServiceCredentials();
            return (await catalog.getEntities({}, { credentials })).items;
          }),
          ...(baseUrl && email && token
            ? { atlassian: { baseUrl, email, token } }
            : {}),
        });
        httpRouter.use(
          createRouter({
            httpAuth,
            publication,
            logger,
          }),
        );
      },
    });
  },
});

export default workIntakeJiraPlugin;
