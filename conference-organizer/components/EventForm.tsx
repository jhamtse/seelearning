import type { EventRecord } from "@/lib/events";
import { EVENT_TYPE_LABELS } from "@/lib/format";

const inputClass =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500";
const labelClass = "block text-sm font-medium text-zinc-700 mb-1";

export default function EventForm({
  event,
  action,
  submitLabel,
}: {
  event?: EventRecord;
  action: (formData: FormData) => void;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="name">
            Event name *
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={event?.name}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="eventType">
            Type
          </label>
          <select
            id="eventType"
            name="eventType"
            defaultValue={event?.eventType ?? "professional"}
            className={inputClass}
          >
            {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="location">
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={event?.location ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="startDate">
            Start date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={event?.startDate ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="endDate">
            End date
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={event?.endDate ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="budgetTotal">
            Total budget (USD)
          </label>
          <input
            id="budgetTotal"
            name="budgetTotal"
            type="number"
            min="0"
            step="1"
            defaultValue={event?.budgetTotal ?? 0}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="description">
            Description / theme
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={event?.description ?? ""}
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
