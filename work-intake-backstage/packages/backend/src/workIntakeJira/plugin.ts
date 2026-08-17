import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';

import { getProductionPublication } from '../workIntakePublication/factory';
import { createRouter } from './router';

const workIntakeJiraPlugin = createBackendPlugin({
  pluginId: 'work-intake-jira',
  register(env) {
    env.registerInit({
      deps: {
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
      },
      async init({ httpAuth, httpRouter, logger }) {
        const publication = getProductionPublication();
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
