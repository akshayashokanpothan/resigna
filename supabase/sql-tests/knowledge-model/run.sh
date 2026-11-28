#!/usr/bin/env bash
# Runs the Knowledge Model test on a throwaway plain Postgres (15+) database.
# Usage: PGHOST=... PGUSER=... supabase/sql-tests/knowledge-model/run.sh
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
db="km_test_$$"
psql -q -c "create database $db"
trap 'psql -q -c "drop database if exists $db"' EXIT
psql -q -d "$db" -v ON_ERROR_STOP=1 -f "$here/stub.sql"
for f in "$here"/../../migrations/*.sql; do psql -q -d "$db" -v ON_ERROR_STOP=1 -f "$f" >/dev/null; done
psql -d "$db" -f "$here/test.sql"
psql -d "$db" -f "$here/fkcheck.sql"
