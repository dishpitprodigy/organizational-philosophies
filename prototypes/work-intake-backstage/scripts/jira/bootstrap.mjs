#!/usr/bin/env node

import {
  BackstageCatalogClient,
  jiraClientFromEnvironment,
} from './clients.mjs';
import { loadAtlassianEnvironment } from './environment.mjs';
import { buildBootstrapPlan } from './planning.mjs';

loadAtlassianEnvironment();
const apply = process.argv.includes('--apply');
const backstage = new BackstageCatalogClient({
  baseUrl: process.env.BACKSTAGE_URL ?? 'http://localhost:7007',
});
const jira = jiraClientFromEnvironment();

const [groups, existingProjects, user] = await Promise.all([
  backstage.groups(),
  jira.projects(),
  jira.currentUser(),
]);
const plan = buildBootstrapPlan(groups, existingProjects);

if (!plan.length) {
  console.log(
    'Jira bootstrap is already converged; no projects need creation.',
  );
  process.exit(0);
}

console.log(`${apply ? 'Applying' : 'Dry run:'} ${plan.length} project(s)`);
for (const project of plan) {
  console.log(`- ${project.key}: ${project.name} (${project.purpose})`);
  if (apply) {
    const created = await jira.createProject({
      ...project,
      leadAccountId: user.accountId,
    });
    console.log(`  created ${created.key ?? project.key}`);
  }
}

if (!apply) {
  console.log(
    'No Jira state changed. Re-run with --apply to create this plan.',
  );
}
