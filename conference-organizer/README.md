# Conference Organizer — People Repository (v1)

A web app for managing the people you work with professionally, so you have
one place to store contacts before you start inviting them to conferences.
This is the first milestone of a larger conference-organizing tool; it does
not yet include conferences, invitations, travel, or session assignments.

## What's here

- **People repository**: add, edit, and remove contacts with name, email,
  phone, affiliation, title, location type (local / domestic /
  international), tags (field of expertise), bio, photo, and free-form notes.
- **Search & filter**: search across name/email/affiliation/tags, or filter
  by tag and location type.
- **Publications**: attach a list of publications (title, year, link) to
  each person.
- **CSV import**: bring in your existing spreadsheet. It auto-matches common
  column names (name, email, phone, affiliation/institution,
  title/role, location, tags/expertise, bio, notes) case-insensitively, so
  you generally don't need to reformat your file first. Only `name` is
  required — rows missing a name are skipped and listed.

## Running it

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

There is nothing to configure — the app creates a local SQLite database at
`data/conference-organizer.db` the first time it runs, and stores uploaded
photos under `public/uploads/photos/`. Neither is committed to git (see
`.gitignore`) since they contain personal contact information.

## Importing your spreadsheet

1. Export your existing contact list as a `.csv` file (from Excel, Google
   Sheets, or Numbers: File → Download/Export → CSV).
2. Go to **Import** in the app's navigation and upload the file.
3. Review the summary — it tells you how many contacts were added and lists
   any rows that were skipped (e.g. missing a name).

You can re-import safely; running the same file twice will create
duplicate entries (there's no de-duplication yet), so review before
re-importing.

## Notes on this version

- **Single admin tool for now**: there's no login and no participant
  self-service portal yet. You (the organizer) enter and edit all data.
  A self-service portal for participants to submit their own bio/photo/
  meal preference is planned for a later milestone.
- **Not yet internet-facing**: this runs as a local/private tool. Before
  deploying it somewhere reachable over the internet, it needs
  authentication added (currently anyone with the URL could edit or delete
  contacts) and a decision on hosting (see below).
- **Hosting**: undecided. This uses SQLite (a single file) so it runs
  anywhere Node.js does, including your own laptop. For access from
  multiple devices/collaborators, it can be deployed to a small server or
  a platform like Vercel/Render — that will likely mean switching from
  SQLite to a hosted Postgres database, which is a small, contained change
  when you're ready for it.

## What's next

Planned next milestones, in order: conferences (each pulling a subset of
people from this repository based on budget/theme), invitation tracking,
travel/hotel/meal logistics, and session/role assignment (presenter,
discussant, note-taker) with a participant-facing bio page per conference.
