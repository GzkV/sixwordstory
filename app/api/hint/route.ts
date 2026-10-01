import { NextRequest, NextResponse } from "next/server";
import { puzzleForDate, utcToday } from "@/lib/puzzles";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const date = typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : utcToday();
    const puzzle = puzzleForDate(date);
    const hintIndex = Number(body.hintIndex);
    if (!Number.isInteger(hintIndex) || hintIndex < 0 || hintIndex >= puzzle.hints.length) {
      return NextResponse.json({ error: "No more hints are available." }, { status: 400 });
    }
    return NextResponse.json({ hint: puzzle.hints[hintIndex] });
  } catch {
    return NextResponse.json({ error: "Could not load a hint." }, { status: 400 });
  }
}
