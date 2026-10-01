# Six Word Story

A daily micro-adventure: build the exact six-word sentence that solves the scene. The game uses
the fixed adventure-verb toolkit, a ten-word daily bank, and a few scene-specific words. Correct
and misplaced words receive Wordle-style feedback; a near-miss may reveal a story crumb, while
the full coda remains locked until a solve.

Design reference: [`docs/DESIGN.md`](docs/DESIGN.md) · License: [`LICENSE`](LICENSE)

## Run locally

Requirements: Node.js 18.17+ and npm.

```sh
npm install
npm run dev
```

Open <http://localhost:3000>. For a production build:

```sh
npm run build
npm start
```

The runtime has no database, API keys, or external service dependency. Puzzles are bundled with
the app. The 30 authored seed scenes rotate by UTC date from the anchor date `2026-10-01`; the same
date always selects the same scene. The game advances at UTC midnight.

## Play and progression

- Tap word chips to fill six slots, tap a filled slot to remove it, then lock the guess in. The
  optional click sound is off by default. The theme toggle follows the system preference initially.
- Six guesses are allowed; hints are limited to two reveals per day. Near-miss crumbs follow the
  design threshold. The ending coda is returned only for a solved guess; a failed final guess gets
  the answer and decoy reveal without the coda.
- Daily rows, hint usage, crumbs, terminal reveal, streak, and lifetime solve count are saved in
  that browser's `localStorage`. Clearing browser storage or switching devices resets this local
  history. There are no accounts or cross-device sync.
- Share uses the browser's native share sheet where available, otherwise copies a tile-only card.

The answer and coda are omitted from the daily puzzle response and remain in server-only puzzle
modules. Guess and hint checks run through local Next.js route handlers. As there is intentionally
no database/session service in this MVP, a determined user can tamper with browser storage or
spoof a terminal guess request; this is casual-play progression, not an anti-cheat system.

## Puzzle workshop

Visit <http://localhost:3000/admin> to edit or load puzzle JSON, run mechanical validation, and
reserve dates in a browser-local schedule. The workshop checks answer length and constructibility,
unique words, the ten-word bank, fixed-toolkit collisions, decoys, hints, and coda shape. It is a
useful authoring/validation prototype, **not an authenticated admin console**: draft schedules stay
in the current browser, export as JSON, and do not publish puzzles. Authentication, shared durable
authoring, server-side scheduling, roles, and database persistence are staged features.

Mechanical checks cannot decide whether every answer word is fairly deducible from its scene;
editorial review is still necessary. Pixel-art sprite libraries and per-puzzle scene composition
are also staged; current scenes use a responsive illustrated emoji vignette.

## Checks

```sh
npm test
npm run build
```

Tests exercise deterministic feedback, duplicate-word scoring, crumb eligibility, validation, and
all thirty seed puzzles.
