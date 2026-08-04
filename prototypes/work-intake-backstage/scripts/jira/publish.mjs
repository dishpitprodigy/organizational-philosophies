#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

import {
  BackstageCatalogClient,
  jiraClientFromEnvironment,
} from './clients.mjs';
import { loadAtlassianEnvironment } from './environment.mjs';
import { PublicationLedger } from './ledger.mjs';
import {
  buildPublicationPlan,
  firstPositionalArgument,
  resolveArtifactRouting,
} from './planning.mjs';

loadAtlassianEnvironment();
const apply = process.argv.includes('--apply');
const artifactPath = firstPositionalArgument(process.argv.slice(2));
if (!artifactPath) {
  throw new Error('Usage: publish.mjs <work-intake-artifact.json> [--apply]');
}

const backstage = new BackstageCatalogClient({
  baseUrl: process.env.BACKSTAGE_URL ?? 'http://localhost:7007',
});
const artifact = JSON.parse(await readFile(artifactPath, 'utf8'));
const routedArtifact = resolveArtifactRouting(
  artifact,
  await backstage.entities(),
);
const plan = buildPublicationPlan(routedArtifact);

console.log(
  `${apply ? 'Publishing' : 'Dry run:'} ${
    plan.issues.length
  } issue projection(s) and ${plan.links.length} link(s)`,
);
for (const issue of plan.issues) {
  console.log(
    `- ${issue.projectKey} / ${issue.issueType}: ${issue.summary} [${issue.publicationLabel}]`,
  );
}
for (const note of plan.notes) console.log(`- NOTE: ${note}`);

if (!apply) {
  console.log(
    'No Jira state changed. Re-run with --apply to publish this plan.',
  );
  process.exit(0);
}

const jira = jiraClientFromEnvironment();
const ledger = new PublicationLedger();
await ledger.withLock(async lockedLedger => {
  const state = await lockedLedger.read();
  const issueKeys = new Map();

  for (const issue of plan.issues) {
    let publication = state.publications[issue.publicationLabel];
    if (publication?.state === 'published') {
      issueKeys.set(issue.localId, publication.issueKey);
      console.log(`  reused ${publication.issueKey} from publication ledger`);
      continue;
    }

    const existing = await jira.findIssue(
      issue.projectKey,
      issue.publicationLabel,
    );
    if (existing) {
      publication = {
        state: 'published',
        issueKey: existing.key,
        projectKey: issue.projectKey,
        summary: issue.summary,
      };
      state.publications[issue.publicationLabel] = publication;
      await lockedLedger.write(state);
      issueKeys.set(issue.localId, existing.key);
      console.log(`  reconciled ${existing.key} into publication ledger`);
      continue;
    }

    if (publication?.state === 'creating') {
      throw new Error(
        `Publication ${issue.publicationLabel} has an indeterminate prior create. Jira search has not found it; refusing to risk a duplicate.`,
      );
    }

    state.publications[issue.publicationLabel] = {
      state: 'creating',
      projectKey: issue.projectKey,
      summary: issue.summary,
    };
    await lockedLedger.write(state);

    const parentKey = issue.parentLocalId
      ? issueKeys.get(issue.parentLocalId)
      : undefined;
    const created = await jira.createIssue(issue, parentKey);
    state.publications[issue.publicationLabel] = {
      state: 'published',
      issueKey: created.key,
      projectKey: issue.projectKey,
      summary: issue.summary,
    };
    await lockedLedger.write(state);
    issueKeys.set(issue.localId, created.key);
    console.log(`  created ${created.key}`);
  }

  for (const link of plan.links) {
    const inwardKey = issueKeys.get(link.inwardLocalId);
    const outwardKey = issueKeys.get(link.outwardLocalId);
    const result = await jira.ensureLink({
      type: link.type,
      inwardKey,
      outwardKey,
    });
    console.log(
      `  ${result.created ? 'created' : 'reused'} ${
        link.type
      } link ${outwardKey} -> ${inwardKey}`,
    );
  }
});
