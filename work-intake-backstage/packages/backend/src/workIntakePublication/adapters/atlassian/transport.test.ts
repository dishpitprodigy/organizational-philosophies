import {
  AtlassianTransport,
  AtlassianTransportError,
  toAdf,
} from './transport';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('AtlassianTransport', () => {
  it('renders structured paragraphs, headings, and lists as ADF', () => {
    expect(toAdf('Current State\nOwner: Platform\n- First\n- Second')).toEqual({
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Current State' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Owner:', marks: [{ type: 'strong' }] },
            { type: 'text', text: ' Platform' },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'First' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Second' }],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('makes authenticated REST requests and normalizes failures', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(
        jsonResponse({ errorMessages: ['No permission'] }, 403),
      );
    const transport = new AtlassianTransport({
      baseUrl: 'https://northstar.example/',
      email: 'ada@example.test',
      token: 'secret',
      fetchImpl,
    });

    await expect(transport.request('/project/MDP')).rejects.toEqual(
      expect.objectContaining({
        name: 'AtlassianTransportError',
        operation: 'GET /project/MDP',
        status: 403,
        detail: 'No permission',
      }),
    );
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://northstar.example/rest/api/3/project/MDP',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Basic ${Buffer.from(
            'ada@example.test:secret',
          ).toString('base64')}`,
          Accept: 'application/json',
        }),
      }),
    );
  });

  it('exposes discovery, property, link, search, and attachment primitives', async () => {
    const fetchImpl = jest
      .fn()
      .mockImplementation(async () => jsonResponse({ values: [] }));
    const transport = new AtlassianTransport({
      baseUrl: 'https://northstar.example',
      email: 'ada@example.test',
      token: 'secret',
      fetchImpl,
    });

    await transport.projects();
    await transport.fields();
    await transport.search('project = MDP', ['key', 'attachment']);
    await transport.setIssueProperty('MDP-1', 'northstar.publication', {
      localId: 'proposal',
    });
    await transport.ensureLink({
      type: 'Blocks',
      inwardKey: 'MDP-1',
      outwardKey: 'MDP-2',
    });

    expect(fetchImpl.mock.calls.map(([url]) => url)).toEqual([
      'https://northstar.example/rest/api/3/project/search?maxResults=100',
      'https://northstar.example/rest/api/3/field',
      expect.stringContaining('/rest/api/3/search/jql?'),
      'https://northstar.example/rest/api/3/issue/MDP-1/properties/northstar.publication',
      'https://northstar.example/rest/api/3/issue/MDP-1?fields=issuelinks',
      'https://northstar.example/rest/api/3/issueLink',
    ]);
  });
});

void AtlassianTransportError;
