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

## Data storage

This app stores its data in **Postgres** (not a local file), and photos in
**Vercel Blob** storage, so it can run as a normal hosted web app on Vercel's
free tier (which has no persistent local disk). Both have permanent free
tiers with no credit card required at this project's scale.

## Deploying it (so you get a shareable link)

1. **Create a free Vercel account**: go to https://vercel.com/signup and
   choose "Continue with GitHub" (the same GitHub account this repo lives
   in). No credit card needed.
2. **Import this project**: on your Vercel dashboard, click "Add New" →
   "Project", pick the `seelearning` repository, and:
   - Set **Root Directory** to `conference-organizer` (important — the
     Next.js app lives in that subfolder, not the repo root).
   - Under "Git", make sure it's deploying the
     `claude/conference-organizer-app-2h02ib` branch (or whichever branch
     you want live).
   - Click **Deploy**. It will fail on the first try — that's expected,
     because the database isn't connected yet. Continue to the next step.
3. **Add a free Postgres database**: in your new Vercel project, go to the
   **Storage** tab → "Create Database" → choose **Neon** (Postgres) →
   accept the free plan. Vercel automatically adds a `DATABASE_URL`
   environment variable to your project.
4. **Add free photo storage**: still in the **Storage** tab, click "Create
   Database" again → choose **Blob** → accept the free plan. This
   automatically adds a `BLOB_READ_WRITE_TOKEN` environment variable.
5. **Redeploy**: go to the **Deployments** tab, open the failed deployment,
   and click "Redeploy". This time it will succeed and give you a live URL
   like `https://conference-organizer-something.vercel.app`.

That URL is what you share/bookmark. Every time more work is pushed to this
branch, Vercel automatically redeploys it.

**Important — no login yet:** anyone with the link can view, add, edit, or
delete contacts. Fine for you trying it out privately; don't share the link
widely until authentication is added.

## Running it on your own computer instead

If you'd rather run it locally (e.g. to test changes before they're live):

```bash
npm install
```

Create a `.env.local` file (copy `.env.example`) with a `DATABASE_URL`
pointing to a Postgres database — the easiest way is to grab the connection
string from the same free Neon database you set up above (Neon dashboard →
Connection Details), or create your own at https://neon.com.

```bash
npm run dev
```

Then open http://localhost:3000. Photo uploads won't work locally unless
you also set `BLOB_READ_WRITE_TOKEN` in `.env.local` (from Vercel's Storage
tab → Blob store → `.env.local` tab) — everything else works fine without it.

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
- **Not yet protected**: as noted above, there's no password on the app
  itself. Adding one (or full accounts) is a near-term follow-up once
  you've had a chance to try the current version.

## What's next

Planned next milestones, in order: conferences (each pulling a subset of
people from this repository based on budget/theme), invitation tracking,
travel/hotel/meal logistics, and session/role assignment (presenter,
discussant, note-taker) with a participant-facing bio page per conference.
