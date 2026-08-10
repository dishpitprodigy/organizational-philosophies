export type AtlassianAttachment = {
  id: string;
  filename?: string;
  content?: string;
};

type FetchImplementation = typeof fetch;

export class AtlassianTransportError extends Error {
  readonly operation: string;
  readonly status?: number;
  readonly detail?: string;

  constructor(options: {
    operation: string;
    status?: number;
    detail?: string;
  }) {
    super(
      `${options.operation} failed${
        options.status ? ` (${options.status})` : ''
      }${options.detail ? `: ${options.detail}` : ''}`,
    );
    this.name = 'AtlassianTransportError';
    this.operation = options.operation;
    this.status = options.status;
    this.detail = options.detail;
  }
}

function normalizedBaseUrl(value: string): string {
  if (!value) throw new Error('Atlassian base URL is required.');
  return value.replace(/\/+$/, '');
}

async function responseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function failureDetail(body: unknown): string | undefined {
  if (typeof body === 'string') return body;
  if (body && typeof body === 'object') {
    const candidate = body as { errorMessages?: unknown; errors?: unknown };
    const detail = candidate.errorMessages ?? candidate.errors;
    if (Array.isArray(detail)) return detail.map(String).join('; ');
    return typeof detail === 'string' ? detail : JSON.stringify(detail ?? body);
  }
  return body == null ? undefined : String(body);
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

function richText(value: string) {
  const match = value.match(/^([^:\n]{1,48}:)(.*)$/s);
  if (!match) return [{ type: 'text', text: value }];
  return [
    { type: 'text', text: match[1], marks: [{ type: 'strong' }] },
    ...(match[2] ? [{ type: 'text', text: match[2] }] : []),
  ];
}

/** Renders the established Jira description subset as Atlassian Document Format. */
export function toAdf(value: unknown) {
  const content: unknown[] = [];
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
      const items: unknown[] = [];
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

export class AtlassianTransport {
  readonly baseUrl: string;
  readonly authorization: string;
  private readonly fetchImpl: FetchImplementation;

  constructor(options: {
    baseUrl: string;
    email: string;
    token: string;
    fetchImpl?: FetchImplementation;
  }) {
    this.baseUrl = normalizedBaseUrl(options.baseUrl);
    if (!options.email) throw new Error('Atlassian email is required.');
    if (!options.token) throw new Error('Atlassian API token is required.');
    this.authorization = `Basic ${Buffer.from(
      `${options.email}:${options.token}`,
    ).toString('base64')}`;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async request<T = unknown>(
    path: string,
    options: { method?: string; body?: unknown } = {},
  ): Promise<T> {
    const method = options.method ?? 'GET';
    const operation = `${method} ${path}`;
    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}/rest/api/3${path}`, {
        method,
        headers: {
          Accept: 'application/json',
          Authorization: this.authorization,
          ...(options.body === undefined
            ? {}
            : { 'Content-Type': 'application/json' }),
        },
        ...(options.body === undefined
          ? {}
          : { body: JSON.stringify(options.body) }),
      });
    } catch (cause) {
      throw new AtlassianTransportError({
        operation,
        detail: cause instanceof Error ? cause.message : String(cause),
      });
    }
    const body = await responseBody(response);
    if (!response.ok)
      throw new AtlassianTransportError({
        operation,
        status: response.status,
        detail: failureDetail(body),
      });
    return body as T;
  }

  project(projectKey: string) {
    return this.request(`/project/${encodeURIComponent(projectKey)}`);
  }
  async projects() {
    return (
      (
        await this.request<{ values?: unknown[] }>(
          '/project/search?maxResults=100',
        )
      ).values ?? []
    );
  }
  fields() {
    return this.request('/field');
  }
  createMeta(projectKey?: string) {
    const query = projectKey
      ? `?projectKeys=${encodeURIComponent(
          projectKey,
        )}&expand=projects.issuetypes.fields`
      : '';
    return this.request(`/issue/createmeta${query}`);
  }
  search(jql: string, fields: string[] = []) {
    const query = new URLSearchParams({
      jql,
      fields: fields.join(','),
      maxResults: '100',
    });
    return this.request(`/search/jql?${query}`);
  }
  setIssueProperty(issueKey: string, propertyKey: string, value: unknown) {
    return this.request(
      `/issue/${encodeURIComponent(issueKey)}/properties/${encodeURIComponent(
        propertyKey,
      )}`,
      { method: 'PUT', body: value },
    );
  }
  issueProperties(issueKey: string) {
    return this.request(`/issue/${encodeURIComponent(issueKey)}/properties`);
  }
  async issueLinks(issueKey: string) {
    const result = await this.request<{ fields?: { issuelinks?: unknown[] } }>(
      `/issue/${encodeURIComponent(issueKey)}?fields=issuelinks`,
    );
    return result.fields?.issuelinks ?? [];
  }
  async ensureLink(options: {
    type: string;
    inwardKey: string;
    outwardKey: string;
  }): Promise<{ created: boolean }> {
    const links = (await this.issueLinks(options.inwardKey)) as Array<{
      type?: { name?: string };
      outwardIssue?: { key?: string };
    }>;
    if (
      links.some(
        link =>
          link.type?.name === options.type &&
          link.outwardIssue?.key === options.outwardKey,
      )
    )
      return { created: false };
    await this.request('/issueLink', {
      method: 'POST',
      body: {
        type: { name: options.type },
        inwardIssue: { key: options.inwardKey },
        outwardIssue: { key: options.outwardKey },
      },
    });
    return { created: true };
  }
  async attachments(issueKey: string): Promise<AtlassianAttachment[]> {
    const issue = await this.request<{
      fields?: { attachment?: AtlassianAttachment[] };
    }>(`/issue/${encodeURIComponent(issueKey)}?fields=attachment`);
    return issue.fields?.attachment ?? [];
  }
  async uploadAttachment(
    issueKey: string,
    filename: string,
    content: string,
  ): Promise<AtlassianAttachment> {
    const operation = `POST /issue/${issueKey}/attachments`;
    const body = new FormData();
    body.append(
      'file',
      new Blob([content], { type: 'application/json' }),
      filename,
    );
    let response: Response;
    try {
      response = await this.fetchImpl(
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
      );
    } catch (cause) {
      throw new AtlassianTransportError({
        operation,
        detail: cause instanceof Error ? cause.message : String(cause),
      });
    }
    const result = await responseBody(response);
    if (!response.ok)
      throw new AtlassianTransportError({
        operation,
        status: response.status,
        detail: failureDetail(result),
      });
    const attachment = (result as AtlassianAttachment[] | null)?.find(
      item => item.filename === filename,
    );
    if (!attachment?.id)
      throw new AtlassianTransportError({
        operation,
        detail: `Atlassian did not return uploaded attachment ${filename}.`,
      });
    return attachment;
  }
  async download(url: string): Promise<string> {
    const operation = 'GET attachment content';
    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        headers: {
          Accept: 'application/json',
          Authorization: this.authorization,
        },
      });
    } catch (cause) {
      throw new AtlassianTransportError({
        operation,
        detail: cause instanceof Error ? cause.message : String(cause),
      });
    }
    const content = await response.text();
    if (!response.ok)
      throw new AtlassianTransportError({
        operation,
        status: response.status,
        detail: content || undefined,
      });
    return content;
  }
}
