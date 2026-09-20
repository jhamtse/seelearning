import Link from "next/link";
import { listEvents } from "@/lib/events";
import { EVENT_TYPE_LABELS, formatMoney } from "@/lib/format";

export default function EventsPage() {
  const events = listEvents();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Events ({events.length})
          </h1>
          <p className="text-sm text-zinc-500">
            Conferences and meetings you&apos;re organizing, each drawing invitees
            from your people repository.
          </p>
        </div>
        <Link
          href="/events/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          + New event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">
          No events yet.{" "}
          <Link href="/events/new" className="font-medium text-zinc-800 underline">
            Create your first one
          </Link>
          .
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {events.map((event) => {
            const overBudget =
              event.budgetTotal > 0 && event.totalExpense > event.budgetTotal;
            return (
              <li key={event.id}>
                <Link
                  href={`/events/${event.id}`}
                  className="block rounded-lg border border-zinc-200 bg-white p-5 hover:border-zinc-400"
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-zinc-900">{event.name}</h2>
                    <span className="flex-shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                      {EVENT_TYPE_LABELS[event.eventType]}
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-zinc-500">
                    {[event.startDate, event.location].filter(Boolean).join(" · ") ||
                      "No date set"}
                  </p>
                  <div className="flex items-center justify-between text-xs text-zinc-600">
                    <span>
                      {event.participantCount}{" "}
                      {event.participantCount === 1 ? "person" : "people"} invited
                    </span>
                    <span className={overBudget ? "font-semibold text-red-600" : ""}>
                      {formatMoney(event.totalExpense)}
                      {event.budgetTotal > 0 && ` / ${formatMoney(event.budgetTotal)}`}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
