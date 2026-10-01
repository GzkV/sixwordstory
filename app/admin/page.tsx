"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const sample = {
  id: "p_example", title: "The Mouse-Sized Post Office", scene: "A folded paper door guards a post office for mice. A copper coin fits the tiny slot cut into it.", goal: "Deliver the letter.", guessesAllowed: 6,
  answer: ["PUSH", "COIN", "THROUGH", "THE", "TINY", "SLOT"], winText: "A mouse-sized mailbox gives a very official click.",
  coda: ["A whiskered clerk stamps the coin with great ceremony.", "Somewhere, a seed packet begins its journey.", "The smallest post office has the biggest delivery route."],
  bank: [
    { word: "COIN", kind: "object" }, { word: "SLOT", kind: "target" }, { word: "WATER", kind: "object" },
    { word: "SPOON", kind: "object", isDecoy: true }, { word: "FLUTE", kind: "object", isDecoy: true },
    { word: "ROPE", kind: "object" }, { word: "BUTTON", kind: "object" }, { word: "BOX", kind: "target" },
    { word: "WINDOW", kind: "target" }, { word: "WELL", kind: "target" },
  ],
  bespoke: [{ word: "THROUGH", kind: "article" }, { word: "THE", kind: "article" }, { word: "TINY", kind: "target" }],
  flavor: ["A quiet creak answers."], hints: ["What might fit a lock?", "Read the scene once more."],
};
type Scheduled = { date: string; id: string; title: string };
const scheduleKey = "sws-admin-schedule-v1";

export default function AdminPage() {
  const [json, setJson] = useState(JSON.stringify(sample, null, 2));
  const [errors, setErrors] = useState<string[] | null>(null);
  const [date, setDate] = useState("");
  const [scheduled, setScheduled] = useState<Scheduled[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try { setScheduled(JSON.parse(localStorage.getItem(scheduleKey) ?? "[]") as Scheduled[]); } catch { setScheduled([]); }
  }, []);

  const validate = async () => {
    try {
      const puzzle = JSON.parse(json);
      const response = await fetch("/api/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(puzzle) });
      const result = await response.json();
      setErrors(result.errors);
      setNotice(result.errors.length ? "Fix the blocking checks before scheduling." : "All mechanical checks passed. Editorial fairness still needs human review.");
      return { puzzle, valid: result.errors.length === 0 };
    } catch {
      setErrors(["The editor does not contain valid JSON."]);
      setNotice("Correct the JSON syntax to continue.");
      return { puzzle: null, valid: false };
    }
  };

  const schedulePuzzle = async () => {
    const checked = await validate();
    if (!checked.valid || !checked.puzzle || !date) return;
    const current = JSON.parse(localStorage.getItem(scheduleKey) ?? "[]") as Scheduled[];
    if (current.some((entry) => entry.date === date)) { setNotice("That date already has a local draft scheduled."); return; }
    const entry = { date, id: checked.puzzle.id ?? "draft", title: checked.puzzle.title ?? "Untitled puzzle" };
    const next = [...current, entry].sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem(scheduleKey, JSON.stringify(next)); setScheduled(next);
    setNotice(`Draft reserved for ${date} in this browser. It is not published to players.`);
  };

  const loadFile = async (file?: File) => {
    if (!file) return;
    setJson(await file.text()); setErrors(null); setNotice(`Loaded ${file.name}.`);
  };

  const exportSchedule = () => {
    const blob = new Blob([JSON.stringify(scheduled, null, 2)], { type: "application/json" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "six-word-story-schedule.json"; link.click(); URL.revokeObjectURL(link.href);
  };

  return <main className="admin-shell">
    <header className="topbar"><Link href="/" className="brand"><span className="brand-icon" aria-hidden="true">✳</span><span>SIX WORD<br />STORY</span></Link><Link href="/" className="back-link">← Back to today's story</Link></header>
    <div className="admin-intro"><p className="eyebrow">AUTHOR WORKSHOP · LOCAL SANDBOX</p><h1>Shape a little adventure.</h1><p>Validate puzzle structure and sketch a date plan. Nothing here is published or protected by accounts yet.</p></div>
    <div className="admin-grid">
      <section className="editor-panel"><div className="panel-heading"><div><p className="eyebrow">PUZZLE DOCUMENT</p><h2>Authoring JSON</h2></div><label className="upload-button">Open JSON<input type="file" accept="application/json,.json" onChange={(event) => loadFile(event.target.files?.[0])} /></label></div>
        <label className="sr-only" htmlFor="puzzle-json">Puzzle JSON</label><textarea id="puzzle-json" spellCheck={false} value={json} onChange={(event) => { setJson(event.target.value); setErrors(null); }} />
        <div className="admin-actions"><button className="submit-button" onClick={validate}>Run puzzle checks <span aria-hidden="true">✓</span></button><div className="date-schedule"><label htmlFor="schedule-date">Reserve date</label><input id="schedule-date" type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(event) => setDate(event.target.value)} /><button className="secondary-button" disabled={!date} onClick={schedulePuzzle}>Add to plan</button></div></div>
        <p className="admin-notice" role="status">{notice || "Drafts and schedules stay in this browser only."}</p>
      </section>
      <aside className="validation-panel"><p className="eyebrow">MECHANICAL REVIEW</p><h2>Validation</h2><p className="panel-description">Checks answer size, word availability, uniqueness, decoy rules, hints, bank size, and coda shape.</p>
        {errors === null ? <div className="empty-checks"><span>✳</span><p>Run the checks to see if this puzzle is mechanically ready.</p></div> : errors.length ? <ul className="check-list errors">{errors.map((error) => <li key={error}><span aria-hidden="true">×</span>{error}</li>)}</ul> : <div className="pass-check"><span aria-hidden="true">✓</span><div><b>All blocking checks passed</b><p>Now read it aloud: check that every answer word is justified by the scene and that the opening naturally references each decoy, so none feels obviously unused.</p></div></div>}
        <div className="schedule-list"><div className="schedule-heading"><div><p className="eyebrow">BROWSER-LOCAL ONLY</p><h3>Date plan</h3></div><button onClick={exportSchedule} disabled={!scheduled.length} className="export-button">Export</button></div>
          {scheduled.length ? scheduled.map((entry) => <div className="schedule-row" key={entry.date}><b>{entry.date}</b><span>{entry.title}</span><small>DRAFT</small></div>) : <p className="no-schedule">No dates reserved yet.</p>}
        </div>
      </aside>
    </div>
    <footer className="footer"><span>Workshop prototype · no server-side persistence</span><Link href="/">Return to game</Link></footer>
  </main>;
}
