import { Pool } from "pg";

declare global {
  var __pgPool__: Pool | undefined;
  var __schemaReady__: Promise<void> | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add a Postgres connection string (e.g. from Neon) " +
      "to your environment. See README.md for setup instructions."
  );
}

export const pool =
  global.__pgPool__ ??
  new Pool({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgPool__ = pool;
}

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS people (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    affiliation TEXT,
    title TEXT,
    location_type TEXT NOT NULL DEFAULT 'domestic'
      CHECK (location_type IN ('local', 'domestic', 'international')),
    photo_path TEXT,
    bio TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS person_tags (
    person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (person_id, tag_id)
  );

  CREATE TABLE IF NOT EXISTS publications (
    id TEXT PRIMARY KEY,
    person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT,
    year TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_person_tags_person ON person_tags(person_id);
  CREATE INDEX IF NOT EXISTS idx_person_tags_tag ON person_tags(tag_id);
  CREATE INDEX IF NOT EXISTS idx_publications_person ON publications(person_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name_lower ON tags (lower(name));
`;

export function ensureSchema(): Promise<void> {
  if (!global.__schemaReady__) {
    global.__schemaReady__ = pool.query(SCHEMA_SQL).then(() => undefined);
  }
  return global.__schemaReady__;
}
