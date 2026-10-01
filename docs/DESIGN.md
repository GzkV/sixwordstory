# Six Word Story — Design Document

*Status: Draft v3 · Owner: Tori · Last updated: 2026-09-30*

*Update v3 — **the unlock stack**: the six-word answer is now the *key*, and the story hides
behind it in a per-puzzle **coda** (§5.6). A solve reveals the coda as a scene-transition
(§7.6); near-misses drip **crumbs** out of it (§5.6); every placed word clicks as it locks in
(§7.2).*

---

## 1. Overview

**Six Word Story** is a "puzzle of the day" web game. The Wordle spark, the Hemingway spark: each
day every player meets a small adventure scene and must **guess the exact six-word sentence that
solves it** — a sentence composed from the day's word set. Guess it within your daily allotment
of guesses, and the scene is yours.

The cadence is daily and global: everyone gets the *same* scene and the *same* word set each day,
creating the shared water-cooler moment. Each puzzle is bite-sized — a single scene, a single
goal, exactly **six words** — logically deducible from the scene, with personality in the
writing and pixel-art charm in the telling.

The project ships as a hostable web app with two surfaces:

1. **Player app** — plays the daily puzzle.
2. **Admin console** — authors, validates, and schedules puzzles against future dates.

---

## 2. Game Pillars

The non-negotiables every puzzle and every feature must serve:

1. **Micro-adventure.** Six words is a complete little story ("for sale: baby shoes, never
   worn" energy). Each puzzle steps into a vignette — a locked door, a sleeping dragon, a creaky
   well — and one tight sentence sets it right. Not a logic grid.
2. **Logical, not whimsical.** The answer must be *deducible* from the scene text and the day's
   word set. No moon-logic. If the player can derive every one of the six words, they feel
   clever; if not, they feel cheated.
3. **Charming at every turn.** The scene, the win line, the hints, the flavor lines, and the
   **coda** (§5.6) all carry voice. A wrong guess never scolds — it winks, and on a near-miss
   it drips a crumb.
4. **Accessible in a sitting.** Under five minutes for a confident player. One attempt per day;
   a wrong guess costs a guess, never the day itself until you're out.

---

## 3. Core Gameplay Loop

### 3.1 The daily deal

Each day at midnight (**global day**, one puzzle for everyone — §7.5) the game serves:

- A **scene** (title + ~2–4 sentences of narrative that describe the space and the goal).
- A **goal** (implicit or explicit: *"Escape the study."*).
- The **word set**: the complete vocabulary for composing your guesses (§4).
- A hidden **coda** (§5.6) — authored with the puzzle, delivered only to a solve.

### 3.2 The answer: a six-word sentence

Every puzzle hides exactly one **answer**: a six-word sentence that solves the scene. Order
matters. For "The Gloomy Doorstep" the answer is:

```
USE  KEY  ON  THE  OAK  DOOR
```

The player cannot free-type — they assemble the sentence from the **word set** the day provides:

- **The Fixed Toolkit (always granted, always visible)** — a permanent set of classic
  text-adventure verbs available every day (LOOK, LISTEN, EXAMINE, TAKE, USE, OPEN, CLOSE, TURN,
  PUSH, PULL — see §4.1). The dependable RSTLNE the player can always lean on.
- **The Daily Bank of 10 custom words** — the day's puzzle content: objects, targets, a keyword
  or two, and the occasional bespoke flavor (see §4.2).
- **Puzzle-bespoke words** — a small handful of words specific to this puzzle's answer that the
  classics and a generic bank can't supply (e.g. `OAK`, `THE`). They are shown to the player as
  part of the day's word set.

The solution is a combination of bank and bespoke words (plus whatever fixed verbs the sentence
needs). A submission is a full six-word line.

### 3.3 One attempt, X guesses (Wordle model)

Each day the player gets **one attempt** and **X guesses** (default **6**, tunable — §13). A
guess is a complete six-word line. The moment the sixth guess is used, the attempt is over for
the day — **no free retry**, exactly like Wordle.

1. Player arranges six words from the word set into the six slots → submits.
2. Engine compares the guess to the answer, **slot by slot**, and returns per-word feedback:
   - 🟩 **green** — correct word in the correct slot.
   - 🟨 **yellow** — the word is in the answer, but in a different slot.
   - ⬜ **gray** — the word is not in the answer (this is also how a decoy reads while playing).
   - Multiplicity follows Wordle rules: using a word more times than it appears in the answer
     yields at most one green/yellow for it, the extras read gray.
3. The guess row is locked in with its feedback; the player composes the next guess.
4. **Win** — all six slots green. Solved. The scene transitions to its resolved state and the
   **coda** types out over it — the actual unlock (§5.6, §7.6).
5. **Out of guesses** — the attempt fails; the answer is revealed and decoys are flagged
   (§5.3). The full coda stays locked: the loser keeps only the **crumbs** dripped out along
   the way (§5.6), which is why the water-cooler question becomes *"did you unlock the
   ending?"* instead of *"did you win?"*

Because the attempt is fixed, streaks and share cards encode the Wordle same-day tension: you
either solve in your six guesses or the day is done.

### 3.4 The "aha" arc (author target structure)

A good six-word answer reads like a complete, natural instruction the player can *reverse-engineer*
word by word. Treat the following as an editorial target, not a property guaranteed by the runtime
or validator. For authors the target shape is:

```
 1.  verb the scene demands           USE
 2.  the tool the situation needs     KEY
 3.  connector / article              ON / THE
 4.  a descriptor the scene names     OAK
 5. the target the scene presents    DOOR

  full answer:   USE KEY ON THE OAK DOOR
```

Every answer word should have a specific justification in the scene: point to the detail that
supports the action, object, target, or modifier, or explain why a connector/article is required by
the sentence's grammar and meaning. The action itself must solve the stated scene goal; merely
having all six tokens appear somewhere in the scene is not enough. If a player who read the scene
can account for all six words and their order, the puzzle is fair. Ideally the nicest answers bury
the *least* obvious word (the descriptive `OAK`, the crucial tool `KEY`) and reward reading the
scene closely.

### 3.5 Practical authoring sequence

Use this sequence for each puzzle; passing the mechanical checks (§6.3) does not replace these
editorial steps:

1. **Draft the natural answer first.** Write the shortest complete, grammatical six-word sentence
   that performs the exact action needed to achieve the scene's goal. Do not force a sentence just
   to fit a word bank or a generated answer pattern.
2. **Clue that exact action.** Make the scene establish why this action works, which item performs
   it, and what it acts on. Include enough detail to support modifiers and connectors, without
   spelling out the whole answer as a single giveaway.
3. **Read the scene and answer aloud.** Check that the answer sounds like something a person would
   naturally say and that the scene leads to that sentence rather than merely permitting it.
4. **Review the language and logic.** Check modifier attachment (what does each adjective describe?),
   grammar, semantics (does the action actually solve the scene?), and plausible alternative
   readings or answers. Revise either the scene or answer when a word or relationship is ambiguous.
5. **Justify every token in order.** Record a scene detail or a grammatical/semantic reason for
   each of the six words, including articles and prepositions. If any token needs an explanation
   that the scene does not support, revise it.
6. **Then assemble vocabulary and decoys.** Ensure the exact answer is selectable, make unused
   words plausible in the opening scene, and review hints and coda for accidental answer leakage.
7. **Run the validator, then do a human fairness review.** Resolve mechanical errors, play the
   puzzle, and have someone unfamiliar with the draft try to explain the answer from the scene.
   A green validator result is not editorial approval.

---

## 4. The Answer Model (authoring contract)

### 4.1 Word kinds & the **Fixed Toolkit**

Every word in the daily word set carries exactly one **kind**. Kinds exist for authoring clarity
and validator reasoning; the player just sees words (with kind color-coding for readability).

| Kind | Role | Examples |
|---|---|---|
| `verb` | Action head — commonly slot 1 | `USE`, `OPEN`, `POUR` |
| `object` | Item used or handled | `KEY`, `ROPE`, `WATER` |
| `target` | Thing or place acted upon | `DOOR`, `CANDLE`, `WELL` |
| `article` | Connector / determiner | `THE`, `ON`, `A` |

**The Fixed Toolkit (global, not per-puzzle)** — a permanent, always-visible set of classic
adventure verbs granted to every puzzle. Always available; never changed per puzzle:

| Verb | Notes |
|---|---|
| `LOOK` · `LISTEN` · `EXAMINE` | inspection |
| `TAKE` | inventory |
| `USE` | the all-purpose action |
| `OPEN` · `CLOSE` | passage |
| `TURN` · `PUSH` · `PULL` | manipulation |

- **Always visible** — rendered in a dedicated, permanent row above the daily words; never
  hidden, never reduced. The player's dependable RSTLNE.
- **Global constant** — not part of the 10-word bank, not per-puzzle configurable.
- **No duplication** — the validator rejects a bank that re-includes a fixed verb (`OPEN` in the
  bank is an error; `OPEN` is already granted).
- Words in the answer may include fixed-toolkit verbs; the bank + bespoke supply the nouns and
  connective tissue.

### 4.2 Daily word set

The complete vocabulary each day = **Fixed Toolkit ∪ Daily Bank (10) ∪ bespoke (0–4)**.

Recommended split for the 10 **bank** words:

- **2–3 `object` / `target`** nouns the answer may use (`KEY`, `DOOR`, `CANDLE`).
- **1–2 plausible-but-unneeded nouns** — these become **decoys** (§4.3).
- **0–1 `verb`** beyond the toolkit, if a scene verb the classics don't cover is needed (`POUR`).
- Remainder: filler nouns and near-miss words that raise the surface difficulty.

A bank with **0 extra verbs** is fully supported — the toolkit covers most answers.

**Bespoke words (0–4):** words needed specifically by this answer that a generic bank wouldn't
carry — `OAK` to match "a heavy oak door," `THE` for grammar. They are part of the visible word
set so the answer is always constructible. This is the "bank + puzzle bespoke words" the brief
asks for.

### 4.3 Decoys & concealment

A **decoy** is a daily word that is **not part of the answer** — it can never turn green or
yellow, only gray. Its purpose is misdirection: it looks plausible but leads nowhere.

- **Disguised until the end.** During play a decoy is **not labeled "decoy."** It is shown under
  the kind it *would have if it were a real word* — a decoy noun renders as an `object`/`target`,
  a decoy verb as a `verb` — indistinguishable from a genuinely usable word. Marking it "decoy"
  mid-play would defeat the decoy, so we don't.
- **Revealed on completion.** Once the player **solves** the puzzle **or runs out of guesses**,
  decoys are flagged/revealed (a distinct "decoy" badge) and the full answer is shown.
- **Grounded in the opening scene.** The opening prompt should naturally reference the decoy words;
  otherwise players can tell those words are unused instead of treating them as plausible options.
- Behaviorally a decoy and an ordinary unused word are identical *during* play (both read gray).
  The difference is intentional design: a decoy is a *specifically chosen* trap word, while an
  ordinary near-miss is just an unneeded word. The player shouldn't be able to tell them apart
  until the end.

### 4.4 How the word set enables the answer

The answer's six words must all be in the day's word set, or the puzzle is unsolvable. The
validator enforces this mechanically (§6.3). Decoys are the counterweight: they raise difficulty
by adding plausible-but-wrong candidates without making the answer depend on words the player
can't see.

---

## 5. Puzzle Authoring Model

### 5.1 Anatomy of a puzzle (`puzzle` document)

```jsonc
{
  "id": "p_daily_009",
  "title": "The Gloomy Doorstep",
  "scene": "A study, lit by a single candle. The only exit is a heavy oak door,
            locked from the outside. A draft snuffles under it.",
  "goal": "Escape the study.",
  "guessesAllowed": 6,

  "answer": ["USE", "KEY", "ON", "THE", "OAK", "DOOR"],   // exactly 6 words, order matters
  "winText": "The key turns with a gratifying CLUNK. The door swings wide — freedom! 🎉",

  "coda": [                                    // 2–4 sentences, hidden until a solve (§5.6)
    "The bolt gives way with a sound like a held breath let go.",       // crumb 1
    "Cold air off the moor, and the candle gutters flat behind you.",  // crumb 2
    "Whatever was snuffling under the door has gone quiet.",           // crumb 3
    "You step out into a night that had been waiting all evening."     // win-only beat
  ],                          // crumbs ARE coda sentences: all but the last are drip-eligible

  "bank": [
    { "word": "KEY",    "kind": "object" },
    { "word": "WATER",  "kind": "object" },
    { "word": "ROPE",   "kind": "object" },
    { "word": "SPOON",  "kind": "object", "isDecoy": true },   // disguised as object until end
    { "word": "FLUTE",  "kind": "object", "isDecoy": true },
    { "word": "CANDLE", "kind": "target" },
    { "word": "DOOR",   "kind": "target" },
    { "word": "WINDOW", "kind": "target" },
    { "word": "WELL",   "kind": "target" },
    { "word": "POUR",   "kind": "verb" }
  ],
  "bespoke": [
    { "word": "OAK",    "kind": "target" },   // matched to scene text
    { "word": "THE",    "kind": "article" },
    { "word": "ON",     "kind": "article" }
  ],
  // Fixed Toolkit (LOOK/LISTEN/EXAMINE/TAKE/USE/OPEN/CLOSE/TURN/PUSH/PULL)
  // is granted implicitly and is NOT part of bank or bespoke.

  "flavor": [                                   // optional, non-logic charm lines
    "The oak door does not budge.",
    "A low rumbling snore answers you."
  ],
  "hints": ["The draft under the door has a story to tell.",
             "What is the candle here for?"]
}
```

### 5.2 Feedback engine (player runtime)

Compare a six-word guess to the six-word answer, slot by slot, with Wordle multiplicity handling:

```
evaluate(guess[6], answer[6]):
  # pass 1: mark exact matches green, tally answer words
  # pass 2: for each remaining slot, if word appears in unclaimed answer words → yellow
  # else → gray
  return [ GREEN | YELLOW | GRAY ] × 6
```

Deterministic, stateless, no I/O. The same function drives the admin preview and the player app.

### 5.3 Decoy reveal logic

A word in the day's set has an `isDecoy` flag (default false) and a display `kind`. The player
app reveals a word as a **decoy** (and shows the answer) when the attempt reaches a terminal
state: all six slots green (win) **or** the final guess is spent (out of guesses). Before that,
`isDecoy` is never surfaced and every word displays under its display `kind`.

### 5.4 Charm layer

- **Scene** names the words (a "heavy oak door" justifies `OAK`; a goal like "Escape" justifies
  `USE`).
- **Win text** is the punchline, referencing the specific scene.
- **Flavor lines** (optional) are short, non-logic reactions shown after non-winning guesses to
  keep the adventure voice without reintroducing state logic. They never depend on *which* word
  was guessed; they're static color.
- **Crumb lines** (§5.6) are the deliberate opposite of flavor: they *do* depend on the guess,
  they're drawn from the coda, and they're gated on a near-miss. When a crumb drops it takes
  that row's flavor slot — a crumb is the more valuable event and never shares the line.
- Taste rule: **never insult the player's guess** — the scene reacts, it doesn't judge.

### 5.5 Hints

Up to 3 hints per puzzle, revealed one at a time on demand. They surface *relevant words*, never
the answer string: "The draft under the door has a story to tell." Hints are limited (e.g. 2
per day max) and do not reveal decoys.

### 5.6 The unlock stack — coda, transition, crumbs, click

The recommendation at the heart of v3: **make the six-word answer the key, and hide the story
behind it.** The answer sentence tells you *what happened* (`USE KEY ON THE OAK DOOR`); the
**coda** tells you *what it felt like*. Without a coda, solving feels like filling in a correct
answer. With one, solving feels like opening a door you didn't know was locked — which is
exactly the "unlock the story" feel this game is after.

Four pieces, biggest to smallest. Pieces 2 and 4 live in the player experience and are specified
where they happen (§7.6, §7.2); pieces 1 and 3 are authored content, specified here.

1. **The coda (the actual unlock).** Every puzzle carries a hidden **2–4 sentence payoff**,
   written by the admin (§5.1). Pure narrative — not a second puzzle, not a hint. It renders
   *only* when the player locks in the correct six words. Think of the whole daily puzzle as a
   joke's setup; the coda is the punchline only a winner gets to hear.
   - **Win-gated server-side.** The coda never ships in the daily puzzle payload (§9.3); only
     the terminal *solved* response carries it.
   - **Losing keeps the ending locked.** Out of guesses still reveals the answer and decoys
     (§5.3), but not the coda — a loser learns what the answer was, never what it felt like.
2. **The reveal is a scene-transition, not a "Correct!" toast** — specified in §7.6.
3. **Crumbs (this is what protects losers).** Nobody says it out loud, but if only winners ever
   see story, a player who fails today gets zero story and the premise dies on a bad day. So
   pair the coda with crumbs:
   - **The fragments come from the coda itself.** Every coda sentence except the closing beat is
     crumb-eligible, in order — so what a loser half-reads is a literal sliver of the ending,
     not a hint and not separate flavor text. (A 2-sentence coda yields exactly one crumb; write
     3–4 if you want the drip to matter.)
   - **A crumb drops on a wrong-but-plausible guess** — *plausible* = the guess put at least
     **2 of the six answer words in play** (green + yellow ≥ 2). Wrong, but on the scent.
   - **Floor:** the final guess of the day drops a crumb even if nothing landed, so a struggling
     player still half-glimpses the ending. (Threshold and floor tunable — §13.)
   - A six-guess loser typically earns 2–3 of the 3–4 crumbs: half-glimpsed, never finished.
     That converts *"did you win?"* into *"did you unlock the ending?"* — Wordle's "I almost
     had it" tension, pointed at story instead of a green tile.
   - Crumbs should carry no gameplay information: no answers or path to the sixth word. Review
     this manually (§6.4); the validator only blocks the full joined answer string in a coda entry.
4. **Arrangement-as-authoring (the lock-in click)** — specified in §7.2: because order matters,
   tapping words into place *is* composing the sentence, so each word plays a short
   typewriter/click as it locks in. Tiny and cheap, but it makes building the sentence feel like
   writing rather than choosing from multiple choice — serving the micro-adventure and charm
   pillars (§2) with one touch.

---

## 6. Solvability & Fairness (the hard part)

The single biggest risk is shipping a puzzle whose answer is **unsolvable** or **unfair**. The
closed word set makes one narrow property machine-checkable: whether the validator can find each
answer word in the available vocabulary. Fairness (deducibility) and whether the words make a
coherent, scene-solving sentence require editorial review.

### 6.1 Constructibility check (mechanical, with a casing caveat)

The validator checks whether each answer word appears in `Fixed Toolkit ∪ bank ∪ bespoke`,
normalizing words to uppercase for this membership check. That establishes only normalized
vocabulary membership; it does not establish that the answer is grammatical, meaningful, or
deducible from the scene. Gameplay feedback compares guess and answer strings exactly (case-
sensitive). Use one canonical spelling and casing everywhere—uppercase matches the toolkit and
seed vocabulary—and make each answer token exactly match its displayed word's spelling and casing.
Do not rely on validator case-normalization to make a differently cased answer playable.

### 6.2 Deductibility (semantic, editorial)

Whether the six words are *deducible from the scene* is a language/design judgment, not a
computable property. The current validator does not assess fairness. Apply the authoring sequence
in §3.5 and have a human review the exact scene and exact answer before treating a puzzle as
editorially ready. In particular, the seeded puzzles are generated from answer fields using a
shared formula ([seed generation](lib/puzzles.ts:47)); passing the seed test means only that each
seed passes the mechanical validator. Some generated answer combinations may not fit the scene
details or express the intended action naturally. Review and edit each exact answer against its
scene; the seeds should not be assumed to have passed the editorial criteria in this document.

### 6.3 Current validator checks (mechanical only)

The prototype validator ([`validatePuzzle()`](lib/game.ts:31)) returns errors for the following
implemented checks. These are structural checks, not guarantees of puzzle quality, solvability in
the human sense, or fairness:

- A puzzle object has a non-empty title and scene; the answer contains exactly six non-empty
  strings; answer words are unique after uppercasing.
- The bank contains exactly 10 entries and bespoke contains no more than 4.
- There are 1–3 hints and 2–4 coda entries. The validator checks array counts, not whether each
  coda entry is actually a sentence.
- Every answer word matches a toolkit, bank, or bespoke word after uppercasing. Bank/bespoke words
  cannot duplicate a toolkit word, and words across bank and bespoke must be unique after
  uppercasing.
- Every bank/bespoke entry has one of the allowed display kinds (`verb`, `object`, `target`,
  `article`).
- A bank entry marked `isDecoy` cannot match an answer word after uppercasing.
- No hint or coda entry may contain the entire joined answer string after uppercasing. This does
  not detect partial answer leakage.
- `guessesAllowed` is an integer from 1 through 10.

The admin's “Run puzzle checks” action calls this validator; an empty error list is reported as
“All mechanical checks passed,” with a separate reminder for human fairness review (§8.1,
[admin validation UI](app/admin/page.tsx:33)). Successful checks are required before the UI adds a
date reservation, but that reservation is only a browser-local draft, not publication. The test
suite covers feedback behavior, the near-miss threshold, seeded puzzles' passing this validator,
and an invalid puzzle exercising the missing-answer-word and malformed-bank checks
([game tests](tests/game.test.ts:6)). It does not test whether seed answers are natural,
scene-solvable, or fair. Neither the validator nor the tests guarantee puzzle quality.

### 6.4 Editorial checks (manual or not implemented)

Treat these as author/reviewer responsibilities, not validator guarantees:

- Every answer token—including articles, prepositions, and modifiers—has a clear scene-based,
  grammatical, or semantic justification, and the exact six-word sentence performs the needed
  action.
- The sentence is natural when read aloud; modifier attachment, grammar, meaning, and ambiguity
  have been checked. The player can infer the intended action and answer rather than merely invent
  one possible answer.
- The opening makes decoys plausible; hints are useful without giving away the answer; coda text
  does not reveal it indirectly. The implemented validator only checks whether a hint/coda entry
  contains the full joined answer, not partial or indirect clues.
- The first answer word is a verb, if following the recommended answer shape. No such answer-shape
  warning or check is currently implemented.
- A reviewer has read the actual scene and answer pair and explicitly approved its fairness.
  There is no automated editorial review or resolved-scene-art validation in the current
  validator.

---

## 7. Player Experience

### 7.1 Daily rotation setting the scene

Home shows today's puzzle card: title + a one-line tease ("Today: a very sleepy dragon."). The
word set and full scene unlock on play. Past days show their answer + decoys after completion; a day you solved also replays its
coda (§5.6).

### 7.2 The board (the Wordle grid)

The attempt renders as a **grid: up to 6 guess rows × 6 word slots**. Completed rows lock with
their green/yellow/gray tiles. The scene (with pixel art, §10.3) sits above; the word-set chips
sit below. A small flavor line may appear under a freshly locked row (§5.4).

```
┌────────────────────────────┐
│ 🏔 SIX WORD STORY      #432 │
│ ╓pixel-art scene╖           │
│  THE GLOOMY DOORSTEP        │
│  ESCAPE THE STUDY.          │
├────────────────────────────┤
│  U S E   K E Y   O N  …    │      row 1 locked
│  ⬜ 🟨 🟩 …                  │
│                             │      row 2 being composed
│  _  _  _  _  _  _           │
├────────────────────────────┤
│  guesses left: 3   [hint]  │
│  ALWAYS: LOOK LISTEN EXAMINE│
│          TAKE USE OPEN      │
│          CLOSE TURN PUSH    │
│  KEY DOOR CANDLE SPOON …   │      decoys look normal here
│  [Submit]                   │
└────────────────────────────┘
```

**Interaction:** tap a word chip to drop it into the next empty slot of the active row — the
word **clicks / typewriter-ticks as it locks in** (§5.6 piece 4): one short sound, one mute
toggle, so it stays charm rather than noise. Tap a filled slot to remove it; `Submit` fires when
all six are filled. Feature the Wordle **flip / share** moment on completion (§7.4) and the
coda transition on a win (§7.6).

### 7.3 Streak & stats (Wordle flavor)

- **Streak** = consecutive solved days (resets on a missed day unless a freeze is used).
- **Freeze** = an item that preserves the streak for one missed day (earned by streaks).
- **Economy score** = `guessesAllowed − guessesUsed` on a solve; daily median comparison ("solved
  in 4, the median was 5").
- **Solve distribution** — shareable histogram of guess counts on a completed day.
- Metrics: solved?, guesses used, hints used, decoys encountered, time.

### 7.4 Social / share

Wordle-style share card; one tile per word slot:

```
Six Word Story  #432  ✅ 4/6
🟩🟨⬜🟨🟩⬜
🟩🟩🟩🟩🟩🟩
```

No spoiler of the word set — the share shows only tile colors. A solved day may carry one
extra glyph — 🔓 *ending unlocked* — and never a word of the coda itself.

### 7.5 Timezone handling — **DECIDED: global day (A)**

Every player gets the same daily puzzle, rotating at server midnight (a fixed UTC anchor).
Per-player local-midnight days are deferred as a v2 option if analytics suggest demand.

### 7.6 The win as a scene-transition (not a "Correct!" toast)

When the six slots go green, **don't** drop a modal that says "You did it." A win-state tells
you that you won; a scene-transition makes you *feel the win happen*. The sequence:

1. **No modal, no "Correct!"** — the win *is* the transition.
2. **The scene resolves.** The scene image fades into its **resolved state** — the door swings,
   the dragon settles, the light comes on (§10.3: the template's "after" plate).
3. **The coda types out over it**, word by word, at reading pace — the threshold crossed, the
   punchline delivered (§5.6).
4. **Only then** the board does its usual thing: decoy badges, share card, stats (§5.3, §7.4).
   Emotion first, mechanics second.

Manners and fallbacks: no resolved art → cross-fade + typed coda on the existing plate; a
"skip" tap and `prefers-reduced-motion` jump straight to the full coda text; the transition
never blocks the share card.

---

## 8. Admin Console

A separate authenticated surface (distinct route, e.g. `/admin`).

### 8.1 Features

| Area | Status | Capability |
|---|---|---|
| **Puzzle editor** | **Implemented prototype** | Edit the §5.1 puzzle document in a JSON textarea and import a JSON file. This is not form-based CRUD. |
| **Playtest preview** | **Planned / design target** | Play as a player: compose guesses, run the §5.2 feedback engine, see the grid, the crumb drip on near-misses, the decoy reveal, and the win transition with the coda typed out. |
| **Validator & fairness panel** | **Implemented prototype** | Runs the implemented §6.3 checks and reminds authors that editorial fairness still needs human review. It does not check answer shape or block publication; there is no publication workflow yet. |
| **Scheduler / calendar** | **Implemented prototype** | Reserves a date in browser-local storage after mechanical checks pass and can export the schedule as JSON; this is a draft plan, not publishing or a persistent shared schedule. |
| **Word library** | **Planned / design target** | Pool of approved words by kind; a one-click "decoy" surface so misdirection words stay taste-checked. |
| **Sprite library** | **Planned / design target** | Per-noun pixel-art sprites; upload/assign art and preview the composed diorama (§10.3). |
| **Template library** | **Planned / design target** | Reusable scene shells (locked door, well, dragon, chest…) each carrying a default backdrop. |
| **Analytics (read-only)** | **Planned / design target** | Solves/day, guess-histogram, decoy-encounter rates, fail-attempt rate, median time. |
| **Audit & status** | **Planned / design target** | Every puzzle shows draft / validated / scheduled / live plus last validation result and editor. |

### 8.2 Auth & roles

- **Admin auth** — session login; the player app needs none to *play* (anonymous possible) but an
  account to carry streaks across devices.
- **Roles:** `editor` (author/edit, cannot publish) and `admin` (schedule/publish).
- Secrets (admin session secret, DB) live in env — never in the repo.

---

## 9. Technical Architecture

### 9.1 Topology (recommended)

A single hostable web app, SQLite-backed for zero-ops v1.

```
Browser (player app)        Browser (admin console)
        │                          │
        └────────── HTTPS ─────────┘
                    │
          ┌─────────▼──────────┐
          │   Web server       │  Next.js: static SPA + JSON API
          │   (route /api)     │  + auth middleware for /admin
          └─────────┬──────────┘
                    │
          ┌─────────▼──────────┐
          │   SQLite (or       │  puzzles, schedules, players,
          │    Postgres later) │  attempts, streaks, admin users
          └────────────────────┘

Docker Compose (server + db volume) → deploy to a VPS/container host.
```

- **Stack — DECIDED: Next.js** (all-in-one SPA + API + easy auth). One note for a data
  scientist: the feedback engine (§5.2/§6) and any puzzle analytics are equally easy to script
  in Python; the engine is pure, so the swap to FastAPI is clean if you'd rather analyze puzzles
  in notebooks.
- The **feedback + validator engine is pure** — deterministic, no I/O — a shared, unit-tested
  module used by both the API and the admin/CI runner. *Engine once, used everywhere.*

### 9.2 Data model (core tables)

```
puzzles(id, title, scene, goal, guesses_allowed, body_json, status, created_by, updated_at)
schedules(date UNIQUE, puzzle_id FK, published_at)
players(id, username?, created_at)
attempts(id, player_id, puzzle_id, date, status[in_progress|solved|failed], guesses_used,
         hints_used, guess_log_json, solved_at)
streaks(player_id, current, longest, freezes, updated_at)
admins(id, email, password_hash, role, created_at)
word_library(id, word, kind, sprite_id?, added_by, approved)
sprites(id, noun_or_id, asset_path, grid_size, palette, created_by)
templates(id, name, body_json)      // body_json carries a backdrop_plate reference
scene_layouts(puzzle_id, noun_id -> {x, y, scale})   // sprite positions in the diorama
```

`puzzles.body_json` holds the full §5.1 document. `attempts.guess_log` enables replay, the
guess-histogram, and decoy-encounter stats.

### 9.3 API surface (skeleton)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/puzzle/daily?date=` | Today's (or past) puzzle: scene, goal, word set, hints remaining — **never the coda** (§5.6) |
| `POST` | `/api/attempt` | Open/resume the day's attempt; returns the current grid |
| `POST` | `/api/attempt/:id/guess` | Submit a 6-word guess; returns per-word feedback + win?/lost? + `crumb`, only when earned (§5.6) |
| `POST` | `/api/attempt/:id/hint` | Reveal next hint (gated) |
| `GET` | `/api/attempt/:id/reveal` | On terminal state: answer + decoys; the **coda only when `status: solved`** (idempotent over the state) |
| `GET` | `/api/stats/me` | Player stats |
| `POST` | `/api/share` | Build the tile-only share card |
| — admin (all behind auth) — |  |  |
| `GET/POST/PUT/DELETE` | `/api/admin/puzzles[/:id]` | CRUD puzzle docs |
| `POST` | `/api/admin/puzzles/:id/validate` | Run §6.3 checks; return report |
| `POST` | `/api/admin/puzzles/:id/preview` | Sandbox playtest |
| `GET/POST` | `/api/admin/schedules` | Assign/swap puzzles to dates |
| `GET` | `/api/admin/stats` | Aggregate analytics |
| `GET/POST` | `/api/admin/words` | Word library incl. decoy toggle |

The coda is the one field that must never appear in a pre-win payload: a dev-tools peek at
`/api/puzzle/daily` would cost the whole reveal. Gate it server-side, never in the client.

### 9.4 Reservation & atomicity

**Production design target, not current prototype behavior:** a publishing workflow should rerun the
validator when scheduling and publishing, so later edits cannot silently break a queued date.
The current admin only adds browser-local date reservations after a successful validation; it does
not publish puzzles, persist schedules on a server, or run a daily activation job.

---

## 10. UI / UX Sketches

### 10.1 Player — puzzle view

**Aesthetic direction — modern, Wordle / Hank Green's 4x3:** clean and centered, generous
whitespace, a single column, soft pastel accents, big round tap targets, restrained animation.
Dark + light palettes, mobile-first, one-handed. Word chips are color-tagged by **kind** (verbs,
objects, targets, articles) so the board reads like a designer's palette — but decoys are shown
under their disguised kind, indistinguishable from the real thing until the end (§4.3).

```
┌────────────────────────────┐
│ 🏔 SIX WORD STORY      #432 │
│      [pixel-art scene]      │   ← nouns illustrated (§10.3)
├────────────────────────────┤
│  THE GLOOMY DOORSTEP        │
│  … heavy oak door, locked.  │
│  ESCAPE THE STUDY.          │
├────────────────────────────┤
│  USE  KEY  ON  THE  OAK  X  │   row being composed
│  ░░░  ░░░  ░░░ ░░░  ░░░     │
├────────────────────────────┤
│  ✓  U S E  K E Y  O N…      │   locked rows show feedback
│  guesses left: 4  [hint]    │
├────────────────────────────┤
│  ALWAYS   LOOK LISTEN EXAMINE│
│           TAKE USE OPEN     │
│           CLOSE TURN PUSH   │
│           PULL              │
│  BANK+    KEY DOOR CANDLE   │
│           SPOON FLUTE WATER │
│           ROPE WELL WINDOW  │
│  BESPOKE  OAK  THE  ON     │
│  [Submit]                   │
└────────────────────────────┘
```

**Interaction:** tap a chip to fill the next empty slot of the active row — lock-in click
(§7.2) — tap a filled slot to clear it; `Submit` enabled when all six are set. Wordle
**flip/share** on completion (§7.4); on a win the scene swaps to its resolved state and the
coda types over it (§7.6).

### 10.2 Aesthetic direction: strategy

Borrow Wordle's discipline (one narrow column, restrained palette, one interaction per view) and
4x3's **delight in the shared daily artifact**. The modern skin makes six words feel like six
satisfied taps. No timers, no scolders, no loot. Charm comes from the writing and the art, never UI noise — with exactly
one sanctioned exception: the lock-in click when a word seats itself (§7.2), which is charm,
not noise.

### 10.3 Scene pixel art (charming, cheap, author-friendly)

A signature visual: the scene is **illustrated as pixel art of its nouns**, composed from a
**shared sprite library** rather than a custom illustration per puzzle:

- **One sprite per noun.** Every word in the word library can carry a small pixel-art sprite
  (16×16 or 32×32, upscaled for crispness). `KEY`, `CANDLE`, `DOOR`, `DRAGON` each reuse one
  sprite.
- **Composition over illustration.** A scene = a **backdrop plate** (from the scene template) +
  the sprites of the scene's nouns placed on it. The admin arranges positions; the player sees a
  composed diorama.
- **Decoys appear too** — a misdirection word can sit innocently in the picture, itself a gentle
  trap. Its sprite tells nothing more than the word chip does.
- **Visibility guard:** sprites illustrate only words already in the day's word set; they never
  reveal the solution or introduce unseen words (the set is the complete vocabulary — §4.4).
- **A resolved state per template.** The win transition (§7.6) needs the plate's "after"
  variant — door open, dragon asleep, candle out. Author it once per *template*, not per
  puzzle, so the cost stays bounded the way sprite reuse is (§10.3).
- **Fallback:** a puzzle with no art renders a theme backdrop or flat color — art is additive
  charm, never a dependency.

Authoring cost is bounded by the **library**, not per-puzzle commissions: N sprites serve every
puzzle reusing those nouns.

### 10.4 Admin — puzzle editor

Split pane: form fields left (**answer slots**, word set with kind + decoy toggles, scene, goal,
hints, **coda + crumb order**), **live preview right** — the composed diorama, the word chips, and a playable mini-board
that runs the §5.2 engine and prints per-guess feedback. A **validator panel** at the bottom
updates its §6.3 checklist on every edit and shows the reveal state (answer + flagged decoys).
Sprite thumbnails appear next to each word.

---

## 11. Scope & Milestones

### v1 (initial launch)
- **Player app:** daily puzzle, one-attempt / 6-guess cap, six-slot word construction, per-word
  feedback, decoy concealment + end reveal, **coda unlock + crumb drip, win scene-transition,
  lock-in click**, win/lose, streak, minimal stats, share card.
- **Admin:** puzzle editor (incl. coda/crumb authoring), playtest preview, validator + fairness
  panel, calendar scheduler, auth; word/sprite/template libraries, resolved-state plates.
- ~30–50 hand-authored, validated puzzles seeded across the first 30 days.

### v2 (post-launch)
- Freeze economy, achievements, deeper analytics (decoy-encounter funnels), template/word/sprite
  library growth, per-timezone days *if demand*.

### Explicitly out of scope until asked
- Free-text input, PvP/multiplayer, user-generated puzzles, mobile *native* apps.

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| **Unsolvable answer ships** | The current validator reports answer words missing from the normalized toolkit/bank/bespoke vocabulary (§6.3). This is not a publish gate and cannot establish semantic solvability; human review and playtesting are required. |
| **Moon-logic / unfair words** | Justify every answer word from the scene (§3.4–3.5) and complete the manual fairness review (§6.4); no automated check guarantees this. |
| **Answer guessed too easily / too hard** | Guess-count is configurable per puzzle (default 6, tunable to 5 for harder days); decoy count tuned via analytics. |
| **Streak pressure becomes punitive** | Wordle-like one-attempt tension is intended; freezes soften missed days; streak tracks *solve*, not first-try. |
| **Decoy revealed mid-play (spoiler)** | `isDecoy` is never surfaced until a terminal state (§5.3); enforced in the client and server response. |
| **Loser gets zero story — premise dies on a bad day** | Crumbs drip on plausible near-misses with a floor on the last guess (§5.6); the full coda stays win-gated, so a failure still half-glimpses the ending. |
| **Coda leaked before a solve** | Never serialized into the daily payload; returned only by the terminal `solved` response, server-side (§9.3). |
| **Crumb threshold too strict / too loose** | Tunable per §13; watch the "crumbs earned on failed attempts" metric in analytics before changing the default. |
| **Timezone confusion** | Global day (A), fixed UTC anchor, decided. |
| **Admin auth off by default** | Console behind auth middleware from day one; secret via env — never ship a default password. |

---

## 13. Open Decisions (go ask before/at build)

**Resolved:** stack → **Next.js** · timezone → **global day** · verb vocabulary → hybrid (Fixed
Toolkit + per-puzzle verbs) · core mechanic → **one attempt, X guesses, Wordle-style, guess the
6-word answer** · decoys → disguised until solve-or-out-of-guesses (§4.3) · unlock → **coda +
scene-transition reveal + crumbs + lock-in click** (§5.6, §7.6).

Still open:

1. **Guess count X.** Default **6** (mirrors the 6-word answer and Wordle's 6 guesses). Tori
   floated 5 — 5 is a materially harder day. Recommend 6 for v1 (per-puzzle `guessesAllowed`,
   so it stays tunable). 
2. **Accounts** — anonymous play OK + optional account for streaks, or forced? (Recommend
   optional for v1.)
3. **Content load** — how many seed puzzles before launch? (Recommend ≥30.)
4. **Crumb threshold.** "Plausible" = green+yellow ≥ 2, plus a guaranteed crumb on the last
   guess — recommended for v1. Too strict and losers get no story; too loose and crumbs stop
   feeling earned. Tune against analytics, not vibes.

---

*Document ends. Next step: scaffold the engine + validator module first — everything else hangs
off those two being right.*
