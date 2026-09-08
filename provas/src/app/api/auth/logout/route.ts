import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { ensureAuthTables } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await ensureAuthTables();

  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  if (token) {
    await sql`delete from sessions where token = ${token}`;
  }
  return NextResponse.json({ ok: true });
}
