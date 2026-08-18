import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { ConfigReader } from '@backstage/config';
import { loadConfig } from '@backstage/config-loader';

async function loadedDevelopmentConfig() {
  const configRoot = fileURLToPath(new URL('../..', import.meta.url));
  const { appConfigs } = await loadConfig({
    configRoot,
    configTargets: [{ path: 'app-config.yaml' }],
    experimentalEnvFunc: async name => {
      if (name === 'GITHUB_TOKEN') {
        return 'unused';
      }
      return process.env[name];
    },
  });

  return ConfigReader.fromConfigs(appConfigs);
}

test('only Work Intake is routed to the dedicated PostgreSQL database', async () => {
  const config = await loadedDevelopmentConfig();
  const database = config.getConfig('backend.database');
  const plugins = database.getConfig('plugin');
  const workIntake = plugins.getConfig('work-intake-publication');

  assert.equal(database.getString('client'), 'better-sqlite3');
  assert.equal(database.getString('connection'), ':memory:');
  assert.deepEqual(plugins.keys(), ['work-intake-publication']);
  assert.equal(workIntake.getString('client'), 'pg');
  assert.equal(workIntake.getBoolean('ensureExists'), false);
  assert.equal(workIntake.getString('connection.host'), '127.0.0.1');
  assert.equal(workIntake.getNumber('connection.port'), 5432);
  assert.equal(workIntake.getString('connection.user'), 'work_intake');
  assert.equal(workIntake.getString('connection.password'), 'work_intake');
  assert.equal(workIntake.getString('connection.database'), 'work_intake');
});
