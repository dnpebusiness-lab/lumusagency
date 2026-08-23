#!/usr/bin/env bash
# =============================================================================
# db-local.sh — apply the Supabase migrations to a plain local PostgreSQL server
# =============================================================================
# Docker (and therefore `supabase start`) is not available in every environment.
# This script gives the same practical result for schema, policy and seed work:
# it drops and recreates a LOCAL database, loads the Supabase compatibility shim
# (supabase/local/00_supabase_shim.sql), applies every migration in order, and
# optionally loads the seed.
#
# It is a development and CI tool only. It refuses to run against anything that
# is not a local host, so it can never be pointed at a real project.
#
# Usage:
#   scripts/db-local.sh reset          # drop, recreate, migrate, seed
#   scripts/db-local.sh migrate        # drop, recreate, migrate (no seed)
#   scripts/db-local.sh psql           # open a shell on the local database
#
# Environment:
#   ASTRA_LOCAL_DB    database name   (default: astra_local)
#   PGHOST/PGPORT/... standard libpq variables
# =============================================================================
set -euo pipefail

DB="${ASTRA_LOCAL_DB:-astra_local}"
HOST="${PGHOST:-/var/run/postgresql}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

case "$HOST" in
  /*|localhost|127.0.0.1|::1) ;;
  *)
    echo "refusing to run against non-local host: $HOST" >&2
    exit 1
    ;;
esac

command="${1:-reset}"

if [[ "$command" == "psql" ]]; then
  exec psql -d "$DB"
fi

echo "==> dropping and recreating database '$DB'"
psql -q -d postgres -v ON_ERROR_STOP=1 \
  -c "drop database if exists ${DB} with (force)" \
  -c "create database ${DB}"

echo "==> loading local Supabase shim (test-only, never used on a real project)"
psql -q -d "$DB" -v ON_ERROR_STOP=1 -f "$ROOT_DIR/supabase/local/00_supabase_shim.sql" >/dev/null

echo "==> applying migrations"
for file in "$ROOT_DIR"/supabase/migrations/*.sql; do
  printf '    %s\n' "$(basename "$file")"
  psql -q -d "$DB" -v ON_ERROR_STOP=1 -f "$file"
done

if [[ "$command" == "reset" ]]; then
  echo "==> loading seed data (fictional demonstration data)"
  psql -q -d "$DB" -v ON_ERROR_STOP=1 -f "$ROOT_DIR/supabase/seed.sql"
fi

echo "==> done: $DB"
