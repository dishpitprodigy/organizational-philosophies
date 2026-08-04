#!/usr/bin/env node

import { jiraClientFromEnvironment } from './clients.mjs';
import { loadAtlassianEnvironment } from './environment.mjs';

loadAtlassianEnvironment();
const jira = jiraClientFromEnvironment();
const [user, projects] = await Promise.all([
  jira.currentUser(),
  jira.projects(),
]);

console.log(
  JSON.stringify({
    connected: true,
    siteUrl: process.env.ATLASSIAN_URL,
    account: {
      displayName: user.displayName,
      active: user.active,
    },
    projectKeys: projects.map(project => project.key).sort(),
  }),
);
