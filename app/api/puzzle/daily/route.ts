import { NextRequest, NextResponse } from "next/server";
import { publicPuzzle, puzzleForDate, utcToday } from "@/lib/puzzles";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get("date") ?? utcToday();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(requested) ? requested : utcToday();
  return NextResponse.json({ date, puzzle: publicPuzzle(puzzleForDate(date)) });
}
