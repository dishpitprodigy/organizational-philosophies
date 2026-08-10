import {
  AtlassianPublicationTarget,
  type AtlassianTargetTransport,
} from './targetSupport';

export class JpdTarget extends AtlassianPublicationTarget {
  constructor(options: { transport: AtlassianTargetTransport }) {
    super({
      id: 'jpd',
      transport: options.transport,
      issueType: () => 'Idea',
      additionalFields: async () => {
        const user = await options.transport.request<{ accountId?: string }>(
          '/myself',
        );
        if (!user.accountId) {
          throw new Error(
            'Atlassian current user has no accountId for the JPD reporter field.',
          );
        }
        return { reporter: { id: user.accountId } };
      },
    });
  }
}
