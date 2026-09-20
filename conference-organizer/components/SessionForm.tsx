import type { SessionRecord } from "@/lib/events";

const inputClass =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500";
const labelClass = "block text-sm font-medium text-zinc-700 mb-1";

export default function SessionForm({
  session,
  action,
  submitLabel,
}: {
  session?: SessionRecord;
  action: (formData: FormData) => void;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="title">
            Session title *
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={session?.title}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="sessionDate">
            Date
          </label>
          <input
            id="sessionDate"
            name="sessionDate"
            type="date"
            defaultValue={session?.sessionDate ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="location">
            Room / location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={session?.location ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="startTime">
            Start time
          </label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            defaultValue={session?.startTime ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="endTime">
            End time
          </label>
          <input
            id="endTime"
            name="endTime"
            type="time"
            defaultValue={session?.endTime ?? ""}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={session?.description ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
      >
        {submitLabel}
      </button>
    </form>
  );
}
