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

export function toAdf(value) {
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
    JSON.stringify(existing?.fields?.description) ===
      JSON.stringify(toAdf(projection.description))
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
}

export function jiraClientFromEnvironment(fetchImpl = fetch) {
  return new JiraClient({
    baseUrl: process.env.ATLASSIAN_URL,
    email: process.env.ATLASSIAN_EMAIL,
    token: process.env.ATLASSIAN_TOKEN,
    fetchImpl,
  });
}
