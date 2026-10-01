export const TOOLKIT = ["LOOK", "LISTEN", "EXAMINE", "TAKE", "USE", "OPEN", "CLOSE", "TURN", "PUSH", "PULL"] as const;

export type WordKind = "verb" | "object" | "target" | "article";
export type Feedback = "green" | "yellow" | "gray";

export interface Word { word: string; kind: WordKind; isDecoy?: boolean }
export interface Puzzle {
  id: string; title: string; scene: string; goal: string; guessesAllowed: number;
  answer: string[]; winText: string; coda: string[]; bank: Word[]; bespoke: Word[];
  flavor: string[]; hints: string[];
}

export function evaluateGuess(guess: readonly string[], answer: readonly string[]): Feedback[] {
  const result: Feedback[] = Array(guess.length).fill("gray");
  const remaining = new Map<string, number>();
  answer.forEach((word, index) => {
    if (guess[index] === word) result[index] = "green";
    else remaining.set(word, (remaining.get(word) ?? 0) + 1);
  });
  guess.forEach((word, index) => {
    if (result[index] === "green") return;
    const count = remaining.get(word) ?? 0;
    if (count > 0) {
      result[index] = "yellow";
      remaining.set(word, count - 1);
    }
  });
  return result;
}

export function validatePuzzle(input: unknown): string[] {
  const errors: string[] = [];
  if (!input || typeof input !== "object") return ["Puzzle must be a JSON object."];
  const puzzle = input as Partial<Puzzle>;
  const bank = Array.isArray(puzzle.bank) ? puzzle.bank : [];
  const bespoke = Array.isArray(puzzle.bespoke) ? puzzle.bespoke : [];
  const answer = Array.isArray(puzzle.answer) ? puzzle.answer : [];
  if (typeof puzzle.title !== "string" || !puzzle.title.trim()) errors.push("Add a puzzle title.");
  if (typeof puzzle.scene !== "string" || !puzzle.scene.trim()) errors.push("Add a scene.");
  if (answer.length !== 6 || answer.some((w) => typeof w !== "string" || !w.trim())) errors.push("Answer must contain exactly six words.");
  if (new Set(answer.map((w) => String(w).toUpperCase())).size !== answer.length) errors.push("Answer words must be unique.");
  if (bank.length !== 10) errors.push("Daily bank must contain exactly 10 words.");
  if (bespoke.length > 4) errors.push("Bespoke word set cannot contain more than four words.");
  if (!Array.isArray(puzzle.hints) || puzzle.hints.length < 1 || puzzle.hints.length > 3) errors.push("Provide one to three hints.");
  if (!Array.isArray(puzzle.coda) || puzzle.coda.length < 2 || puzzle.coda.length > 4) errors.push("Coda must contain two to four sentences.");
  const words = [...bank, ...bespoke];
  const listed = new Set([...TOOLKIT, ...words.map((entry) => String(entry.word).toUpperCase())]);
  if (answer.some((word) => !listed.has(String(word).toUpperCase()))) errors.push("Every answer word must be in the toolkit, bank, or bespoke set.");
  if ([...bank, ...bespoke].some((entry) => TOOLKIT.includes(String(entry.word).toUpperCase() as typeof TOOLKIT[number]))) errors.push("Bank and bespoke words cannot duplicate the fixed toolkit.");
  if (new Set(words.map((entry) => String(entry.word).toUpperCase())).size !== words.length) errors.push("Bank and bespoke words must be unique.");
  if (words.some((entry) => !["verb", "object", "target", "article"].includes(entry.kind))) errors.push("Every word needs a valid display kind.");
  if (bank.some((entry) => entry.isDecoy && answer.some((word) => String(word).toUpperCase() === String(entry.word).toUpperCase()))) errors.push("Decoys cannot appear in the answer.");
  const answerText = answer.join(" ").toUpperCase();
  if (Array.isArray(puzzle.hints) && puzzle.hints.some((hint) => String(hint).toUpperCase().includes(answerText))) errors.push("Hints cannot quote the full answer.");
  if (Array.isArray(puzzle.coda) && puzzle.coda.some((line) => String(line).toUpperCase().includes(answerText))) errors.push("Coda sentences cannot contain the full answer.");
  if (!Number.isInteger(puzzle.guessesAllowed) || (puzzle.guessesAllowed ?? 0) < 1 || (puzzle.guessesAllowed ?? 0) > 10) errors.push("Guess allowance must be between 1 and 10.");
  return errors;
}

export function isNearMiss(feedback: readonly Feedback[]): boolean {
  return feedback.filter((value) => value !== "gray").length >= 2;
}
