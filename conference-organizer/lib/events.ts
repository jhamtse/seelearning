import { nanoid } from "nanoid";
import { db } from "./db";
import type { LocationType } from "./people";

export type EventType = "think_tank" | "public" | "professional" | "other";
export type AttendingStatus = "invited" | "confirmed" | "declined" | "tentative";
export type SessionRole =
  | "presenter"
  | "discussant"
  | "note_taker"
  | "moderator"
  | "attendee";
export type SessionStatus = "pending" | "accepted" | "declined";

export type EventRecord = {
  id: string;
  name: string;
  description: string | null;
  eventType: EventType;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
  budgetTotal: number;
  createdAt: string;
  updatedAt: string;
};

export type EventInput = {
  name: string;
  description?: string | null;
  eventType: EventType;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  budgetTotal: number;
};

export type EventSummary = EventRecord & {
  participantCount: number;
  totalExpense: number;
};

export type PersonSummary = {
  id: string;
  name: string;
  photoPath: string | null;
  affiliation: string | null;
  locationType: LocationType;
  tags: string[];
};

export type EventParticipant = {
  id: string;
  eventId: string;
  personId: string;
  attendingStatus: AttendingStatus;
  mealPreference: string | null;
  flightCost: number;
  hotelCost: number;
  mealsCost: number;
  honorariumCost: number;
  totalExpense: number;
  notes: string | null;
  person: PersonSummary;
};

export type EventParticipantInput = {
  attendingStatus: AttendingStatus;
  mealPreference?: string | null;
  flightCost: number;
  hotelCost: number;
  mealsCost: number;
  honorariumCost: number;
  notes?: string | null;
};

export type SessionRecord = {
  id: string;
  eventId: string;
  title: string;
  description: string | null;
  sessionDate: string | null;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
};

export type SessionInput = {
  title: string;
  description?: string | null;
  sessionDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
};

export type SessionParticipant = {
  id: string;
  sessionId: string;
  personId: string;
  role: SessionRole;
  status: SessionStatus;
  notes: string | null;
  person: PersonSummary;
};

function getPersonSummary(personId: string): PersonSummary {
  const row = db
    .prepare(
      `SELECT id, name, photo_path, affiliation, location_type FROM people WHERE id = ?`
    )
    .get(personId) as
    | {
        id: string;
        name: string;
        photo_path: string | null;
        affiliation: string | null;
        location_type: LocationType;
      }
    | undefined;
  if (!row) {
    return {
      id: personId,
      name: "(removed person)",
      photoPath: null,
      affiliation: null,
      locationType: "domestic",
      tags: [],
    };
  }
  const tags = (
    db
      .prepare(
        `SELECT t.name FROM tags t
         JOIN person_tags pt ON pt.tag_id = t.id
         WHERE pt.person_id = ?
         ORDER BY t.name COLLATE NOCASE`
      )
      .all(personId) as { name: string }[]
  ).map((r) => r.name);
  return {
    id: row.id,
    name: row.name,
    photoPath: row.photo_path,
    affiliation: row.affiliation,
    locationType: row.location_type,
    tags,
  };
}

function rowToEvent(row: {
  id: string;
  name: string;
  description: string | null;
  event_type: EventType;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  budget_total: number;
  created_at: string;
  updated_at: string;
}): EventRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    eventType: row.event_type,
    startDate: row.start_date,
    endDate: row.end_date,
    location: row.location,
    budgetTotal: row.budget_total,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listEvents(): EventSummary[] {
  const rows = db
    .prepare(`SELECT * FROM events ORDER BY start_date IS NULL, start_date, name COLLATE NOCASE`)
    .all() as Parameters<typeof rowToEvent>[0][];

  return rows.map((row) => {
    const event = rowToEvent(row);
    const { count } = db
      .prepare(`SELECT COUNT(*) as count FROM event_participants WHERE event_id = ?`)
      .get(event.id) as { count: number };
    const { total } = db
      .prepare(
        `SELECT COALESCE(SUM(flight_cost + hotel_cost + meals_cost + honorarium_cost), 0) as total
         FROM event_participants WHERE event_id = ?`
      )
      .get(event.id) as { total: number };
    return { ...event, participantCount: count, totalExpense: total };
  });
}

export function getEvent(id: string): EventRecord | undefined {
  const row = db.prepare(`SELECT * FROM events WHERE id = ?`).get(id) as
    | Parameters<typeof rowToEvent>[0]
    | undefined;
  return row ? rowToEvent(row) : undefined;
}

export function createEvent(input: EventInput): string {
  const id = nanoid();
  db.prepare(
    `INSERT INTO events (id, name, description, event_type, start_date, end_date, location, budget_total)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.name,
    input.description ?? null,
    input.eventType,
    input.startDate ?? null,
    input.endDate ?? null,
    input.location ?? null,
    input.budgetTotal
  );
  return id;
}

export function updateEvent(id: string, input: EventInput): void {
  db.prepare(
    `UPDATE events SET
       name = ?, description = ?, event_type = ?, start_date = ?, end_date = ?,
       location = ?, budget_total = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    input.name,
    input.description ?? null,
    input.eventType,
    input.startDate ?? null,
    input.endDate ?? null,
    input.location ?? null,
    input.budgetTotal,
    id
  );
}

export function deleteEvent(id: string): void {
  db.prepare(`DELETE FROM events WHERE id = ?`).run(id);
}

function rowToEventParticipant(row: {
  id: string;
  event_id: string;
  person_id: string;
  attending_status: AttendingStatus;
  meal_preference: string | null;
  flight_cost: number;
  hotel_cost: number;
  meals_cost: number;
  honorarium_cost: number;
  notes: string | null;
}): EventParticipant {
  const totalExpense =
    row.flight_cost + row.hotel_cost + row.meals_cost + row.honorarium_cost;
  return {
    id: row.id,
    eventId: row.event_id,
    personId: row.person_id,
    attendingStatus: row.attending_status,
    mealPreference: row.meal_preference,
    flightCost: row.flight_cost,
    hotelCost: row.hotel_cost,
    mealsCost: row.meals_cost,
    honorariumCost: row.honorarium_cost,
    totalExpense,
    notes: row.notes,
    person: getPersonSummary(row.person_id),
  };
}

export function listEventParticipants(eventId: string): EventParticipant[] {
  const rows = db
    .prepare(`SELECT * FROM event_participants WHERE event_id = ?`)
    .all(eventId) as Parameters<typeof rowToEventParticipant>[0][];
  const participants = rows.map(rowToEventParticipant);
  participants.sort((a, b) => a.person.name.localeCompare(b.person.name));
  return participants;
}

export function getEventParticipant(id: string): EventParticipant | undefined {
  const row = db.prepare(`SELECT * FROM event_participants WHERE id = ?`).get(id) as
    | Parameters<typeof rowToEventParticipant>[0]
    | undefined;
  return row ? rowToEventParticipant(row) : undefined;
}

export function addEventParticipants(eventId: string, personIds: string[]): void {
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO event_participants (id, event_id, person_id) VALUES (?, ?, ?)`
  );
  for (const personId of personIds) {
    stmt.run(nanoid(), eventId, personId);
  }
}

export function updateEventParticipant(
  id: string,
  input: EventParticipantInput
): void {
  db.prepare(
    `UPDATE event_participants SET
       attending_status = ?, meal_preference = ?, flight_cost = ?, hotel_cost = ?,
       meals_cost = ?, honorarium_cost = ?, notes = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    input.attendingStatus,
    input.mealPreference ?? null,
    input.flightCost,
    input.hotelCost,
    input.mealsCost,
    input.honorariumCost,
    input.notes ?? null,
    id
  );
}

export function removeEventParticipant(id: string): void {
  const row = db
    .prepare(`SELECT event_id, person_id FROM event_participants WHERE id = ?`)
    .get(id) as { event_id: string; person_id: string } | undefined;
  if (!row) return;
  db.prepare(
    `DELETE FROM session_participants
     WHERE person_id = ? AND session_id IN (SELECT id FROM sessions WHERE event_id = ?)`
  ).run(row.person_id, row.event_id);
  db.prepare(`DELETE FROM event_participants WHERE id = ?`).run(id);
}

function rowToSession(row: {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  session_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
}): SessionRecord {
  return {
    id: row.id,
    eventId: row.event_id,
    title: row.title,
    description: row.description,
    sessionDate: row.session_date,
    startTime: row.start_time,
    endTime: row.end_time,
    location: row.location,
  };
}

export function listSessions(eventId: string): SessionRecord[] {
  const rows = db
    .prepare(
      `SELECT * FROM sessions WHERE event_id = ?
       ORDER BY session_date IS NULL, session_date, start_time IS NULL, start_time`
    )
    .all(eventId) as Parameters<typeof rowToSession>[0][];
  return rows.map(rowToSession);
}

export function getSession(id: string): SessionRecord | undefined {
  const row = db.prepare(`SELECT * FROM sessions WHERE id = ?`).get(id) as
    | Parameters<typeof rowToSession>[0]
    | undefined;
  return row ? rowToSession(row) : undefined;
}

export function createSession(eventId: string, input: SessionInput): string {
  const id = nanoid();
  db.prepare(
    `INSERT INTO sessions (id, event_id, title, description, session_date, start_time, end_time, location)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    eventId,
    input.title,
    input.description ?? null,
    input.sessionDate ?? null,
    input.startTime ?? null,
    input.endTime ?? null,
    input.location ?? null
  );
  return id;
}

export function updateSession(id: string, input: SessionInput): void {
  db.prepare(
    `UPDATE sessions SET title = ?, description = ?, session_date = ?, start_time = ?,
       end_time = ?, location = ? WHERE id = ?`
  ).run(
    input.title,
    input.description ?? null,
    input.sessionDate ?? null,
    input.startTime ?? null,
    input.endTime ?? null,
    input.location ?? null,
    id
  );
}

export function deleteSession(id: string): void {
  db.prepare(`DELETE FROM sessions WHERE id = ?`).run(id);
}

function rowToSessionParticipant(row: {
  id: string;
  session_id: string;
  person_id: string;
  role: SessionRole;
  status: SessionStatus;
  notes: string | null;
}): SessionParticipant {
  return {
    id: row.id,
    sessionId: row.session_id,
    personId: row.person_id,
    role: row.role,
    status: row.status,
    notes: row.notes,
    person: getPersonSummary(row.person_id),
  };
}

export function listSessionParticipants(sessionId: string): SessionParticipant[] {
  const rows = db
    .prepare(`SELECT * FROM session_participants WHERE session_id = ?`)
    .all(sessionId) as Parameters<typeof rowToSessionParticipant>[0][];
  const participants = rows.map(rowToSessionParticipant);
  participants.sort((a, b) => a.person.name.localeCompare(b.person.name));
  return participants;
}

export function addSessionParticipant(
  sessionId: string,
  personId: string,
  role: SessionRole
): void {
  db.prepare(
    `INSERT OR IGNORE INTO session_participants (id, session_id, person_id, role)
     VALUES (?, ?, ?, ?)`
  ).run(nanoid(), sessionId, personId, role);
}

export function updateSessionParticipant(
  id: string,
  input: { role: SessionRole; status: SessionStatus; notes?: string | null }
): void {
  db.prepare(
    `UPDATE session_participants SET role = ?, status = ?, notes = ? WHERE id = ?`
  ).run(input.role, input.status, input.notes ?? null, id);
}

export function removeSessionParticipant(id: string): void {
  db.prepare(`DELETE FROM session_participants WHERE id = ?`).run(id);
}

export type EventDashboard = {
  budgetTotal: number;
  totalExpense: number;
  attendingCounts: Record<AttendingStatus, number>;
  presentingCounts: Record<SessionStatus, number>;
  locationCounts: Record<LocationType, number>;
  topTags: { name: string; count: number }[];
  sessionCount: number;
};

export function getEventDashboard(eventId: string): EventDashboard {
  const event = getEvent(eventId);
  const participants = listEventParticipants(eventId);

  const attendingCounts: Record<AttendingStatus, number> = {
    invited: 0,
    confirmed: 0,
    declined: 0,
    tentative: 0,
  };
  const locationCounts: Record<LocationType, number> = {
    local: 0,
    domestic: 0,
    international: 0,
  };
  const tagCounts = new Map<string, number>();
  let totalExpense = 0;

  for (const p of participants) {
    attendingCounts[p.attendingStatus]++;
    locationCounts[p.person.locationType]++;
    totalExpense += p.totalExpense;
    for (const tag of p.person.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  const topTags = [...tagCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 8);

  const presentingRows = db
    .prepare(
      `SELECT sp.status as status, COUNT(*) as count
       FROM session_participants sp
       JOIN sessions s ON s.id = sp.session_id
       WHERE s.event_id = ? AND sp.role IN ('presenter', 'discussant')
       GROUP BY sp.status`
    )
    .all(eventId) as { status: SessionStatus; count: number }[];
  const presentingCounts: Record<SessionStatus, number> = {
    pending: 0,
    accepted: 0,
    declined: 0,
  };
  for (const row of presentingRows) {
    presentingCounts[row.status] = row.count;
  }

  const { count: sessionCount } = db
    .prepare(`SELECT COUNT(*) as count FROM sessions WHERE event_id = ?`)
    .get(eventId) as { count: number };

  return {
    budgetTotal: event?.budgetTotal ?? 0,
    totalExpense,
    attendingCounts,
    presentingCounts,
    locationCounts,
    topTags,
    sessionCount,
  };
}
