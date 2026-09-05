import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(req: NextRequest) {
  const accountKey = req.nextUrl.searchParams.get("accountKey") || "";
  if (!accountKey) return NextResponse.json([]);

  const { rows } = await sql`
    select id, name, question_ids from question_lists
    where account_key = ${accountKey}
    order by name asc
  `;

  return NextResponse.json(
    rows.map((r) => ({ id: r.id, name: r.name, questionIds: r.question_ids || [] }))
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const accountKey = typeof body.accountKey === "string" ? body.accountKey.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";

  if (!accountKey || !name) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const id = `list-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  await sql`
    insert into question_lists (id, account_key, name, question_ids)
    values (${id}, ${accountKey}, ${name}, ${JSON.stringify([])})
  `;

  return NextResponse.json({ id, name, questionIds: [] });
}
