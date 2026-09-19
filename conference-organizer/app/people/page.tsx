import Link from "next/link";
import { getAllTags, listPeople } from "@/lib/people";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; location?: string }>;
}) {
  const params = await searchParams;
  const people = listPeople({
    q: params.q,
    tag: params.tag,
    locationType: params.location,
  });
  const tags = getAllTags();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            People ({people.length})
          </h1>
          <p className="text-sm text-zinc-500">
            Your repository of professional contacts across all conferences.
          </p>
        </div>
        <Link
          href="/people/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          + Add person
        </Link>
      </div>

      <form className="mb-6 flex flex-wrap gap-3 rounded-lg border border-zinc-200 bg-white p-4">
        <input
          type="text"
          name="q"
          placeholder="Search name, email, affiliation, tag..."
          defaultValue={params.q ?? ""}
          className="min-w-[220px] flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        <select
          name="location"
          defaultValue={params.location ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="">All locations</option>
          <option value="local">Local</option>
          <option value="domestic">Domestic</option>
          <option value="international">International</option>
        </select>
        <select
          name="tag"
          defaultValue={params.tag ?? ""}
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
        {(params.q || params.tag || params.location) && (
          <Link
            href="/people"
            className="rounded-md px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-800"
          >
            Clear
          </Link>
        )}
      </form>

      {people.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">
          No people found. {" "}
          <Link href="/people/new" className="font-medium text-zinc-800 underline">
            Add someone
          </Link>{" "}
          or{" "}
          <Link href="/people/import" className="font-medium text-zinc-800 underline">
            import a spreadsheet
          </Link>
          .
        </div>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
          {people.map((person) => (
            <li key={person.id}>
              <Link
                href={`/people/${person.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-50"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-sm font-semibold text-zinc-600">
                  {person.photoPath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={person.photoPath}
                      alt={person.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    person.name.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {person.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {[person.title, person.affiliation].filter(Boolean).join(" · ") ||
                      person.email}
                  </p>
                </div>
                <span className="flex-shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium capitalize text-zinc-600">
                  {person.locationType}
                </span>
                {person.tags.length > 0 && (
                  <div className="hidden flex-shrink-0 gap-1 sm:flex">
                    {person.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
