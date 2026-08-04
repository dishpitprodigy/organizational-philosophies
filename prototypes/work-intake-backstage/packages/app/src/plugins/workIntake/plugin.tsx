import AccountTreeIcon from '@material-ui/icons/AccountTree';
import {
  createFrontendPlugin,
  createRouteRef,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';

export const workIntakeRouteRef = createRouteRef();

const workIntakePage = PageBlueprint.make({
  params: {
    path: '/work-intake',
    routeRef: workIntakeRouteRef,
    title: 'Work Intake',
    icon: <AccountTreeIcon fontSize="inherit" />,
    loader: () =>
      import('./WorkIntakePage').then(module => <module.WorkIntakePage />),
  },
});

export const workIntakePlugin = createFrontendPlugin({
  pluginId: 'work-intake',
  extensions: [workIntakePage],
  routes: {
    root: workIntakeRouteRef,
  },
});
