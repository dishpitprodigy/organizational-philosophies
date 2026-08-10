function normalizedBaseUrl(value, name) {
  if (!value) throw new Error(`${name} is required.`);
  return value.replace(/\/+$/, '');
}

async function responseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function checkedFetch(fetchImpl, url, init, operation) {
  const response = await fetchImpl(url, init);
  const body = await responseBody(response);
  if (!response.ok) {
    const detail =
      typeof body === 'string'
        ? body
        : JSON.stringify(body?.errorMessages ?? body?.errors ?? body);
    throw new Error(`${operation} failed (${response.status}): ${detail}`);
  }
  return body;
}

const DESCRIPTION_HEADINGS = new Set([
  'Current State',
  'Desired Outcome',
  'Required Difference',
  'Requirements',
  'Acceptance Conditions',
  'Non-Goals',
  'Outcome / Exit Condition',
]);

function richText(value) {
  const match = String(value).match(/^([^:\n]{1,48}:)(.*)$/s);
  if (!match) return [{ type: 'text', text: String(value) }];
  return [
    { type: 'text', text: match[1], marks: [{ type: 'strong' }] },
    ...(match[2] ? [{ type: 'text', text: match[2] }] : []),
  ];
}

export function toAdf(value) {
  const content = [];
  const lines = String(value ?? '').split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;
    if (DESCRIPTION_HEADINGS.has(line)) {
      content.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: line }],
      });
      continue;
    }
    if (line.startsWith('- ')) {
      const items = [];
      while (index < lines.length && lines[index].trim().startsWith('- ')) {
        let item = lines[index].trim().slice(2);
        while (index + 1 < lines.length && /^\s{2,}\S/.test(lines[index + 1])) {
          index += 1;
          item += `\n${lines[index].trim()}`;
        }
        items.push({
          type: 'listItem',
          content: [{ type: 'paragraph', content: richText(item) }],
        });
        index += 1;
        while (index < lines.length && !lines[index].trim()) index += 1;
      }
      index -= 1;
      content.push({ type: 'bulletList', content: items });
      continue;
    }
    content.push({ type: 'paragraph', content: richText(line) });
  }
  return { version: 1, type: 'doc', content };
}

function toLegacyAdf(value) {
  const content = String(value ?? '')
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => ({
      type: 'paragraph',
      content: [{ type: 'text', text: block }],
    }));
  return { version: 1, type: 'doc', content };
}

export function jiraIssueMatchesProjection(existing, projection) {
  return (
    existing?.fields?.summary === projection.summary &&
    [toAdf(projection.description), toLegacyAdf(projection.description)].some(
      description =>
        JSON.stringify(existing?.fields?.description) ===
        JSON.stringify(description),
    )
  );
}

export class BackstageCatalogClient {
  constructor({ baseUrl = 'http://localhost:7007', fetchImpl = fetch }) {
    this.baseUrl = normalizedBaseUrl(baseUrl, 'Backstage base URL');
    this.fetch = fetchImpl;
  }

  async #guestToken() {
    const body = await checkedFetch(
      this.fetch,
      `${this.baseUrl}/api/auth/guest/refresh`,
      { method: 'POST', headers: { 'X-Requested-With': 'XMLHttpRequest' } },
      'Backstage guest authentication',
    );
    return body?.backstageIdentity?.token;
  }

  async entities() {
    const token = await this.#guestToken();
    return checkedFetch(
      this.fetch,
      `${this.baseUrl}/api/catalog/entities`,
      { headers: { Authorization: `Bearer ${token}` } },
      'Backstage catalog query',
    );
  }

  async groups() {
    const entities = await this.entities();
    return entities.filter(entity => entity.kind?.toLowerCase() === 'group');
  }
}

export class JiraClient {
  constructor({ baseUrl, email, token, fetchImpl = fetch }) {
    this.baseUrl = normalizedBaseUrl(baseUrl, 'ATLASSIAN_URL');
    if (!email) throw new Error('ATLASSIAN_EMAIL is required.');
    if (!token) throw new Error('ATLASSIAN_TOKEN is required.');
    this.fetch = fetchImpl;
    this.authorization = `Basic ${Buffer.from(`${email}:${token}`).toString(
      'base64',
    )}`;
  }

  async request(path, { method = 'GET', body } = {}) {
    return checkedFetch(
      this.fetch,
      `${this.baseUrl}/rest/api/3${path}`,
      {
        method,
        headers: {
          Accept: 'application/json',
          Authorization: this.authorization,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      },
      `Jira ${method} ${path}`,
    );
  }

  currentUser() {
    return this.request('/myself');
  }

  issueUrl(issueKey) {
    return `${this.baseUrl}/browse/${encodeURIComponent(issueKey)}`;
  }

  async projects() {
    const result = await this.request('/project/search?maxResults=100');
    return result.values;
  }

  createProject({ key, name, leadAccountId }) {
    return this.request('/project', {
      method: 'POST',
      body: {
        key,
        name,
        projectTypeKey: 'software',
        projectTemplateKey:
          'com.pyxis.greenhopper.jira:gh-simplified-kanban-classic',
        leadAccountId,
        assigneeType: 'PROJECT_LEAD',
      },
    });
  }

  async findIssue(projectKey, publicationLabel) {
    const jql = `project = "${projectKey}" AND labels = "${publicationLabel}"`;
    const query = new URLSearchParams({
      jql,
      fields: 'key,summary,description',
      maxResults: '2',
    });
    const result = await this.request(`/search/jql?${query}`);
    return result.issues?.[0] ?? null;
  }

  createIssue(issue, parentKey) {
    return this.request('/issue', {
      method: 'POST',
      body: {
        fields: {
          project: { key: issue.projectKey },
          issuetype: { name: issue.issueType },
          summary: issue.summary,
          description: toAdf(issue.description),
          labels: issue.labels,
          ...(parentKey ? { parent: { key: parentKey } } : {}),
        },
        properties: [
          {
            key: 'northstar.publication',
            value: {
              localId: issue.localId,
              publicationLabel: issue.publicationLabel,
              fingerprint: issue.fingerprint,
            },
          },
        ],
      },
    });
  }

  updateIssueDescription(issueKey, description) {
    return this.request(`/issue/${encodeURIComponent(issueKey)}`, {
      method: 'PUT',
      body: { fields: { description: toAdf(description) } },
    });
  }

  setIssueProperty(issueKey, propertyKey, value) {
    return this.request(
      `/issue/${encodeURIComponent(issueKey)}/properties/${encodeURIComponent(
        propertyKey,
      )}`,
      { method: 'PUT', body: value },
    );
  }

  async issueLinks(issueKey) {
    const result = await this.request(
      `/issue/${encodeURIComponent(issueKey)}?fields=issuelinks`,
    );
    return result.fields?.issuelinks ?? [];
  }

  async ensureLink({ type, inwardKey, outwardKey }) {
    const existing = await this.issueLinks(inwardKey);
    const present = existing.some(link => {
      return link.type?.name === type && link.outwardIssue?.key === outwardKey;
    });
    if (present) return { created: false };
    await this.request('/issueLink', {
      method: 'POST',
      body: {
        type: { name: type },
        inwardIssue: { key: inwardKey },
        outwardIssue: { key: outwardKey },
      },
    });
    return { created: true };
  }

  async ensureJsonAttachment({ issueKey, filename, revisionPrefix, content }) {
    const issue = await this.request(
      `/issue/${encodeURIComponent(issueKey)}?fields=attachment`,
    );
    const attachments = issue.fields?.attachment ?? [];
    const existing = attachments.find(
      attachment => attachment.filename === filename,
    );
    if (existing) {
      if (!existing.content) {
        throw new Error(
          `Jira attachment ${existing.id} has no downloadable content URL for verification.`,
        );
      }
      const response = await this.fetch(existing.content, {
        headers: {
          Accept: 'application/json',
          Authorization: this.authorization,
        },
      });
      if (!response.ok) {
        throw new Error(
          `Jira attachment verification failed (${response.status}).`,
        );
      }
      if ((await response.text()) !== content) {
        throw new Error(
          `Jira attachment ${existing.id} does not match its content-addressed filename.`,
        );
      }
      return {
        attachmentId: existing.id,
        attachmentUrl: existing.content,
        action: 'reused',
      };
    }

    const conflicting = attachments.find(attachment =>
      attachment.filename?.startsWith(revisionPrefix),
    );
    if (conflicting) {
      throw new Error(
        `Jira issue ${issueKey} already has a different JSON artifact for this proposal revision (${conflicting.filename}). Increment the Work Proposal revision before publishing changed content.`,
      );
    }

    const body = new FormData();
    body.append(
      'file',
      new Blob([content], { type: 'application/json' }),
      filename,
    );
    const created = await checkedFetch(
      this.fetch,
      `${this.baseUrl}/rest/api/3/issue/${encodeURIComponent(
        issueKey,
      )}/attachments`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: this.authorization,
          'X-Atlassian-Token': 'no-check',
        },
        body,
      },
      `Jira POST /issue/${issueKey}/attachments`,
    );
    const attachment = created?.find(item => item.filename === filename);
    if (!attachment?.id) {
      throw new Error(
        `Jira did not return the uploaded attachment ${filename}.`,
      );
    }
    return {
      attachmentId: attachment.id,
      attachmentUrl:
        attachment.content ??
        `${this.baseUrl}/rest/api/3/attachment/content/${encodeURIComponent(
          attachment.id,
        )}`,
      action: 'created',
    };
  }
}

export function jiraClientFromEnvironment(fetchImpl = fetch) {
  return new JiraClient({
    baseUrl: process.env.ATLASSIAN_URL,
    email: process.env.ATLASSIAN_EMAIL,
    token: process.env.ATLASSIAN_TOKEN,
    fetchImpl,
  });
}
