#!/usr/bin/env bash
set -euo pipefail

legacy_database="${WORK_INTAKE_LEGACY_DATABASE:-backstage_plugin_work-intake-publication}"
target_database="${POSTGRES_DB:-work_intake}"
postgres_user="${POSTGRES_USER:-work_intake}"

for database_name in "$legacy_database" "$target_database"; do
  if [[ ! "$database_name" =~ ^[A-Za-z_][A-Za-z0-9_-]*$ ]]; then
    echo "Unsafe PostgreSQL database name: $database_name" >&2
    exit 2
  fi
done

database_exists() {
  podman compose exec -T postgres \
    psql --username "$postgres_user" --dbname postgres --tuples-only --no-align \
    --command "SELECT 1 FROM pg_database WHERE datname = '$1'" \
    | grep -qx 1
}

if database_exists "$target_database"; then
  if database_exists "$legacy_database"; then
    echo "Both $legacy_database and $target_database exist; refusing to overwrite either database." >&2
    exit 1
  fi
  echo "$target_database already exists; no migration is needed."
  exit 0
fi

if ! database_exists "$legacy_database"; then
  echo "Neither $legacy_database nor $target_database exists; refusing to create an empty replacement." >&2
  exit 1
fi

podman compose exec -T postgres \
  psql --username "$postgres_user" --dbname postgres --set ON_ERROR_STOP=1 \
  --command "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$legacy_database' AND pid <> pg_backend_pid()" \
  --command "ALTER DATABASE \"$legacy_database\" RENAME TO \"$target_database\""

echo "Renamed $legacy_database to $target_database without copying or discarding Work Intake data."
