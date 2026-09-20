import { notFound } from "next/navigation";
import Link from "next/link";
import { getEvent } from "@/lib/events";
import SessionForm from "@/components/SessionForm";
import { createSessionAction } from "@/app/events/actions";

export default async function NewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getEvent(id);
  if (!event) notFound();

  const action = createSessionAction.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/events/${id}`}
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Back to {event.name}
        </Link>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Add a session</h1>
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <SessionForm action={action} submitLabel="Add session" />
      </div>
    </div>
  );
}
