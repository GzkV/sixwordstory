import { NextRequest, NextResponse } from "next/server";
import { validatePuzzle } from "@/lib/game";

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({ errors: validatePuzzle(await request.json()) });
  } catch {
    return NextResponse.json({ errors: ["Request must contain valid puzzle JSON."] }, { status: 400 });
  }
}
