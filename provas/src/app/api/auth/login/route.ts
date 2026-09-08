import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { ensureAuthTables, generateSessionToken, SESSION_DAYS, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await ensureAuthTables();

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });
  }

  const { rows } = await sql`
    select id, first_name, last_name, phone, password_hash, password_salt
    from users where email = ${email}
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  }

  const user = rows[0];
  if (!verifyPassword(password, user.password_hash, user.password_salt)) {
    return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  }

  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await sql`insert into sessions (token, user_id, expires_at) values (${token}, ${user.id}, ${expiresAt})`;

  return NextResponse.json({
    token,
    name: `${user.first_name} ${user.last_name}`,
    email,
    phone: user.phone,
  });
}
