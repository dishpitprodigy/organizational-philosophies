import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { navModule } from './modules/nav';
import { workIntakePlugin } from './plugins/workIntake/plugin';

export default createApp({
  features: [catalogPlugin, navModule, workIntakePlugin],
});
