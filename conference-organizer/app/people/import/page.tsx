"use client";

import { useActionState } from "react";
import Link from "next/link";
import { importCsvAction, type ImportResult } from "@/app/people/actions";

const initialState: ImportResult | null = null;

export default function ImportPage() {
  const [state, formAction, pending] = useActionState(
    importCsvAction,
    initialState
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Import people from a spreadsheet
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Export your existing contact list as a CSV file, then upload it here.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-2 text-sm font-semibold text-zinc-800">
          Recognized column headers
        </h2>
        <p className="mb-4 text-sm text-zinc-500">
          The importer matches these column names automatically (case-insensitive).
          Extra columns are ignored, so you don&apos;t need to clean up your file first.
        </p>
        <ul className="mb-6 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-600 sm:grid-cols-3">
          <li><code>name</code> (required)</li>
          <li><code>email</code></li>
          <li><code>phone</code></li>
          <li><code>affiliation</code> / <code>institution</code></li>
          <li><code>title</code> / <code>role</code></li>
          <li><code>location</code> (local/domestic/international)</li>
          <li><code>tags</code> / <code>expertise</code></li>
          <li><code>bio</code></li>
          <li><code>notes</code></li>
        </ul>

        <form action={formAction} className="space-y-4">
          <input
            type="file"
            name="csv"
            accept=".csv,text/csv"
            required
            className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-zinc-200"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {pending ? "Importing..." : "Import"}
          </button>
        </form>
      </div>

      {state && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="mb-2 text-sm font-semibold text-zinc-800">Result</h2>
          <p className="mb-2 text-sm text-zinc-700">
            Added {state.created} {state.created === 1 ? "person" : "people"}.{" "}
            {state.skipped > 0 && `${state.skipped} row(s) skipped.`}
          </p>
          {state.errors.length > 0 && (
            <ul className="list-inside list-disc space-y-1 text-xs text-red-600">
              {state.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
          {state.created > 0 && (
            <Link
              href="/people"
              className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              View people →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
