import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "violet-project-portal",
    checkedAt: new Date().toISOString(),
  });
}
