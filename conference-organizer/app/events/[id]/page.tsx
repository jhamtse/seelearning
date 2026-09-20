import { notFound } from "next/navigation";
import Link from "next/link";
import { getEvent, getEventDashboard, listEventParticipants, listSessions } from "@/lib/events";
import {
  ATTENDING_STATUS_COLORS,
  ATTENDING_STATUS_LABELS,
  EVENT_TYPE_LABELS,
  LOCATION_TYPE_LABELS,
  formatMoney,
} from "@/lib/format";
import EventForm from "@/components/EventForm";
import StatCard from "@/components/StatCard";
import BarBreakdown from "@/components/BarBreakdown";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import {
  deleteEventAction,
  removeParticipantAction,
  updateEventAction,
  updateParticipantAction,
} from "@/app/events/actions";

const inputClass =
  "rounded-md border border-zinc-300 px-2 py-1 text-xs shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getEvent(id);
  if (!event) notFound();

  const participants = listEventParticipants(id);
  const sessions = listSessions(id);
  const dashboard = getEventDashboard(id);

  const overBudget =
    dashboard.budgetTotal > 0 && dashboard.totalExpense > dashboard.budgetTotal;
  const budgetPct =
    dashboard.budgetTotal > 0
      ? Math.min(100, (dashboard.totalExpense / dashboard.budgetTotal) * 100)
      : 0;

  const updateAction = updateEventAction.bind(null, id);
  const deleteAction = deleteEventAction.bind(null, id);
  const addParticipantAction = removeParticipantAction.bind(null, id);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/events" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← Back to events
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{event.name}</h1>
          <p className="text-sm text-zinc-500">
            {EVENT_TYPE_LABELS[event.eventType]}
            {event.startDate && ` · ${event.startDate}`}
            {event.endDate && event.endDate !== event.startDate && ` – ${event.endDate}`}
            {event.location && ` · ${event.location}`}
          </p>
        </div>
        <Link
          href={`/events/${id}/add-people`}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          + Add people
        </Link>
      </div>

      {/* Dashboard */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Dashboard</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Invited" value={String(participants.length)} />
          <StatCard
            label="Confirmed attending"
            value={String(dashboard.attendingCounts.confirmed)}
            tone="success"
          />
          <StatCard
            label="Presenting: accepted"
            value={String(dashboard.presentingCounts.accepted)}
            sublabel={`${dashboard.presentingCounts.pending} pending, ${dashboard.presentingCounts.declined} declined`}
            tone={dashboard.presentingCounts.pending > 0 ? "warning" : "success"}
          />
          <StatCard
            label="Budget"
            value={formatMoney(dashboard.totalExpense)}
            sublabel={
              dashboard.budgetTotal > 0
                ? `of ${formatMoney(dashboard.budgetTotal)} budgeted`
                : "no budget set"
            }
            tone={overBudget ? "danger" : "default"}
          />
        </div>

        {dashboard.budgetTotal > 0 && (
          <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4">
            <div className="mb-1 flex items-center justify-between text-xs text-zinc-600">
              <span>
                {formatMoney(dashboard.totalExpense)} spent of{" "}
                {formatMoney(dashboard.budgetTotal)}
              </span>
              <span className={overBudget ? "font-semibold text-red-600" : ""}>
                {overBudget
                  ? `${formatMoney(dashboard.totalExpense - dashboard.budgetTotal)} over budget`
                  : `${formatMoney(dashboard.budgetTotal - dashboard.totalExpense)} remaining`}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
              <div
                className={`h-full rounded-full ${overBudget ? "bg-red-500" : "bg-zinc-900"}`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-zinc-800">By region</h3>
            <BarBreakdown
              items={(["local", "domestic", "international"] as const).map((loc) => ({
                label: LOCATION_TYPE_LABELS[loc],
                count: dashboard.locationCounts[loc],
              }))}
            />
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-zinc-800">
              By specialization (top tags)
            </h3>
            {dashboard.topTags.length > 0 ? (
              <BarBreakdown
                items={dashboard.topTags.map((t) => ({
                  label: t.name,
                  count: t.count,
                  colorClass: "bg-blue-400",
                }))}
              />
            ) : (
              <p className="text-sm text-zinc-400">No tags among invited people yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Participants */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Participants ({participants.length})
          </h2>
          <Link
            href={`/events/${id}/add-people`}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            + Add people
          </Link>
        </div>

        {participants.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
            No one added yet.{" "}
            <Link href={`/events/${id}/add-people`} className="font-medium text-zinc-800 underline">
              Add people from your repository
            </Link>
            .
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <div className="min-w-[980px]">
              <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-500">
                <span className="w-48 flex-shrink-0">Person</span>
                <span className="w-28 flex-shrink-0">Attending</span>
                <span className="w-20 flex-shrink-0">Flight</span>
                <span className="w-20 flex-shrink-0">Hotel</span>
                <span className="w-20 flex-shrink-0">Meals</span>
                <span className="w-20 flex-shrink-0">Honorarium</span>
                <span className="w-20 flex-shrink-0 text-right">Total</span>
                <span className="w-28 flex-shrink-0">Meal pref</span>
                <span className="flex-1">Notes</span>
                <span className="w-32 flex-shrink-0"></span>
              </div>
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2 last:border-b-0"
                >
                  <form
                    action={updateParticipantAction.bind(null, id, p.id)}
                    className="flex flex-1 items-center gap-2"
                  >
                    <Link
                      href={`/people/${p.personId}`}
                      className="w-48 flex-shrink-0 truncate text-sm font-medium text-zinc-800 hover:underline"
                      title={p.person.name}
                    >
                      {p.person.name}
                    </Link>
                    <select
                      name="attendingStatus"
                      defaultValue={p.attendingStatus}
                      className={`w-28 flex-shrink-0 ${inputClass}`}
                    >
                      {Object.entries(ATTENDING_STATUS_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0"
                      name="flightCost"
                      defaultValue={p.flightCost}
                      className={`w-20 flex-shrink-0 ${inputClass}`}
                    />
                    <input
                      type="number"
                      min="0"
                      name="hotelCost"
                      defaultValue={p.hotelCost}
                      className={`w-20 flex-shrink-0 ${inputClass}`}
                    />
                    <input
                      type="number"
                      min="0"
                      name="mealsCost"
                      defaultValue={p.mealsCost}
                      className={`w-20 flex-shrink-0 ${inputClass}`}
                    />
                    <input
                      type="number"
                      min="0"
                      name="honorariumCost"
                      defaultValue={p.honorariumCost}
                      className={`w-20 flex-shrink-0 ${inputClass}`}
                    />
                    <span className="w-20 flex-shrink-0 text-right text-sm font-medium text-zinc-700">
                      {formatMoney(p.totalExpense)}
                    </span>
                    <input
                      name="mealPreference"
                      defaultValue={p.mealPreference ?? ""}
                      className={`w-28 flex-shrink-0 ${inputClass}`}
                    />
                    <input
                      name="notes"
                      defaultValue={p.notes ?? ""}
                      className={`flex-1 ${inputClass}`}
                    />
                    <div className="flex w-32 flex-shrink-0 items-center justify-end gap-2">
                      <button
                        type="submit"
                        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium hover:bg-zinc-50"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                  <form action={addParticipantAction.bind(null, p.id)}>
                    <button
                      type="submit"
                      className="text-xs font-medium text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-400">
          <span
            className={`rounded-full px-2 py-0.5 ${ATTENDING_STATUS_COLORS.confirmed}`}
          >
            {dashboard.attendingCounts.confirmed} confirmed
          </span>
          <span
            className={`rounded-full px-2 py-0.5 ${ATTENDING_STATUS_COLORS.invited}`}
          >
            {dashboard.attendingCounts.invited} invited
          </span>
          <span
            className={`rounded-full px-2 py-0.5 ${ATTENDING_STATUS_COLORS.tentative}`}
          >
            {dashboard.attendingCounts.tentative} tentative
          </span>
          <span
            className={`rounded-full px-2 py-0.5 ${ATTENDING_STATUS_COLORS.declined}`}
          >
            {dashboard.attendingCounts.declined} declined
          </span>
        </p>
      </section>

      {/* Sessions */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sessions ({sessions.length})</h2>
          <Link
            href={`/events/${id}/sessions/new`}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            + Add session
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
            No sessions yet.{" "}
            <Link
              href={`/events/${id}/sessions/new`}
              className="font-medium text-zinc-800 underline"
            >
              Add one
            </Link>{" "}
            to start assigning presenters, discussants, and note takers.
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/events/${id}/sessions/${s.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-zinc-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {s.title}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {[s.sessionDate, s.startTime, s.location]
                        .filter(Boolean)
                        .join(" · ") || "No details set"}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-zinc-400">View →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Edit event */}
      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Edit event details</h2>
        <EventForm event={event} action={updateAction} submitLabel="Save changes" />
      </section>

      <section className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="mb-2 text-lg font-semibold text-red-900">Danger zone</h2>
        <p className="mb-4 text-sm text-red-700">
          Deleting this event removes all its participants and sessions
          permanently. It does not delete anyone from your people repository.
        </p>
        <form action={deleteAction}>
          <ConfirmSubmitButton
            confirmMessage={`Delete "${event.name}"? This cannot be undone.`}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete event
          </ConfirmSubmitButton>
        </form>
      </section>
    </div>
  );
}
