import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "conference-organizer.db");

declare global {
  var __db__: DatabaseSync | undefined;
}

function createConnection() {
  // timeout: retry for up to 5s instead of erroring immediately when another
  // process (e.g. Next.js's parallel build workers) briefly holds a lock.
  const database = new DatabaseSync(dbPath, { timeout: 5000 });
  database.exec("PRAGMA journal_mode = WAL");
  database.exec("PRAGMA foreign_keys = ON");
  return database;
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

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL DEFAULT 'professional'
      CHECK (event_type IN ('think_tank', 'public', 'professional', 'other')),
    start_date TEXT,
    end_date TEXT,
    location TEXT,
    budget_total REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS event_participants (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    attending_status TEXT NOT NULL DEFAULT 'invited'
      CHECK (attending_status IN ('invited', 'confirmed', 'declined', 'tentative')),
    meal_preference TEXT,
    flight_cost REAL NOT NULL DEFAULT 0,
    hotel_cost REAL NOT NULL DEFAULT 0,
    meals_cost REAL NOT NULL DEFAULT 0,
    honorarium_cost REAL NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (event_id, person_id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    session_date TEXT,
    start_time TEXT,
    end_time TEXT,
    location TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS session_participants (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    person_id TEXT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'attendee'
      CHECK (role IN ('presenter', 'discussant', 'note_taker', 'moderator', 'attendee')),
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'accepted', 'declined')),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (session_id, person_id)
  );

  CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
  CREATE INDEX IF NOT EXISTS idx_event_participants_person ON event_participants(person_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_event ON sessions(event_id);
  CREATE INDEX IF NOT EXISTS idx_session_participants_session ON session_participants(session_id);
  CREATE INDEX IF NOT EXISTS idx_session_participants_person ON session_participants(person_id);
`);
