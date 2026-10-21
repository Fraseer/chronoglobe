# Chronoglobe

A personal logbook for historical events. Each event is a point on a rotatable 3D globe. Drag the timeline underneath to move through history; events within a few years of the slider light up on the globe, on the timeline and in the sidebar.

Built for keeping track of the events from daily history guessing games like [Anno](https://anno-game.netlify.app/), but it works for any list of dated, placed events.

## Using it

- **Globe**: drag to spin, scroll or pinch to zoom. After a minute without any input it turns slowly on its own (not while locked, playing or adding an event). Clicking a point centres the globe on it and opens its details.
- **Timeline**: drag along it, type a year (e.g. `44 BC`), step ±1 or ±10 years, jump between events, or press play.
  - Dragging the timeline spins the globe: the faster you drag, the faster it turns. While time is moving the points show without their names, and a point that leaves the window fades out over a couple of seconds.
  - When you let go, the globe turns toward the matching events if none are in view.
  - **Lock** keeps the globe still while you move through time, so you can watch one place.
  - **Window** sets how close an event's year must be to count as a match (exact year up to ±100 years).
  - **Weighted / Even** changes the scale: weighted gives recent centuries more room.
- **Sidebar**: *This year* lists the events in the current window; *Full timeline* lists everything in date order, grouped by century. An event's details also list the other events from the same year.
- **Add event**: title, year (BC/AD), optional day and month, place, optional category and description. Pick the place by typing a city or country and choosing from the suggestions (about 240 historic places and the 177 countries on the map are built in), or by clicking the globe.

## Syncing between devices

With a Firebase project set in `firebase-config.js`, a **Sign in to sync** button appears. Signing in with Google keeps your events in your account, so your phone and computer show the same logbook and changes appear on the other device within a second or two. Firestore also keeps a copy on each device, so the app works offline and catches up when the connection is back.

- When you sign in, events kept in that browser while signed out are added to your account (if an event exists on both sides, the most recently edited copy wins), then cleared from the browser so nothing is added twice. Example events only join a brand-new account, so examples you've removed don't come back from another device.
- Only you can read or write your events: the rules in `firestore.rules` limit each account to its own `users/<uid>/events`, and accept only the app's event fields within size limits (title up to 200 characters, place 120, description 4,000, sensible years and coordinates).
- Without a Firebase project (`window.CHRONOGLOBE_FIREBASE = null`), everything works as described below, saved in the browser only.

### Setting up Firebase

1. Create a project at <https://console.firebase.google.com> (the free Spark plan is plenty).
2. **Add app → Web** and register it. Firebase then shows a snippet starting with `import { initializeApp } from "firebase/app"`; that form is for build tools and won't run here. Copy only the values inside `const firebaseConfig = { ... }` into `firebase-config.js` as `window.CHRONOGLOBE_FIREBASE = { apiKey: "...", authDomain: "...", ... };` (the app loads Firebase itself; `measurementId` isn't needed). These values identify the project; they aren't secrets.
3. **Authentication → Sign-in method → Google → Enable**. Then **Authentication → Settings → Authorized domains → Add domain** with the site's domain (for example `fraseer.github.io`).
4. **Firestore Database → Create database** in production mode, then paste `firestore.rules` into the **Rules** tab and **Publish**. Whenever `firestore.rules` changes in this repo, paste and publish it again; it isn't deployed automatically.

Sign-in needs the site to be opened from a web address listed under Authorized domains; opened straight from disk, the app stays browser-only.

## Where events are saved (signed out)

Events are stored in your browser's `localStorage`, on this device only. They never leave your browser. The page does load its fonts from Google Fonts, and Google Analytics records visits (pages viewed, rough location, device), never your events.

- Another browser, another device or a private window starts with its own, separate list.
- Clearing site data for the page deletes the events. Browsers can also clear it on their own: Safari (on Mac, iPhone and iPad) deletes it after 7 days without a visit, and any browser may when the disk is nearly full. Adding the site to your iPhone or iPad Home Screen avoids Safari's 7-day rule.
- On GitHub Pages, every project site under the same account (`<user>.github.io/...`) shares this storage. Clearing site data for any of them clears Chronoglobe's events too, and one of them filling the storage stops Chronoglobe saving. A custom domain keeps it separate.
- **Export backup** (at the bottom of *Full timeline*) saves a JSON file, and **Import backup** loads one. Importing merges by event: new events are added, and when an event exists on both sides the most recently edited copy is kept, so importing the same file twice changes nothing.

Export a backup now and then; it's the only copy that survives the browser clearing its storage.

A first visit starts with six events already in the logbook, including a pair from 1977 that people rarely expect to share a year. They're ordinary events: edit or delete them like any other, and ones you delete don't come back.

## Running locally

It's a static site with no build step. Serve the folder with any static server, for example:

```sh
node tests/server.cjs 8080      # or: python3 -m http.server 8080
```

then open <http://localhost:8080/>. Opening `index.html` straight from disk also works.

## Tests

End-to-end checks run in headless Chromium with Playwright:

```sh
npm install
npx playwright install chromium
npm test
```

They cover syncing between two devices (with a stand-in for Firebase: signing in, live updates, deletes, signing out and back in), selecting and closing events, centring on a clicked point, the timeline spinning the globe (and Lock stopping it), names hiding while dragging, points fading out, the same-year list, cancelling a typed year, adding and editing events, saving across reloads, syncing between tabs, export and import (including keeping newer edits and rejecting bad files), full and blocked storage, and layout at phone widths from 320 to 430 px. Set `CHROMIUM_PATH` to use a Chromium build you already have.

## Deploying

The repository root is the site. On GitHub Pages: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**. `.nojekyll` makes Pages serve the files as they are.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Page markup |
| `styles.css` | Styles, with light and dark themes |
| `app.js` | The app: globe, timeline, sidebar, storage |
| `world-110m.js` | World outline data |
| `firebase-config.js` | Firebase project for syncing (null = browser only) |
| `firestore.rules` | Database rules: each account reads and writes only its own events, with field and size limits |
| `vendor/` | d3, topojson-client and the Firebase SDK (loaded only when sync is set up), kept in the repo so the site doesn't depend on a CDN |
| `tests/` | Static server and end-to-end tests |

## Credits

- [d3](https://d3js.org) 7.9.0 and [topojson-client](https://github.com/topojson/topojson-client) 3.1.0 by Mike Bostock (ISC licence).
- Country and land outlines from [world-atlas](https://github.com/topojson/world-atlas) 2.0.2 (ISC), based on [Natural Earth](https://www.naturalearthdata.com/) (public domain).
- [Firebase JS SDK](https://github.com/firebase/firebase-js-sdk) 12.19.0 compat builds (Apache 2.0).
- Fonts from Google Fonts: Bodoni Moda, Instrument Sans and IBM Plex Mono (SIL Open Font License).
