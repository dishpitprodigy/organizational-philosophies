import {
  AtlassianPublicationTarget,
  type AtlassianTargetTransport,
} from './targetSupport';

export class JpdTarget extends AtlassianPublicationTarget {
  constructor(options: { transport: AtlassianTargetTransport }) {
    super({ id: 'jpd', transport: options.transport, issueType: () => 'Idea' });
  }
}
