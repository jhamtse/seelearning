import EventForm from "@/components/EventForm";
import { createEventAction } from "@/app/events/actions";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">New event</h1>
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <EventForm action={createEventAction} submitLabel="Create event" />
      </div>
    </div>
  );
}
