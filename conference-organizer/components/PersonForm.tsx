import type { Person } from "@/lib/people";

const LOCATION_OPTIONS: { value: string; label: string }[] = [
  { value: "local", label: "Local" },
  { value: "domestic", label: "Domestic" },
  { value: "international", label: "International" },
];

const inputClass =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500";
const labelClass = "block text-sm font-medium text-zinc-700 mb-1";

export default function PersonForm({
  person,
  action,
  submitLabel,
}: {
  person?: Person;
  action: (formData: FormData) => void;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-6" encType="multipart/form-data">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="name">
            Full name *
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={person?.name}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={person?.email ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={person?.phone ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="affiliation">
            Affiliation / Institution
          </label>
          <input
            id="affiliation"
            name="affiliation"
            defaultValue={person?.affiliation ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="title">
            Title / Role
          </label>
          <input
            id="title"
            name="title"
            defaultValue={person?.title ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="locationType">
            Location
          </label>
          <select
            id="locationType"
            name="locationType"
            defaultValue={person?.locationType ?? "domestic"}
            className={inputClass}
          >
            {LOCATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="tags">
            Tags / field of expertise
          </label>
          <input
            id="tags"
            name="tags"
            placeholder="e.g. neuroscience, education, keynote speaker"
            defaultValue={person?.tags.join(", ") ?? ""}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-zinc-500">Comma-separated.</p>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="photo">
            Photo
          </label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-zinc-200"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={5}
            defaultValue={person?.bio ?? ""}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="notes">
            Notes (how you know them, relationship history)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={person?.notes ?? ""}
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
