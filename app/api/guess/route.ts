import { NextRequest, NextResponse } from "next/server";
import { evaluateGuess, isNearMiss } from "@/lib/game";
import { puzzleForDate, utcToday } from "@/lib/puzzles";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const date = typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : utcToday();
    const puzzle = puzzleForDate(date);
    const guess = body.guess;
    const guessNumber = Number(body.guessNumber);
    if (!Array.isArray(guess) || guess.length !== 6 || guess.some((word) => typeof word !== "string")) {
      return NextResponse.json({ error: "A guess needs six words." }, { status: 400 });
    }
    const vocabulary = new Set([...puzzle.bank.map((entry) => entry.word), ...puzzle.bespoke.map((entry) => entry.word), ...["LOOK", "LISTEN", "EXAMINE", "TAKE", "USE", "OPEN", "CLOSE", "TURN", "PUSH", "PULL"]]);
    if (guess.some((word: string) => !vocabulary.has(word))) return NextResponse.json({ error: "Choose words from today's word set." }, { status: 400 });
    if (!Number.isInteger(guessNumber) || guessNumber < 1 || guessNumber > puzzle.guessesAllowed) return NextResponse.json({ error: "Invalid guess number." }, { status: 400 });

    const feedback = evaluateGuess(guess, puzzle.answer);
    const solved = feedback.every((tile) => tile === "green");
    const failed = !solved && guessNumber === puzzle.guessesAllowed;
    const response: Record<string, unknown> = { feedback, solved, failed, winText: solved ? puzzle.winText : undefined };
    if (solved || failed) {
      response.reveal = {
        answer: puzzle.answer,
        decoys: puzzle.bank.filter((entry) => entry.isDecoy).map((entry) => entry.word),
        ...(solved ? { coda: puzzle.coda } : {}),
      };
    }
    const crumbsSeen = Math.max(0, Number(body.crumbsSeen) || 0);
    if (!solved && (isNearMiss(feedback) || failed) && crumbsSeen < puzzle.coda.length - 1) {
      response.crumb = puzzle.coda[crumbsSeen];
    }
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Could not read that guess." }, { status: 400 });
  }
}
