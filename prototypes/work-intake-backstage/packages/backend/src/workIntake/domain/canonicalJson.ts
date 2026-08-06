import { createHash } from 'node:crypto';

type JsonPrimitive = boolean | null | number | string;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

function canonicalValue(value: unknown, path: string): JsonValue {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return value;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error(`${path} contains a non-finite number.`);
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry, index) =>
      canonicalValue(entry, `${path}[${index}]`),
    );
  }
  if (typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new Error(`${path} is not a plain JSON object.`);
    }
    const result: { [key: string]: JsonValue } = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const entry = (value as Record<string, unknown>)[key];
      if (entry === undefined) {
        throw new Error(
          `${path}.${key}: undefined is not valid canonical JSON.`,
        );
      }
      result[key] = canonicalValue(entry, `${path}.${key}`);
    }
    return result;
  }
  throw new Error(`${path} contains a value that is not valid canonical JSON.`);
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalValue(value, '$'));
}

export function workProposalSha256(artifact: unknown): string {
  if (!artifact || typeof artifact !== 'object' || Array.isArray(artifact)) {
    throw new Error('A Work Proposal artifact must be a JSON object.');
  }
  const { publication: ignoredPublication, ...content } = artifact as Record<
    string,
    unknown
  >;
  void ignoredPublication;
  return createHash('sha256').update(canonicalJson(content)).digest('hex');
}
