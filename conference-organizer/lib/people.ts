import { nanoid } from "nanoid";
import { db } from "./db";

export type LocationType = "local" | "domestic" | "international";

export type Publication = {
  id: string;
  personId: string;
  title: string;
  url: string | null;
  year: string | null;
};

export type Person = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  affiliation: string | null;
  title: string | null;
  locationType: LocationType;
  photoPath: string | null;
  bio: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  publications: Publication[];
};

export type PersonInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  affiliation?: string | null;
  title?: string | null;
  locationType: LocationType;
  bio?: string | null;
  notes?: string | null;
  tags: string[];
};

type PersonRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  affiliation: string | null;
  title: string | null;
  location_type: LocationType;
  photo_path: string | null;
  bio: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function rowToPerson(row: PersonRow): Person {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    affiliation: row.affiliation,
    title: row.title,
    locationType: row.location_type,
    photoPath: row.photo_path,
    bio: row.bio,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: getTagsForPerson(row.id),
    publications: getPublicationsForPerson(row.id),
  };
}

function getTagsForPerson(personId: string): string[] {
  const rows = db
    .prepare(
      `SELECT t.name FROM tags t
       JOIN person_tags pt ON pt.tag_id = t.id
       WHERE pt.person_id = ?
       ORDER BY t.name COLLATE NOCASE`
    )
    .all(personId) as { name: string }[];
  return rows.map((r) => r.name);
}

function getPublicationsForPerson(personId: string): Publication[] {
  const rows = db
    .prepare(
      `SELECT id, person_id as personId, title, url, year FROM publications
       WHERE person_id = ? ORDER BY year DESC, created_at DESC`
    )
    .all(personId) as Publication[];
  return rows;
}

function upsertTag(name: string): string {
  const trimmed = name.trim();
  const existing = db
    .prepare(`SELECT id FROM tags WHERE name = ? COLLATE NOCASE`)
    .get(trimmed) as { id: string } | undefined;
  if (existing) return existing.id;
  const id = nanoid();
  db.prepare(`INSERT INTO tags (id, name) VALUES (?, ?)`).run(id, trimmed);
  return id;
}

function setPersonTags(personId: string, tagNames: string[]) {
  db.prepare(`DELETE FROM person_tags WHERE person_id = ?`).run(personId);
  const uniqueNames = [...new Set(tagNames.map((t) => t.trim()).filter(Boolean))];
  for (const name of uniqueNames) {
    const tagId = upsertTag(name);
    db.prepare(
      `INSERT OR IGNORE INTO person_tags (person_id, tag_id) VALUES (?, ?)`
    ).run(personId, tagId);
  }
  db.prepare(
    `DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag_id FROM person_tags)`
  ).run();
}

export function listPeople(filter: {
  q?: string;
  tag?: string;
  locationType?: string;
} = {}): Person[] {
  let ids: string[];

  if (filter.tag) {
    ids = (
      db
        .prepare(
          `SELECT DISTINCT p.id FROM people p
           JOIN person_tags pt ON pt.person_id = p.id
           JOIN tags t ON t.id = pt.tag_id
           WHERE t.name = ? COLLATE NOCASE`
        )
        .all(filter.tag) as { id: string }[]
    ).map((r) => r.id);
  } else {
    ids = (db.prepare(`SELECT id FROM people`).all() as { id: string }[]).map(
      (r) => r.id
    );
  }

  const idSet = new Set(ids);

  let rows = db
    .prepare(`SELECT * FROM people ORDER BY name COLLATE NOCASE`)
    .all() as PersonRow[];

  rows = rows.filter((r) => idSet.has(r.id));

  if (filter.locationType) {
    rows = rows.filter((r) => r.location_type === filter.locationType);
  }

  let people = rows.map(rowToPerson);

  if (filter.q) {
    const q = filter.q.toLowerCase();
    people = people.filter((p) =>
      [p.name, p.email, p.affiliation, p.title, ...p.tags]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  }

  return people;
}

export function getPerson(id: string): Person | undefined {
  const row = db.prepare(`SELECT * FROM people WHERE id = ?`).get(id) as
    | PersonRow
    | undefined;
  if (!row) return undefined;
  return rowToPerson(row);
}

export function createPerson(input: PersonInput): string {
  const id = nanoid();
  db.prepare(
    `INSERT INTO people (id, name, email, phone, affiliation, title, location_type, bio, notes)
     VALUES (@id, @name, @email, @phone, @affiliation, @title, @locationType, @bio, @notes)`
  ).run({
    id,
    name: input.name,
    email: input.email ?? null,
    phone: input.phone ?? null,
    affiliation: input.affiliation ?? null,
    title: input.title ?? null,
    locationType: input.locationType,
    bio: input.bio ?? null,
    notes: input.notes ?? null,
  });
  setPersonTags(id, input.tags);
  return id;
}

export function updatePerson(id: string, input: PersonInput): void {
  db.prepare(
    `UPDATE people SET
       name = @name,
       email = @email,
       phone = @phone,
       affiliation = @affiliation,
       title = @title,
       location_type = @locationType,
       bio = @bio,
       notes = @notes,
       updated_at = datetime('now')
     WHERE id = @id`
  ).run({
    id,
    name: input.name,
    email: input.email ?? null,
    phone: input.phone ?? null,
    affiliation: input.affiliation ?? null,
    title: input.title ?? null,
    locationType: input.locationType,
    bio: input.bio ?? null,
    notes: input.notes ?? null,
  });
  setPersonTags(id, input.tags);
}

export function deletePerson(id: string): void {
  db.prepare(`DELETE FROM people WHERE id = ?`).run(id);
  db.prepare(
    `DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag_id FROM person_tags)`
  ).run();
}

export function setPersonPhoto(id: string, photoPath: string | null): void {
  db.prepare(
    `UPDATE people SET photo_path = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(photoPath, id);
}

export function getAllTags(): { name: string; count: number }[] {
  return db
    .prepare(
      `SELECT t.name as name, COUNT(pt.person_id) as count
       FROM tags t
       LEFT JOIN person_tags pt ON pt.tag_id = t.id
       GROUP BY t.id
       ORDER BY t.name COLLATE NOCASE`
    )
    .all() as { name: string; count: number }[];
}

export function addPublication(
  personId: string,
  pub: { title: string; url?: string | null; year?: string | null }
): void {
  db.prepare(
    `INSERT INTO publications (id, person_id, title, url, year) VALUES (?, ?, ?, ?, ?)`
  ).run(nanoid(), personId, pub.title, pub.url ?? null, pub.year ?? null);
}

export function deletePublication(id: string): void {
  db.prepare(`DELETE FROM publications WHERE id = ?`).run(id);
}
