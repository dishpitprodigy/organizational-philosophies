import type { PublicationRecord } from '../../contracts';
import {
  AtlassianPublicationTarget,
  type AtlassianTargetTransport,
} from './targetSupport';

function jiraIssueType(record: PublicationRecord) {
  if (record.kind === 'proposal') return 'Epic';
  if (record.kind === 'ordered-review') return 'Task';
  const candidateType = record.content.summary?.find(
    field => field.label === 'Candidate type',
  )?.value;
  return candidateType === 'Discovery Work Package' ? 'Task' : 'Epic';
}

export class JiraTarget extends AtlassianPublicationTarget {
  constructor(options: { transport: AtlassianTargetTransport }) {
    super({
      id: 'jira',
      transport: options.transport,
      issueType: jiraIssueType,
    });
  }
}
