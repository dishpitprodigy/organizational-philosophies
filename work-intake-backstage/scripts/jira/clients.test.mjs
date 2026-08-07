import assert from 'node:assert/strict';
import test from 'node:test';

import { JiraClient, jiraIssueMatchesProjection, toAdf } from './clients.mjs';

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

test('project creation uses Jira Cloud projectTemplateKey', async () => {
  let request;
  const client = new JiraClient({
    baseUrl: 'https://northstar.example',
    email: 'prototype@example.test',
    token: 'not-a-real-token',
    fetchImpl: async (url, init) => {
      request = { url, init };
      return jsonResponse({ id: '10001', key: 'NWI' }, 201);
    },
  });

  await client.createProject({
    key: 'NWI',
    name: 'Northstar Work Intake',
    leadAccountId: 'abc123',
  });

  const body = JSON.parse(request.init.body);
  assert.equal(
    body.projectTemplateKey,
    'com.pyxis.greenhopper.jira:gh-simplified-kanban-classic',
  );
  assert.equal(body.projectTemplateModuleKey, undefined);
});

test('ensureLink does not recreate an existing Jira relationship', async () => {
  const requests = [];
  const client = new JiraClient({
    baseUrl: 'https://northstar.example',
    email: 'prototype@example.test',
    token: 'not-a-real-token',
    fetchImpl: async (url, init) => {
      requests.push({ url, init });
      return jsonResponse({
        fields: {
          issuelinks: [
            {
              type: { name: 'Blocks' },
              outwardIssue: { key: 'SRE-1' },
            },
          ],
        },
      });
    },
  });

  assert.deepEqual(
    await client.ensureLink({
      type: 'Blocks',
      inwardKey: 'PLATFORM-1',
      outwardKey: 'SRE-1',
    }),
    { created: false },
  );
  assert.equal(requests.length, 1);
});

test('ensureLink preserves the direction of a Blocks relationship', async () => {
  const requests = [];
  const client = new JiraClient({
    baseUrl: 'https://northstar.example',
    email: 'prototype@example.test',
    token: 'not-a-real-token',
    fetchImpl: async (url, init) => {
      requests.push({ url, init });
      if (requests.length === 1) {
        return jsonResponse({
          fields: {
            issuelinks: [
              {
                type: { name: 'Blocks' },
                inwardIssue: { key: 'SRE-1' },
              },
            ],
          },
        });
      }
      return new Response(null, { status: 201 });
    },
  });

  assert.deepEqual(
    await client.ensureLink({
      type: 'Blocks',
      inwardKey: 'PLATFORM-1',
      outwardKey: 'SRE-1',
    }),
    { created: true },
  );
  assert.equal(requests.length, 2);
  assert.deepEqual(JSON.parse(requests[1].init.body), {
    type: { name: 'Blocks' },
    inwardIssue: { key: 'PLATFORM-1' },
    outwardIssue: { key: 'SRE-1' },
  });
});

test('plain text descriptions become Atlassian Document Format paragraphs', () => {
  assert.deepEqual(toAdf('First paragraph.\n\nSecond paragraph.'), {
    version: 1,
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'First paragraph.' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Second paragraph.' }],
      },
    ],
  });
});

test('an existing Jira issue must match the current publication projection', () => {
  const projection = { summary: 'Expected', description: 'Current State' };
  assert.equal(
    jiraIssueMatchesProjection(
      {
        fields: {
          summary: 'Expected',
          description: toAdf('Current State'),
        },
      },
      projection,
    ),
    true,
  );
  assert.equal(
    jiraIssueMatchesProjection(
      {
        fields: {
          summary: 'Expected',
          description: toAdf('Different State'),
        },
      },
      projection,
    ),
    false,
  );
});
