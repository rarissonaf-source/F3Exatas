import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

const EMPTY = { name: "", email: "", phone: "", picture: "" };

export async function GET(req: NextRequest) {
  const accountKey = req.nextUrl.searchParams.get("accountKey") || "";
  if (!accountKey) return NextResponse.json(EMPTY);

  const { rows } = await sql`
    select name, email, phone, picture from profiles where account_key = ${accountKey}
  `;

  if (rows.length === 0) return NextResponse.json(EMPTY);

  const r = rows[0];
  return NextResponse.json({ name: r.name, email: r.email, phone: r.phone, picture: r.picture });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const accountKey = typeof body.accountKey === "string" ? body.accountKey.trim() : "";
  if (!accountKey) {
    return NextResponse.json({ error: "accountKey obrigatório." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : "";
  const picture = typeof body.picture === "string" ? body.picture.slice(0, 2_000_000) : "";

  await sql`
    insert into profiles (account_key, name, email, phone, picture, updated_at)
    values (${accountKey}, ${name}, ${email}, ${phone}, ${picture}, now())
    on conflict (account_key) do update set
      name = excluded.name,
      email = excluded.email,
      phone = excluded.phone,
      picture = excluded.picture,
      updated_at = now()
  `;

  return NextResponse.json({ name, email, phone, picture });
}
