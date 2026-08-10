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

test('issueUrl returns a browser link for a Jira issue', () => {
  const client = new JiraClient({
    baseUrl: 'https://northstar.example',
    email: 'prototype@example.test',
    token: 'not-a-real-token',
  });

  assert.equal(
    client.issueUrl('NWI-38'),
    'https://northstar.example/browse/NWI-38',
  );
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

test('proposal descriptions become structured Atlassian Document Format', () => {
  assert.deepEqual(
    toAdf(
      'Artifact: WP-2026-0042 rev 0\nState: Draft\n\nCurrent State\nObserved facts.\n\nRequirements\n- SHALL-001: Retain evidence\n  Verification: Replay it',
    ),
    {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Artifact:', marks: [{ type: 'strong' }] },
            { type: 'text', text: ' WP-2026-0042 rev 0' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'State:', marks: [{ type: 'strong' }] },
            { type: 'text', text: ' Draft' },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Current State' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Observed facts.' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Requirements' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'SHALL-001:',
                      marks: [{ type: 'strong' }],
                    },
                    {
                      type: 'text',
                      text: ' Retain evidence\nVerification: Replay it',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  );
});

test('updateIssueDescription replaces plain formatting with structured ADF', async () => {
  let request;
  const client = new JiraClient({
    baseUrl: 'https://northstar.example',
    email: 'prototype@example.test',
    token: 'not-a-real-token',
    fetchImpl: async (url, init) => {
      request = { url, init };
      return jsonResponse({});
    },
  });

  await client.updateIssueDescription('NWI-38', 'Current State\nFacts.');

  assert.equal(
    request.url,
    'https://northstar.example/rest/api/3/issue/NWI-38',
  );
  const body = JSON.parse(request.init.body);
  assert.equal(body.fields.description.content[0].type, 'heading');
});

test('setIssueProperty writes the compact work-proposal manifest', async () => {
  let request;
  const client = new JiraClient({
    baseUrl: 'https://northstar.example',
    email: 'prototype@example.test',
    token: 'not-a-real-token',
    fetchImpl: async (url, init) => {
      request = { url, init };
      return jsonResponse({});
    },
  });
  const manifest = {
    schemaVersion: 1,
    proposalId: 'WP-2026-0042',
    artifactAttachmentId: '10002',
  };

  await client.setIssueProperty('NWI-38', 'northstar.work-proposal', manifest);

  assert.equal(
    request.url,
    'https://northstar.example/rest/api/3/issue/NWI-38/properties/northstar.work-proposal',
  );
  assert.deepEqual(JSON.parse(request.init.body), manifest);
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

test('ensureJsonAttachment verifies and reuses an exact attachment', async () => {
  const requests = [];
  const client = new JiraClient({
    baseUrl: 'https://northstar.example',
    email: 'prototype@example.test',
    token: 'not-a-real-token',
    fetchImpl: async (url, init) => {
      requests.push({ url, init });
      if (requests.length === 2) {
        return new Response('{"proposal":{}}\n', {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return jsonResponse({
        fields: {
          attachment: [
            {
              id: '10001',
              filename: 'WP-2026-0042-rev-0-a1b2c3.json',
              content: 'https://northstar.example/attachment/10001',
            },
          ],
        },
      });
    },
  });

  assert.deepEqual(
    await client.ensureJsonAttachment({
      issueKey: 'NWI-1',
      filename: 'WP-2026-0042-rev-0-a1b2c3.json',
      revisionPrefix: 'WP-2026-0042-rev-0-',
      content: '{"proposal":{}}\n',
    }),
    {
      attachmentId: '10001',
      attachmentUrl: 'https://northstar.example/attachment/10001',
      action: 'reused',
    },
  );
  assert.equal(requests.length, 2);
  assert.equal(requests[1].url, 'https://northstar.example/attachment/10001');
});

test('ensureJsonAttachment rejects bytes that do not match the filename', async () => {
  let requestCount = 0;
  const client = new JiraClient({
    baseUrl: 'https://northstar.example',
    email: 'prototype@example.test',
    token: 'not-a-real-token',
    fetchImpl: async () => {
      requestCount += 1;
      if (requestCount === 1) {
        return jsonResponse({
          fields: {
            attachment: [
              {
                id: '10001',
                filename: 'WP-2026-0042-rev-0-a1b2c3.json',
                content: 'https://northstar.example/attachment/10001',
              },
            ],
          },
        });
      }
      return new Response('{"wrong":true}\n');
    },
  });

  await assert.rejects(
    () =>
      client.ensureJsonAttachment({
        issueKey: 'NWI-1',
        filename: 'WP-2026-0042-rev-0-a1b2c3.json',
        revisionPrefix: 'WP-2026-0042-rev-0-',
        content: '{"proposal":{}}\n',
      }),
    /does not match its content-addressed filename/,
  );
});

test('ensureJsonAttachment uploads JSON using Jira attachment headers', async () => {
  const requests = [];
  const client = new JiraClient({
    baseUrl: 'https://northstar.example',
    email: 'prototype@example.test',
    token: 'not-a-real-token',
    fetchImpl: async (url, init) => {
      requests.push({ url, init });
      if (requests.length === 1) {
        return jsonResponse({ fields: { attachment: [] } });
      }
      return jsonResponse(
        [{ id: '10002', filename: 'WP-2026-0042-rev-0-a1b2c3.json' }],
        200,
      );
    },
  });

  assert.deepEqual(
    await client.ensureJsonAttachment({
      issueKey: 'NWI-1',
      filename: 'WP-2026-0042-rev-0-a1b2c3.json',
      revisionPrefix: 'WP-2026-0042-rev-0-',
      content: '{"proposal":{}}\n',
    }),
    {
      attachmentId: '10002',
      attachmentUrl:
        'https://northstar.example/rest/api/3/attachment/content/10002',
      action: 'created',
    },
  );
  assert.equal(requests.length, 2);
  assert.equal(
    requests[1].url,
    'https://northstar.example/rest/api/3/issue/NWI-1/attachments',
  );
  assert.equal(requests[1].init.headers['X-Atlassian-Token'], 'no-check');
  assert.ok(requests[1].init.body instanceof FormData);
});

test('ensureJsonAttachment rejects different content for the same proposal revision', async () => {
  const client = new JiraClient({
    baseUrl: 'https://northstar.example',
    email: 'prototype@example.test',
    token: 'not-a-real-token',
    fetchImpl: async () =>
      jsonResponse({
        fields: {
          attachment: [
            { id: '10001', filename: 'WP-2026-0042-rev-0-oldhash.json' },
          ],
        },
      }),
  });

  await assert.rejects(
    () =>
      client.ensureJsonAttachment({
        issueKey: 'NWI-1',
        filename: 'WP-2026-0042-rev-0-newhash.json',
        revisionPrefix: 'WP-2026-0042-rev-0-',
        content: '{"proposal":{"changed":true}}\n',
      }),
    /different JSON artifact/,
  );
});
