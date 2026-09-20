import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getEvent,
  getSession,
  listEventParticipants,
  listSessionParticipants,
} from "@/lib/events";
import {
  SESSION_ROLE_LABELS,
  SESSION_STATUS_COLORS,
  SESSION_STATUS_LABELS,
} from "@/lib/format";
import SessionForm from "@/components/SessionForm";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import {
  addSessionParticipantAction,
  deleteSessionAction,
  removeSessionParticipantAction,
  updateSessionAction,
  updateSessionParticipantAction,
} from "@/app/events/actions";

const selectClass =
  "rounded-md border border-zinc-300 px-2 py-1 text-xs shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id, sessionId } = await params;
  const event = getEvent(id);
  const session = getSession(sessionId);
  if (!event || !session || session.eventId !== id) notFound();

  const sessionParticipants = listSessionParticipants(sessionId);
  const assignedIds = new Set(sessionParticipants.map((sp) => sp.personId));
  const availablePeople = listEventParticipants(id).filter(
    (p) => !assignedIds.has(p.personId)
  );

  const updateSession_ = updateSessionAction.bind(null, id, sessionId);
  const deleteSession_ = deleteSessionAction.bind(null, id, sessionId);
  const addParticipant = addSessionParticipantAction.bind(null, id, sessionId);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href={`/events/${id}`} className="text-sm text-zinc-500 hover:text-zinc-800">
          ← Back to {event.name}
        </Link>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">{session.title}</h1>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Assigned people ({sessionParticipants.length})
        </h2>
        {sessionParticipants.length > 0 ? (
          <ul className="mb-4 space-y-2">
            {sessionParticipants.map((sp) => (
              <li
                key={sp.id}
                className="rounded-md border border-zinc-200 bg-white px-3 py-2.5"
              >
                <form
                  action={updateSessionParticipantAction.bind(null, id, sessionId, sp.id)}
                  className="flex flex-wrap items-center gap-2"
                >
                  <Link
                    href={`/people/${sp.personId}`}
                    className="min-w-[140px] flex-1 truncate text-sm font-medium text-zinc-800 hover:underline"
                  >
                    {sp.person.name}
                  </Link>
                  <select name="role" defaultValue={sp.role} className={selectClass}>
                    {Object.entries(SESSION_ROLE_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <select name="status" defaultValue={sp.status} className={selectClass}>
                    {Object.entries(SESSION_STATUS_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${SESSION_STATUS_COLORS[sp.status]}`}
                  >
                    {SESSION_STATUS_LABELS[sp.status]}
                  </span>
                  <input
                    name="notes"
                    placeholder="Notes"
                    defaultValue={sp.notes ?? ""}
                    className={`min-w-[100px] flex-1 ${selectClass}`}
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium hover:bg-zinc-50"
                  >
                    Save
                  </button>
                </form>
                <form
                  action={removeSessionParticipantAction.bind(null, id, sessionId, sp.id)}
                  className="mt-1"
                >
                  <button
                    type="submit"
                    className="text-xs font-medium text-red-600 hover:text-red-800"
                  >
                    Remove from session
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-zinc-500">No one assigned yet.</p>
        )}

        {availablePeople.length > 0 ? (
          <form
            action={addParticipant}
            className="flex flex-wrap items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-3"
          >
            <select name="personId" required className={selectClass} defaultValue="">
              <option value="" disabled>
                Choose a person...
              </option>
              {availablePeople.map((p) => (
                <option key={p.personId} value={p.personId}>
                  {p.person.name}
                </option>
              ))}
            </select>
            <select name="role" defaultValue="presenter" className={selectClass}>
              {Object.entries(SESSION_ROLE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs font-medium hover:bg-zinc-100"
            >
              Assign
            </button>
          </form>
        ) : (
          <p className="text-xs text-zinc-400">
            Everyone invited to this event is already assigned to this session. Add
            more people to the event to assign them here.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Edit session</h2>
        <SessionForm session={session} action={updateSession_} submitLabel="Save changes" />
      </section>

      <section className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="mb-2 text-lg font-semibold text-red-900">Danger zone</h2>
        <form action={deleteSession_}>
          <ConfirmSubmitButton
            confirmMessage={`Delete session "${session.title}"? This cannot be undone.`}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete session
          </ConfirmSubmitButton>
        </form>
      </section>
    </div>
  );
}
