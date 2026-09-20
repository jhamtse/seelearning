import type { AttendingStatus, EventType, SessionRole, SessionStatus } from "./events";

export function formatMoney(n: number): string {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  think_tank: "Think tank / small meeting",
  public: "Public event",
  professional: "Professional event",
  other: "Other",
};

export const ATTENDING_STATUS_LABELS: Record<AttendingStatus, string> = {
  invited: "Invited",
  confirmed: "Confirmed",
  declined: "Declined",
  tentative: "Tentative",
};

export const ATTENDING_STATUS_COLORS: Record<AttendingStatus, string> = {
  invited: "bg-amber-50 text-amber-700",
  confirmed: "bg-green-50 text-green-700",
  declined: "bg-red-50 text-red-700",
  tentative: "bg-blue-50 text-blue-700",
};

export const SESSION_ROLE_LABELS: Record<SessionRole, string> = {
  presenter: "Presenter",
  discussant: "Discussant",
  note_taker: "Note taker",
  moderator: "Moderator",
  attendee: "Attendee",
};

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
};

export const SESSION_STATUS_COLORS: Record<SessionStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-green-50 text-green-700",
  declined: "bg-red-50 text-red-700",
};

export const LOCATION_TYPE_LABELS: Record<string, string> = {
  local: "Local",
  domestic: "Domestic",
  international: "International",
};
