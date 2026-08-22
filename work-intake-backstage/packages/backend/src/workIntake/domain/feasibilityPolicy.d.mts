export function feasibilityPolicyIssues(
  proposal: {
    feasibilityBasis?: {
      assessments?: Array<{
        id?: string;
        covers?: string[];
        finding?: string;
      }>;
    };
    requirements?: Array<{ id: string; modality: string }>;
    acceptanceConditions?: Array<{ id: string }>;
    knownUncertainty?: {
      present?: boolean;
      question?: string;
      discoveryTimebox?: string;
    };
  },
  routingFacts?: Record<string, unknown>,
): string[];
