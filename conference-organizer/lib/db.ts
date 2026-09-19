import Database from "better-sqlite3";
import path from "node:path";

const dbPath = path.join(process.cwd(), "data", "conference-organizer.db");

declare global {
  var __db__: Database.Database | undefined;
}

function createConnection() {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}

// Reuse a single connection across hot reloads in dev.
export const db = global.__db__ ?? createConnection();
if (process.env.NODE_ENV !== "production") {
  global.__db__ = db;
}

db.exec(`
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
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE
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
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_person_tags_person ON person_tags(person_id);
  CREATE INDEX IF NOT EXISTS idx_person_tags_tag ON person_tags(tag_id);
  CREATE INDEX IF NOT EXISTS idx_publications_person ON publications(person_id);
`);
