# Conference Organizer — People Repository (v1)

A web app, for your own computer, that manages the people you work with
professionally — so you have one place to store contacts before you start
inviting them to conferences. This is the first milestone of a larger
conference-organizing tool; it does not yet include conferences,
invitations, travel, or session assignments.

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

## Running it (the easy way)

**First time only:** install [Node.js](https://nodejs.org) — download the
"LTS" version for your computer and run the installer, using all the
default options. (This app needs Node 22.5 or newer; the current LTS
download from nodejs.org already satisfies that.)

**Every time you want to use the app:**

- **On a Mac**: double-click **`Start on Mac.command`** in this folder.
  (First time only: if macOS says it can't verify the file, right-click it
  → Open, then confirm — after that, double-clicking works normally.)
- **On Windows**: double-click **`Start on Windows.bat`** in this folder.

A window will open showing the app starting up, and your browser will open
to the app automatically after a few seconds. **Leave that window open**
while you're using the app — closing it stops the app. To stop the app on
purpose, just close that window.

The first time you run it, it'll take a minute or two to set itself up —
that's normal, and it's quick every time after that. If something goes
wrong during setup, the window will now stay open and show you what
happened instead of closing — see Troubleshooting below.

### Troubleshooting

- **"Node.js not found"**, even after installing it: fully quit and reopen
  the launcher (and if that doesn't help, restart your computer once —
  this refreshes a setting the installer changes that otherwise only
  takes effect after a restart).
- **The window shows an error and stays open**: that's intentional now —
  scroll up in that window to read the error, and feel free to copy the
  whole window's text if you need help interpreting it.
- **Browser says "server not found" right after it opens**: this is
  normal on the very first run — the setup can take longer than the few
  seconds the browser waits. Wait a minute, then reload the page (or
  manually go to `http://localhost:3000`).

## Where your data lives

Everything you enter is stored right on your computer, in this folder:

- Contacts, tags, and publications: `data/conference-organizer.db`
- Uploaded photos: `public/uploads/photos/`

There's no internet account, no login, and nothing is sent anywhere. That
also means: **back this folder up** (or at least the `data` and
`public/uploads` folders) the way you would any other important file — if
this folder is lost, your data is lost with it. It also means the app is
only usable on this one computer, by whoever sits at it; sharing it with
a co-organizer on another computer isn't supported yet (that would mean
moving it to a hosted setup, which we can revisit later if you need it).

## Importing your spreadsheet

1. Export your existing contact list as a `.csv` file (from Excel, Google
   Sheets, or Numbers: File → Download/Export → CSV).
2. With the app running, go to **Import** in the navigation and upload the
   file.
3. Review the summary — it tells you how many contacts were added and lists
   any rows that were skipped (e.g. missing a name).

You can re-import safely, but running the same file twice will create
duplicate entries (there's no de-duplication yet), so review before
re-importing.

## If you'd rather use the terminal

If you're comfortable with it, the launcher scripts above are just a
shortcut for:

```bash
npm install   # first time only
npm run dev
```

Then open http://localhost:3000.

## Notes on this version

- **Single-user, local tool**: there's no login because it's just you, on
  your own computer. A participant self-service portal (for people to
  submit their own bio/photo/meal preference) is planned for a later
  milestone, and will need its own design once we get there.

## What's next

Planned next milestones, in order: conferences (each pulling a subset of
people from this repository based on budget/theme), invitation tracking,
travel/hotel/meal logistics, and session/role assignment (presenter,
discussant, note-taker) with a participant-facing bio page per conference.
