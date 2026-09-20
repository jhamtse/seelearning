import { nanoid } from "nanoid";
import { ensureSchema, pool } from "./db";

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
  created_at: Date;
  updated_at: Date;
};

async function rowToPerson(row: PersonRow): Promise<Person> {
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
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    tags: await getTagsForPerson(row.id),
    publications: await getPublicationsForPerson(row.id),
  };
}

async function getTagsForPerson(personId: string): Promise<string[]> {
  const { rows } = await pool.query<{ name: string }>(
    `SELECT t.name FROM tags t
     JOIN person_tags pt ON pt.tag_id = t.id
     WHERE pt.person_id = $1
     ORDER BY t.name`,
    [personId]
  );
  return rows.map((r) => r.name);
}

async function getPublicationsForPerson(personId: string): Promise<Publication[]> {
  const { rows } = await pool.query<{
    id: string;
    personid: string;
    title: string;
    url: string | null;
    year: string | null;
  }>(
    `SELECT id, person_id as personId, title, url, year FROM publications
     WHERE person_id = $1 ORDER BY year DESC NULLS LAST, created_at DESC`,
    [personId]
  );
  return rows.map((r) => ({
    id: r.id,
    personId: r.personid,
    title: r.title,
    url: r.url,
    year: r.year,
  }));
}

async function upsertTag(name: string): Promise<string> {
  const trimmed = name.trim();
  const id = nanoid();
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO tags (id, name) VALUES ($1, $2)
     ON CONFLICT (lower(name)) DO UPDATE SET name = tags.name
     RETURNING id`,
    [id, trimmed]
  );
  return rows[0].id;
}

async function setPersonTags(personId: string, tagNames: string[]): Promise<void> {
  await pool.query(`DELETE FROM person_tags WHERE person_id = $1`, [personId]);
  const uniqueNames = [...new Set(tagNames.map((t) => t.trim()).filter(Boolean))];
  for (const name of uniqueNames) {
    const tagId = await upsertTag(name);
    await pool.query(
      `INSERT INTO person_tags (person_id, tag_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [personId, tagId]
    );
  }
  await pool.query(
    `DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag_id FROM person_tags)`
  );
}

export async function listPeople(filter: {
  q?: string;
  tag?: string;
  locationType?: string;
} = {}): Promise<Person[]> {
  await ensureSchema();

  let idSet: Set<string> | null = null;
  if (filter.tag) {
    const { rows } = await pool.query<{ id: string }>(
      `SELECT DISTINCT p.id FROM people p
       JOIN person_tags pt ON pt.person_id = p.id
       JOIN tags t ON t.id = pt.tag_id
       WHERE lower(t.name) = lower($1)`,
      [filter.tag]
    );
    idSet = new Set(rows.map((r) => r.id));
  }

  const conditions: string[] = [];
  const params: string[] = [];
  if (filter.locationType) {
    params.push(filter.locationType);
    conditions.push(`location_type = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await pool.query<PersonRow>(
    `SELECT * FROM people ${where} ORDER BY name`,
    params
  );

  const filteredRows = idSet ? rows.filter((r) => idSet!.has(r.id)) : rows;

  let people = await Promise.all(filteredRows.map(rowToPerson));

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

export async function getPerson(id: string): Promise<Person | undefined> {
  await ensureSchema();
  const { rows } = await pool.query<PersonRow>(
    `SELECT * FROM people WHERE id = $1`,
    [id]
  );
  if (rows.length === 0) return undefined;
  return rowToPerson(rows[0]);
}

export async function createPerson(input: PersonInput): Promise<string> {
  await ensureSchema();
  const id = nanoid();
  await pool.query(
    `INSERT INTO people (id, name, email, phone, affiliation, title, location_type, bio, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      id,
      input.name,
      input.email ?? null,
      input.phone ?? null,
      input.affiliation ?? null,
      input.title ?? null,
      input.locationType,
      input.bio ?? null,
      input.notes ?? null,
    ]
  );
  await setPersonTags(id, input.tags);
  return id;
}

export async function updatePerson(id: string, input: PersonInput): Promise<void> {
  await ensureSchema();
  await pool.query(
    `UPDATE people SET
       name = $2,
       email = $3,
       phone = $4,
       affiliation = $5,
       title = $6,
       location_type = $7,
       bio = $8,
       notes = $9,
       updated_at = now()
     WHERE id = $1`,
    [
      id,
      input.name,
      input.email ?? null,
      input.phone ?? null,
      input.affiliation ?? null,
      input.title ?? null,
      input.locationType,
      input.bio ?? null,
      input.notes ?? null,
    ]
  );
  await setPersonTags(id, input.tags);
}

export async function deletePerson(id: string): Promise<void> {
  await ensureSchema();
  await pool.query(`DELETE FROM people WHERE id = $1`, [id]);
  await pool.query(
    `DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag_id FROM person_tags)`
  );
}

export async function setPersonPhoto(
  id: string,
  photoPath: string | null
): Promise<void> {
  await ensureSchema();
  await pool.query(
    `UPDATE people SET photo_path = $2, updated_at = now() WHERE id = $1`,
    [id, photoPath]
  );
}

export async function getAllTags(): Promise<{ name: string; count: number }[]> {
  await ensureSchema();
  const { rows } = await pool.query<{ name: string; count: string }>(
    `SELECT t.name as name, COUNT(pt.person_id) as count
     FROM tags t
     LEFT JOIN person_tags pt ON pt.tag_id = t.id
     GROUP BY t.id, t.name
     ORDER BY t.name`
  );
  return rows.map((r) => ({ name: r.name, count: Number(r.count) }));
}

export async function addPublication(
  personId: string,
  pub: { title: string; url?: string | null; year?: string | null }
): Promise<void> {
  await ensureSchema();
  await pool.query(
    `INSERT INTO publications (id, person_id, title, url, year) VALUES ($1, $2, $3, $4, $5)`,
    [nanoid(), personId, pub.title, pub.url ?? null, pub.year ?? null]
  );
}

export async function deletePublication(id: string): Promise<void> {
  await ensureSchema();
  await pool.query(`DELETE FROM publications WHERE id = $1`, [id]);
}
