"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addEventParticipants,
  addSessionParticipant,
  createEvent,
  createSession,
  deleteEvent,
  deleteSession,
  removeEventParticipant,
  removeSessionParticipant,
  updateEvent,
  updateEventParticipant,
  updateSession,
  updateSessionParticipant,
  type AttendingStatus,
  type EventInput,
  type EventType,
  type SessionInput,
  type SessionRole,
  type SessionStatus,
} from "@/lib/events";

const EVENT_TYPES: EventType[] = ["think_tank", "public", "professional", "other"];
const ATTENDING_STATUSES: AttendingStatus[] = [
  "invited",
  "confirmed",
  "declined",
  "tentative",
];
const SESSION_ROLES: SessionRole[] = [
  "presenter",
  "discussant",
  "note_taker",
  "moderator",
  "attendee",
];
const SESSION_STATUSES: SessionStatus[] = ["pending", "accepted", "declined"];

function num(formData: FormData, key: string): number {
  const raw = formData.get(key);
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function readEventForm(formData: FormData): EventInput {
  const eventType = formData.get("eventType");
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: (formData.get("description") as string) || null,
    eventType: EVENT_TYPES.includes(eventType as EventType)
      ? (eventType as EventType)
      : "professional",
    startDate: (formData.get("startDate") as string) || null,
    endDate: (formData.get("endDate") as string) || null,
    location: (formData.get("location") as string) || null,
    budgetTotal: num(formData, "budgetTotal"),
  };
}

export async function createEventAction(formData: FormData) {
  const input = readEventForm(formData);
  if (!input.name) throw new Error("Event name is required");
  const id = createEvent(input);
  revalidatePath("/events");
  redirect(`/events/${id}`);
}

export async function updateEventAction(id: string, formData: FormData) {
  const input = readEventForm(formData);
  if (!input.name) throw new Error("Event name is required");
  updateEvent(id, input);
  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  redirect(`/events/${id}`);
}

export async function deleteEventAction(id: string) {
  deleteEvent(id);
  revalidatePath("/events");
  redirect("/events");
}

export async function addParticipantsAction(eventId: string, formData: FormData) {
  const personIds = formData.getAll("personId").map(String);
  if (personIds.length > 0) {
    addEventParticipants(eventId, personIds);
  }
  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}`);
}

export async function updateParticipantAction(
  eventId: string,
  participantId: string,
  formData: FormData
) {
  const attendingStatus = formData.get("attendingStatus");
  updateEventParticipant(participantId, {
    attendingStatus: ATTENDING_STATUSES.includes(attendingStatus as AttendingStatus)
      ? (attendingStatus as AttendingStatus)
      : "invited",
    mealPreference: (formData.get("mealPreference") as string) || null,
    flightCost: num(formData, "flightCost"),
    hotelCost: num(formData, "hotelCost"),
    mealsCost: num(formData, "mealsCost"),
    honorariumCost: num(formData, "honorariumCost"),
    notes: (formData.get("notes") as string) || null,
  });
  revalidatePath(`/events/${eventId}`);
}

export async function removeParticipantAction(eventId: string, participantId: string) {
  removeEventParticipant(participantId);
  revalidatePath(`/events/${eventId}`);
}

function readSessionForm(formData: FormData): SessionInput {
  return {
    title: String(formData.get("title") ?? "").trim(),
    description: (formData.get("description") as string) || null,
    sessionDate: (formData.get("sessionDate") as string) || null,
    startTime: (formData.get("startTime") as string) || null,
    endTime: (formData.get("endTime") as string) || null,
    location: (formData.get("location") as string) || null,
  };
}

export async function createSessionAction(eventId: string, formData: FormData) {
  const input = readSessionForm(formData);
  if (!input.title) throw new Error("Session title is required");
  const id = createSession(eventId, input);
  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}/sessions/${id}`);
}

export async function updateSessionAction(
  eventId: string,
  sessionId: string,
  formData: FormData
) {
  const input = readSessionForm(formData);
  if (!input.title) throw new Error("Session title is required");
  updateSession(sessionId, input);
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/sessions/${sessionId}`);
}

export async function deleteSessionAction(eventId: string, sessionId: string) {
  deleteSession(sessionId);
  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}`);
}

export async function addSessionParticipantAction(
  eventId: string,
  sessionId: string,
  formData: FormData
) {
  const personId = String(formData.get("personId") ?? "");
  const role = formData.get("role");
  if (personId) {
    addSessionParticipant(
      sessionId,
      personId,
      SESSION_ROLES.includes(role as SessionRole) ? (role as SessionRole) : "attendee"
    );
  }
  revalidatePath(`/events/${eventId}/sessions/${sessionId}`);
  revalidatePath(`/events/${eventId}`);
}

export async function updateSessionParticipantAction(
  eventId: string,
  sessionId: string,
  participantId: string,
  formData: FormData
) {
  const role = formData.get("role");
  const status = formData.get("status");
  updateSessionParticipant(participantId, {
    role: SESSION_ROLES.includes(role as SessionRole)
      ? (role as SessionRole)
      : "attendee",
    status: SESSION_STATUSES.includes(status as SessionStatus)
      ? (status as SessionStatus)
      : "pending",
    notes: (formData.get("notes") as string) || null,
  });
  revalidatePath(`/events/${eventId}/sessions/${sessionId}`);
  revalidatePath(`/events/${eventId}`);
}

export async function removeSessionParticipantAction(
  eventId: string,
  sessionId: string,
  participantId: string
) {
  removeSessionParticipant(participantId);
  revalidatePath(`/events/${eventId}/sessions/${sessionId}`);
  revalidatePath(`/events/${eventId}`);
}
