import { notFound } from "next/navigation";
import Link from "next/link";
import { getEvent, listEventParticipants } from "@/lib/events";
import { getAllTags, listPeople } from "@/lib/people";
import { addParticipantsAction } from "@/app/events/actions";

export default async function AddPeoplePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; tag?: string; location?: string }>;
}) {
  const { id } = await params;
  const event = getEvent(id);
  if (!event) notFound();

  const sp = await searchParams;
  const alreadyAdded = new Set(
    listEventParticipants(id).map((p) => p.personId)
  );
  const people = listPeople({
    q: sp.q,
    tag: sp.tag,
    locationType: sp.location,
  }).filter((p) => !alreadyAdded.has(p.id));
  const tags = getAllTags();

  const action = addParticipantsAction.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/events/${id}`}
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Back to {event.name}
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Add people to {event.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Pick from your people repository. Already-added people aren&apos;t shown.
        </p>
      </div>

      <form className="flex flex-wrap gap-3 rounded-lg border border-zinc-200 bg-white p-4">
        <input
          type="text"
          name="q"
          placeholder="Search name, email, affiliation, tag..."
          defaultValue={sp.q ?? ""}
          className="min-w-[220px] flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        <select
          name="location"
          defaultValue={sp.location ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="">All locations</option>
          <option value="local">Local</option>
          <option value="domestic">Domestic</option>
          <option value="international">International</option>
        </select>
        <select
          name="tag"
          defaultValue={sp.tag ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="">All tags</option>
          {tags.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name} ({t.count})
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          Filter
        </button>
      </form>

      {people.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
          {alreadyAdded.size > 0
            ? "No more matching people to add — everyone matching this filter is already in the event."
            : "No people in your repository yet."}{" "}
          <Link href="/people/new" className="font-medium text-zinc-800 underline">
            Add someone new
          </Link>
          .
        </div>
      ) : (
        <form action={action} className="space-y-4">
          <div className="max-h-[28rem] overflow-y-auto rounded-lg border border-zinc-200 bg-white">
            {people.map((person) => (
              <label
                key={person.id}
                className="flex cursor-pointer items-center gap-3 border-b border-zinc-100 px-4 py-2.5 last:border-b-0 hover:bg-zinc-50"
              >
                <input
                  type="checkbox"
                  name="personId"
                  value={person.id}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {person.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {[person.title, person.affiliation].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="flex-shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium capitalize text-zinc-600">
                  {person.locationType}
                </span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            Add selected people
          </button>
        </form>
      )}
    </div>
  );
}
