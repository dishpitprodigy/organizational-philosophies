#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

import {
  BackstageCatalogClient,
  jiraIssueMatchesProjection,
  jiraClientFromEnvironment,
} from './clients.mjs';
import { loadAtlassianEnvironment } from './environment.mjs';
import { PublicationLedger } from './ledger.mjs';
import {
  buildPublicationPlan,
  firstPositionalArgument,
  projectionFingerprint,
  resolveArtifactRouting,
} from './planning.mjs';

loadAtlassianEnvironment();
const apply = process.argv.includes('--apply');
const jsonOutput = process.argv.includes('--json');
const log = (...values) => {
  if (!jsonOutput) console.log(...values);
};
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

log(
  `${apply ? 'Publishing' : 'Dry run:'} ${
    plan.issues.length
  } issue projection(s) and ${plan.links.length} link(s)`,
);
for (const issue of plan.issues) {
  log(
    `- ${issue.projectKey} / ${issue.issueType}: ${issue.summary} [${issue.publicationLabel}]`,
  );
}
for (const note of plan.notes) log(`- NOTE: ${note}`);

if (!apply) {
  log('No Jira state changed. Re-run with --apply to publish this plan.');
  if (jsonOutput) {
    console.log(
      JSON.stringify({
        applied: false,
        proposal: plan.proposal,
        issueCount: plan.issues.length,
        linkCount: plan.links.length,
        notes: plan.notes,
      }),
    );
  }
  process.exit(0);
}

const jira = jiraClientFromEnvironment();
const ledger = new PublicationLedger();
const publicationResults = [];
const linkResults = [];
await ledger.withLock(async lockedLedger => {
  const state = await lockedLedger.read();
  const issueKeys = new Map();

  for (const issue of plan.issues) {
    let publication = state.publications[issue.publicationLabel];
    const fingerprint = projectionFingerprint(issue);
    if (publication?.state === 'published') {
      if (publication.fingerprint && publication.fingerprint !== fingerprint) {
        throw new Error(
          `Publication ${issue.publicationLabel} changed without a proposal revision increment. Refusing to reuse ${publication.issueKey}.`,
        );
      }
      if (!publication.fingerprint) {
        const existing = await jira.findIssue(
          issue.projectKey,
          issue.publicationLabel,
        );
        if (!existing || !jiraIssueMatchesProjection(existing, issue)) {
          throw new Error(
            `Publication ${issue.publicationLabel} does not match ${publication.issueKey}. Increment the Work Proposal revision before publishing changed content.`,
          );
        }
        publication.fingerprint = fingerprint;
        await lockedLedger.write(state);
      }
      issueKeys.set(issue.localId, publication.issueKey);
      log(`  reused ${publication.issueKey} from publication ledger`);
      publicationResults.push({
        localId: issue.localId,
        issueKey: publication.issueKey,
        action: 'reused',
      });
      continue;
    }

    const existing = await jira.findIssue(
      issue.projectKey,
      issue.publicationLabel,
    );
    if (existing) {
      if (!jiraIssueMatchesProjection(existing, issue)) {
        throw new Error(
          `Existing Jira issue ${existing.key} does not match publication ${issue.publicationLabel}. Increment the Work Proposal revision before publishing changed content.`,
        );
      }
      publication = {
        state: 'published',
        issueKey: existing.key,
        projectKey: issue.projectKey,
        summary: issue.summary,
        fingerprint,
      };
      state.publications[issue.publicationLabel] = publication;
      await lockedLedger.write(state);
      issueKeys.set(issue.localId, existing.key);
      log(`  reconciled ${existing.key} into publication ledger`);
      publicationResults.push({
        localId: issue.localId,
        issueKey: existing.key,
        action: 'reconciled',
      });
      continue;
    }

    if (publication?.state === 'creating') {
      if (publication.fingerprint !== fingerprint) {
        throw new Error(
          `Publication ${issue.publicationLabel} changed during an indeterminate create. Increment the Work Proposal revision before retrying.`,
        );
      }
      throw new Error(
        `Publication ${issue.publicationLabel} has an indeterminate prior create. Jira search has not found it; refusing to risk a duplicate.`,
      );
    }

    state.publications[issue.publicationLabel] = {
      state: 'creating',
      projectKey: issue.projectKey,
      summary: issue.summary,
      fingerprint,
    };
    await lockedLedger.write(state);

    const parentKey = issue.parentLocalId
      ? issueKeys.get(issue.parentLocalId)
      : undefined;
    const created = await jira.createIssue(
      { ...issue, fingerprint },
      parentKey,
    );
    state.publications[issue.publicationLabel] = {
      state: 'published',
      issueKey: created.key,
      projectKey: issue.projectKey,
      summary: issue.summary,
      fingerprint,
    };
    await lockedLedger.write(state);
    issueKeys.set(issue.localId, created.key);
    log(`  created ${created.key}`);
    publicationResults.push({
      localId: issue.localId,
      issueKey: created.key,
      action: 'created',
    });
  }

  for (const link of plan.links) {
    const inwardKey = issueKeys.get(link.inwardLocalId);
    const outwardKey = issueKeys.get(link.outwardLocalId);
    const result = await jira.ensureLink({
      type: link.type,
      inwardKey,
      outwardKey,
    });
    log(
      `  ${result.created ? 'created' : 'reused'} ${
        link.type
      } link ${outwardKey} -> ${inwardKey}`,
    );
    linkResults.push({
      type: link.type,
      inwardKey,
      outwardKey,
      action: result.created ? 'created' : 'reused',
    });
  }
});

if (jsonOutput) {
  console.log(
    JSON.stringify({
      applied: true,
      proposal: plan.proposal,
      issues: publicationResults,
      links: linkResults,
      notes: plan.notes,
    }),
  );
}
