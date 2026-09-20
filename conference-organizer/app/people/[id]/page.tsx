import { notFound } from "next/navigation";
import Link from "next/link";
import PersonForm from "@/components/PersonForm";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { getPerson } from "@/lib/people";
import {
  addPublicationAction,
  deletePersonAction,
  deletePublicationAction,
  updatePersonAction,
} from "@/app/people/actions";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getPerson(id);
  if (!person) notFound();

  const updateAction = updatePersonAction.bind(null, id);
  const deleteAction = deletePersonAction.bind(null, id);
  const addPubAction = addPublicationAction.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/people" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← Back to people
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xl font-semibold text-zinc-600">
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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{person.name}</h1>
          <p className="text-sm text-zinc-500">
            {[person.title, person.affiliation].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Edit details</h2>
        <PersonForm person={person} action={updateAction} submitLabel="Save changes" />
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Publications</h2>
        {person.publications.length > 0 ? (
          <ul className="mb-4 space-y-2">
            {person.publications.map((pub) => (
              <li
                key={pub.id}
                className="flex items-center justify-between gap-3 rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-800">
                    {pub.title}
                    {pub.year ? ` (${pub.year})` : ""}
                  </p>
                  {pub.url && (
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-xs text-blue-600 hover:underline"
                    >
                      {pub.url}
                    </a>
                  )}
                </div>
                <form action={deletePublicationAction.bind(null, id, pub.id)}>
                  <button
                    type="submit"
                    className="flex-shrink-0 text-xs font-medium text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-zinc-500">No publications added yet.</p>
        )}

        <form action={addPubAction} className="flex flex-wrap gap-2">
          <input
            name="pubTitle"
            placeholder="Title"
            required
            className="min-w-[160px] flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="pubYear"
            placeholder="Year"
            className="w-20 rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="pubUrl"
            placeholder="Link (optional)"
            className="min-w-[160px] flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Add
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="mb-2 text-lg font-semibold text-red-900">Danger zone</h2>
        <p className="mb-4 text-sm text-red-700">
          Removing this person deletes their profile, tags, and publications
          permanently.
        </p>
        <form action={deleteAction}>
          <ConfirmSubmitButton
            confirmMessage={`Remove ${person.name} from your people repository? This cannot be undone.`}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete person
          </ConfirmSubmitButton>
        </form>
      </section>
    </div>
  );
}
