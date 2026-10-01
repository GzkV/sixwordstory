"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Feedback, WordKind } from "@/lib/game";

type Word = { word: string; kind: WordKind };
type PublicPuzzle = {
  id: string; title: string; scene: string; goal: string; guessesAllowed: number;
  bank: Word[]; bespoke: Word[]; toolkit: string[]; hintCount: number;
};
type GuessRow = { guess: string[]; feedback: Feedback[] };
type Reveal = { answer: string[]; decoys: string[]; coda?: string[] };
type SavedGame = { date: string; rows: GuessRow[]; hints: string[]; crumbs: string[]; status: "playing" | "won" | "failed"; reveal?: Reveal; winText?: string };
type Stats = { [date: string]: { solved: boolean; guesses: number } };

const gameKey = (date: string) => `sws-game-${date}`;
const STATS_KEY = "sws-stats-v1";
const blankGame = (date: string): SavedGame => ({ date, rows: [], hints: [], crumbs: [], status: "playing" });

function readJson<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
}

function currentStreak(stats: Stats, today: string): number {
  let count = 0;
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - (stats[today]?.solved ? 0 : 1));
  while (stats[date.toISOString().slice(0, 10)]?.solved) { count++; date.setUTCDate(date.getUTCDate() - 1); }
  return count;
}

export default function Home() {
  const [puzzle, setPuzzle] = useState<PublicPuzzle | null>(null);
  const [date, setDate] = useState("");
  const [game, setGame] = useState<SavedGame | null>(null);
  const [stats, setStats] = useState<Stats>({});
  const [active, setActive] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(true);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setDate(today);
    setGame(readJson(gameKey(today), blankGame(today)));
    setStats(readJson(STATS_KEY, {}));
    setDark(window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);
    fetch(`/api/puzzle/daily?date=${today}`).then((response) => response.json()).then((body) => setPuzzle(body.puzzle)).catch(() => setMessage("The day's story could not be loaded. Refresh to try again."));
  }, []);

  useEffect(() => { if (dark) document.documentElement.dataset.theme = "dark"; else delete document.documentElement.dataset.theme; }, [dark]);

  const persist = useCallback((next: SavedGame) => {
    setGame(next);
    localStorage.setItem(gameKey(next.date), JSON.stringify(next));
    if (next.status !== "playing") {
      const updated = { ...readJson<Stats>(STATS_KEY, {}), [next.date]: { solved: next.status === "won", guesses: next.rows.length } };
      localStorage.setItem(STATS_KEY, JSON.stringify(updated));
      setStats(updated);
    }
  }, []);

  const tap = useCallback((word: string) => {
    if (!muted && typeof window !== "undefined" && "AudioContext" in window) {
      try {
        const audio = new AudioContext(); const oscillator = audio.createOscillator(); const gain = audio.createGain();
        oscillator.frequency.value = 570; gain.gain.value = 0.025; oscillator.connect(gain); gain.connect(audio.destination);
        oscillator.start(); oscillator.stop(audio.currentTime + 0.025); oscillator.onended = () => void audio.close();
      } catch { /* audio is an optional delight */ }
    }
    setActive((current) => current.length < 6 && !current.includes(word) ? [...current, word] : current);
  }, [muted]);

  const submit = async () => {
    if (!game || !puzzle || active.length !== 6 || busy || game.status !== "playing") return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/guess", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, guess: active, guessNumber: game.rows.length + 1, crumbsSeen: game.crumbs.length }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Guess could not be checked.");
      const rows = [...game.rows, { guess: active, feedback: result.feedback as Feedback[] }];
      const next: SavedGame = {
        ...game, rows,
        crumbs: result.crumb ? [...game.crumbs, result.crumb] : game.crumbs,
        status: result.solved ? "won" : result.failed ? "failed" : "playing",
        ...(result.reveal ? { reveal: result.reveal as Reveal } : {}),
        ...(result.winText ? { winText: result.winText as string } : {}),
      };
      persist(next); setActive([]);
      if (!result.solved && !result.failed) setMessage(puzzle ? ["The room gives a quiet little creak.", "Not quite—but something in the scene has shifted.", "The adventure is still listening."][rows.length % 3] : "Try another arrangement.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Guess could not be checked."); }
    finally { setBusy(false); }
  };

  const askHint = async () => {
    if (!game || busy || game.hints.length >= Math.min(2, puzzle?.hintCount ?? 0)) return;
    setBusy(true);
    try {
      const response = await fetch("/api/hint", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, hintIndex: game.hints.length }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      persist({ ...game, hints: [...game.hints, result.hint] });
    } catch (error) { setMessage(error instanceof Error ? error.message : "No hint available."); }
    finally { setBusy(false); }
  };

  const shareText = useMemo(() => {
    if (!game) return "";
    const score = game.status === "won" ? `${game.rows.length}/${puzzle?.guessesAllowed ?? 6}` : `X/${puzzle?.guessesAllowed ?? 6}`;
    const tiles = game.rows.map((row) => row.feedback.map((tile) => tile === "green" ? "🟩" : tile === "yellow" ? "🟨" : "⬜").join("")).join("\n");
    return `Six Word Story · ${date} · ${score}${game.status === "won" ? " · 🔓 ending unlocked" : ""}\n${tiles}`;
  }, [date, game, puzzle]);

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ text: shareText });
      else { await navigator.clipboard.writeText(shareText); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
    } catch { /* user dismissed native share */ }
  };

  const allWords = useMemo(() => puzzle ? [
    ...puzzle.toolkit.map((word) => ({ word, kind: "verb" as WordKind, group: "Always" })),
    ...puzzle.bank.map((entry) => ({ ...entry, group: "Today's words" })),
    ...puzzle.bespoke.map((entry) => ({ ...entry, group: "Scene words" })),
  ] : [], [puzzle]);

  if (!game || !date) return <main className="loading" aria-live="polite">Opening today's little adventure…</main>;
  const ended = game.status !== "playing";
  const streak = currentStreak(stats, date);
  const wins = Object.values(stats).filter((entry) => entry.solved).length;

  return <main className="shell">
    <header className="topbar">
      <Link href="/" className="brand" aria-label="Six Word Story home"><span className="brand-icon" aria-hidden="true">✳</span><span>SIX WORD<br />STORY</span></Link>
      <div className="header-actions">
        <div className="stat-chip" title="Consecutive daily solves"><span aria-hidden="true">🔥</span> <b>{streak}</b><small>streak</small></div>
        <button className="icon-button" onClick={() => setMuted((value) => !value)} aria-label={muted ? "Turn word sounds on" : "Mute word sounds"} title={muted ? "Sound off" : "Sound on"}>{muted ? "♪̸" : "♪"}</button>
        <button className="icon-button" onClick={() => setDark((value) => !value)} aria-label="Toggle color theme" title="Toggle theme">{dark ? "☼" : "☾"}</button>
      </div>
    </header>

    <section className="intro-row">
      <div><p className="eyebrow">A SMALL ADVENTURE, EVERY DAY</p><h1>Find the six words<br className="mobile-break" /> that change everything.</h1></div>
      <div className="date-card"><span className="date-number">{new Intl.DateTimeFormat("en", { day: "2-digit", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`))}</span><span>{new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`))}<br /><b>UTC DAILY</b></span></div>
    </section>

    {!puzzle && message && <p className="load-error" role="alert">{message}</p>}

    {puzzle && <>
      <section className={`scene-card ${ended ? "scene-resolved" : ""}`} aria-labelledby="puzzle-title">
        <div className="scene-drawing" aria-hidden="true"><span className="scene-orbit">✦</span><span className="scene-emoji">{["🗝️", "🔔", "🌋", "🐭", "🐉", "🏮", "🌿", "🐦", "🪣", "📦", "❄️", "⛵", "🎭", "🪁", "📚", "☁️", "🐈", "⛲", "🐲", "🚂", "🌧️", "🌙", "🦊", "🫙", "👑", "🐉", "⚓", "🧹", "🔭", "🌱"][Number(puzzle.id.slice(-2)) - 1] ?? "✧"}</span><span className="scene-horizon" /></div>
        <div className="scene-copy"><p className="eyebrow">TODAY'S SCENE</p><h2 id="puzzle-title">{puzzle.title}</h2><p className="scene-description">{puzzle.scene}</p><p className="goal"><span aria-hidden="true">↳</span> {puzzle.goal}</p></div>
      </section>

      <div className="play-meta"><span><b>{puzzle.guessesAllowed - game.rows.length}</b> {puzzle.guessesAllowed - game.rows.length === 1 ? "guess" : "guesses"} left</span><span className="meta-dot">·</span><span>{game.rows.length}/{puzzle.guessesAllowed} used</span><button className="text-button" onClick={askHint} disabled={busy || ended || game.hints.length >= Math.min(2, puzzle.hintCount)}>Hint <span>{game.hints.length}/2</span></button></div>
      {game.hints.length > 0 && <div className="hint-list" aria-live="polite">{game.hints.map((hint, index) => <p key={index}><span>CLUE {index + 1}</span>{hint}</p>)}</div>}

      <section className="board" aria-label="Guess board">
        {Array.from({ length: puzzle.guessesAllowed }, (_, rowIndex) => {
          const row = game.rows[rowIndex];
          const isActive = rowIndex === game.rows.length && !ended;
          return <div className={`guess-row ${row ? "locked-row" : ""} ${isActive ? "active-row" : ""}`} key={rowIndex} aria-label={row ? `Guess ${rowIndex + 1}` : isActive ? "Current guess" : `Guess ${rowIndex + 1}, empty`}>
            {Array.from({ length: 6 }, (_, slot) => {
              const value = row?.guess[slot] ?? (isActive ? active[slot] : undefined);
              return <button type="button" key={slot} className={`tile ${row ? `tile-${row.feedback[slot]}` : value ? "tile-filled" : ""}`} onClick={() => isActive && value && setActive((current) => current.filter((_, index) => index !== slot))} aria-label={`${value ?? "Empty"}${row ? `, ${row.feedback[slot]}` : isActive && value ? ", remove word" : ""}`} disabled={!isActive || busy}>{value ?? <span aria-hidden="true">·</span>}</button>;
            })}
          </div>;
        })}
      </section>

      <section className="composer" aria-label="Word bank">
        <p className="bank-instruction">TAP A WORD TO BUILD YOUR SENTENCE <span>{active.length}/6</span></p>
        {["Always", "Today's words", "Scene words"].map((group) => {
          const groupWords = allWords.filter((item) => item.group === group);
          return <div className="word-group" key={group}><span className="group-label">{group === "Today's words" ? "WORD BANK" : group === "Scene words" ? "BESPOKE" : "TOOLKIT"}</span><div className="word-chips">{groupWords.map(({ word, kind }) => <button key={word} className={`word-chip kind-${kind} ${active.includes(word) ? "chip-used" : ""}`} onClick={() => tap(word)} disabled={ended || busy || active.length === 6 || active.includes(word)}>{word}</button>)}</div></div>;
        })}
        {active.length > 0 && !ended && <button className="clear-button" onClick={() => setActive([])}>Clear sentence</button>}
        <button className="submit-button" onClick={submit} disabled={active.length !== 6 || busy || ended}>{busy ? "Checking…" : "Lock in this sentence"}<span aria-hidden="true">↗</span></button>
      </section>

      <p className="status-message" aria-live="polite">{message}</p>

      {game.crumbs.length > 0 && <section className="crumb-card" aria-label="Story crumbs"><p className="eyebrow">A LITTLE OF THE ENDING</p>{game.crumbs.map((crumb, index) => <p key={`${index}-${crumb}`} className="crumb-line">“{crumb}”</p>)}</section>}

      {ended && game.reveal && <section className={`ending-card ${game.status === "won" ? "won" : "lost"}`} aria-live="polite">
        <div className="ending-heading"><span className="ending-icon" aria-hidden="true">{game.status === "won" ? "✦" : "↗"}</span><div><p className="eyebrow">{game.status === "won" ? "ENDING UNLOCKED" : "THE SCENE REVEALED"}</p><h2>{game.status === "won" ? "You found the story." : "The words were waiting."}</h2></div></div>
        {game.winText && <p className="win-line">{game.winText}</p>}
        <div className="answer-reveal" aria-label="Answer"><span>THE ANSWER</span>{game.reveal.answer.join(" ")}</div>
        {game.status === "won" && game.reveal.coda && <div className="coda" aria-label="Unlocked story ending">{game.reveal.coda.map((line, index) => <p key={index} style={{ animationDelay: `${index * 350}ms` }}>{line}</p>)}</div>}
        {game.reveal.decoys.length > 0 && <p className="decoy-line"><b>Decoys, unmasked:</b> {game.reveal.decoys.map((word) => <span key={word}>{word}</span>)}</p>}
        <button className="share-button" onClick={share}>{copied ? "Copied to clipboard" : "Share today's tiles"} <span aria-hidden="true">↗</span></button>
      </section>}

      {!ended && game.status === "playing" && <div className="gentle-note">No timer. No scolding. Just six words and a little patience.</div>}
    </>}

    <footer className="footer"><span>Made for curious minds <span aria-hidden="true">✳</span></span><span>{wins} {wins === 1 ? "story" : "stories"} unlocked</span><Link href="/admin">Puzzle workshop</Link></footer>
  </main>;
}
