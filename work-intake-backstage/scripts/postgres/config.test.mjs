import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { ConfigReader } from '@backstage/config';
import { loadConfig } from '@backstage/config-loader';

async function loadedConfig(configTargets, environment = {}) {
  const configRoot = fileURLToPath(new URL('../..', import.meta.url));
  const { appConfigs } = await loadConfig({
    configRoot,
    configTargets: configTargets.map(path => ({ path })),
    experimentalEnvFunc: async name => {
      if (name in environment) {
        return environment[name];
      }
      return process.env[name];
    },
  });

  return ConfigReader.fromConfigs(appConfigs);
}

function assertDatabaseIsolation(config, expectedConnection) {
  const database = config.getConfig('backend.database');
  const plugins = database.getConfig('plugin');
  const workIntake = plugins.getConfig('work-intake-publication');

  assert.equal(database.getString('client'), 'better-sqlite3');
  assert.equal(database.getString('connection'), ':memory:');
  assert.deepEqual(plugins.keys(), ['work-intake-publication']);
  assert.equal(workIntake.getString('client'), 'pg');
  assert.equal(workIntake.getBoolean('ensureExists'), false);
  assert.equal(
    workIntake.getString('connection.host'),
    expectedConnection.host,
  );
  assert.equal(
    workIntake.getNumber('connection.port'),
    expectedConnection.port,
  );
  assert.equal(
    workIntake.getString('connection.user'),
    expectedConnection.user,
  );
  assert.equal(
    workIntake.getString('connection.password'),
    expectedConnection.password,
  );
  assert.equal(
    workIntake.getString('connection.database'),
    expectedConnection.database,
  );
}

test('only Work Intake is routed to PostgreSQL in development', async () => {
  const config = await loadedConfig(['app-config.yaml'], {
    GITHUB_TOKEN: 'unused',
  });

  assertDatabaseIsolation(config, {
    host: '127.0.0.1',
    port: 5432,
    user: 'work_intake',
    password: 'work_intake',
    database: 'work_intake',
  });
});

test('only Work Intake is routed to PostgreSQL in production', async () => {
  const environment = {
    GITHUB_TOKEN: 'unused',
    POSTGRES_HOST: 'database.internal',
    POSTGRES_PORT: '6543',
    POSTGRES_USER: 'production_user',
    POSTGRES_PASSWORD: 'production_password',
    POSTGRES_DB: 'production_work_intake',
  };
  const config = await loadedConfig(
    ['app-config.yaml', 'app-config.production.yaml'],
    environment,
  );

  assertDatabaseIsolation(config, {
    host: environment.POSTGRES_HOST,
    port: Number(environment.POSTGRES_PORT),
    user: environment.POSTGRES_USER,
    password: environment.POSTGRES_PASSWORD,
    database: environment.POSTGRES_DB,
  });
});
