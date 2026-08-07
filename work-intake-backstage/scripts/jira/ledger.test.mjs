import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { PublicationLedger } from './ledger.mjs';

test('publication ledger persists state atomically', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'northstar-jira-ledger-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const ledger = new PublicationLedger(join(directory, 'publications.json'));
  const expected = {
    publications: {
      'nwi-example': { state: 'published', issueKey: 'NWI-1' },
    },
  };

  await ledger.write(expected);

  assert.deepEqual(await ledger.read(), expected);
});

test('publication ledger rejects concurrent publishers', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'northstar-jira-ledger-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const path = join(directory, 'publications.json');
  const first = new PublicationLedger(path);
  const second = new PublicationLedger(path);

  await first.withLock(async () => {
    await assert.rejects(
      () => second.withLock(async () => undefined),
      /already locked/,
    );
  });
});
