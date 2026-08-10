import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { loadEnvFile } from 'node:process';

export function loadAtlassianEnvironment() {
  const path =
    process.env.ATLASSIAN_ENV_FILE ?? join(homedir(), '.atlassian.env');
  if (existsSync(path)) loadEnvFile(path);
}
