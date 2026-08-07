import { canonicalJson, workProposalSha256 } from './canonicalJson';

describe('canonical Work Proposal JSON', () => {
  it('sorts object keys without changing array order', () => {
    expect(
      canonicalJson({
        z: 3,
        nested: { beta: true, alpha: 'first' },
        ordered: [{ b: 2, a: 1 }, 'second'],
      }),
    ).toBe(
      '{"nested":{"alpha":"first","beta":true},"ordered":[{"a":1,"b":2},"second"],"z":3}',
    );
  });

  it('produces the same hash for semantically identical key ordering', () => {
    const left = {
      schemaVersion: 2,
      proposal: { revision: 0, id: 'WP-2026-0042' },
    };
    const right = {
      proposal: { id: 'WP-2026-0042', revision: 0 },
      schemaVersion: 2,
    };

    expect(workProposalSha256(left)).toBe(workProposalSha256(right));
    expect(workProposalSha256(left)).toMatch(/^[a-f0-9]{64}$/);
  });

  it('excludes publication results from the content identity', () => {
    const source = {
      schemaVersion: 2,
      proposal: { id: 'WP-2026-0042', revision: 0 },
    };

    expect(
      workProposalSha256({
        ...source,
        publication: {
          jiraKey: 'NWI-17',
          publishedAt: '2026-08-05T12:00:00.000Z',
        },
      }),
    ).toBe(workProposalSha256(source));
  });

  it('rejects values JSON cannot preserve', () => {
    expect(() => canonicalJson({ missing: undefined })).toThrow(
      /undefined is not valid canonical JSON/,
    );
  });
});
