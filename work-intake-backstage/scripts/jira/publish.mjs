#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

import { loadAtlassianEnvironment } from './environment.mjs';
import { firstPositionalArgument } from './planning.mjs';

loadAtlassianEnvironment();

const apply = process.argv.includes('--apply');
const jsonOutput = process.argv.includes('--json');
const artifactPath = firstPositionalArgument(process.argv.slice(2));
if (!artifactPath) {
  throw new Error('Usage: publish.mjs <work-intake-artifact.json> [--apply]');
}

const backstageUrl = (
  process.env.BACKSTAGE_URL ?? 'http://localhost:7007'
).replace(/\/+$/, '');
const artifact = JSON.parse(await readFile(artifactPath, 'utf8'));

async function checkedJson(response, operation) {
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { error: text };
  }
  if (!response.ok) {
    const detail = body?.error?.message ?? body?.error ?? response.statusText;
    throw new Error(`${operation} failed (${response.status}): ${detail}`);
  }
  return body;
}

const auth = await checkedJson(
  await fetch(`${backstageUrl}/api/auth/guest/refresh`, {
    method: 'POST',
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  }),
  'Backstage guest authentication',
);
const token = auth?.backstageIdentity?.token;
if (!token)
  throw new Error('Backstage guest authentication returned no token.');

const operation = apply ? 'publish' : 'preview';
const result = await checkedJson(
  await fetch(`${backstageUrl}/api/work-intake-publication/${operation}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ profileId: 'jira-work-management', artifact }),
  }),
  `Work Intake ${operation}`,
);

if (jsonOutput) {
  console.log(JSON.stringify({ applied: apply, ...result }));
} else if (apply) {
  console.log(
    `Published ${
      result.results?.length ?? 0
    } projection(s) through Jira Work Management.`,
  );
  for (const record of result.results ?? []) {
    console.log(
      `- ${record.action} ${record.externalId}${
        record.url ? ` ${record.url}` : ''
      }`,
    );
  }
} else {
  console.log(
    `Dry run: ${
      result.records?.length ?? 0
    } projection(s) through Jira Work Management.`,
  );
  for (const note of result.notes ?? []) console.log(`- NOTE: ${note}`);
  console.log(
    'No external state changed. Re-run with --apply to publish this plan.',
  );
}
