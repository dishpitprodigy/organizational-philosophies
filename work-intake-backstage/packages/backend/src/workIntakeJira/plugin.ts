import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';

import { createJiraCommandService } from './command';
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
        httpRouter.use(
          createRouter({
            httpAuth,
            jira: createJiraCommandService(),
            logger,
          }),
        );
      },
    });
  },
});

export default workIntakeJiraPlugin;
