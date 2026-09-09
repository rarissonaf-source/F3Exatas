import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { ensurePerformanceTables } from "@/lib/performance-db";

export async function POST(req: NextRequest) {
  await ensurePerformanceTables();

  const body = await req.json().catch(() => null);
  const accountKey = typeof body?.accountKey === "string" ? body.accountKey.trim() : "";

  if (!accountKey) {
    return NextResponse.json({ error: "accountKey obrigatório." }, { status: 400 });
  }

  await sql`delete from answer_attempts where account_key = ${accountKey}`;

  return NextResponse.json({ ok: true });
}
