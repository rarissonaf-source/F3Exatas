import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { randomUUID } from "node:crypto";
import { ensureAuthTables, generateSessionToken, SESSION_DAYS, SIGNUP_CODE_MAX_ATTEMPTS } from "@/lib/auth";

interface SignupPayload {
  firstName: string;
  lastName: string;
  phone: string;
  state: string;
  city: string;
  passwordHash: string;
  passwordSalt: string;
}

export async function POST(req: NextRequest) {
  await ensureAuthTables();

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";

  if (!email || !code) {
    return NextResponse.json({ error: "Informe o e-mail e o código." }, { status: 400 });
  }

  const { rows } = await sql`select code, payload, attempts, expires_at from signup_codes where email = ${email}`;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Código não encontrado. Solicite um novo." }, { status: 404 });
  }

  const row = rows[0];

  if (new Date(row.expires_at as string).getTime() < Date.now()) {
    await sql`delete from signup_codes where email = ${email}`;
    return NextResponse.json({ error: "Código expirado. Solicite um novo." }, { status: 410 });
  }

  if ((row.attempts as number) >= SIGNUP_CODE_MAX_ATTEMPTS) {
    await sql`delete from signup_codes where email = ${email}`;
    return NextResponse.json({ error: "Muitas tentativas. Solicite um novo código." }, { status: 429 });
  }

  if (row.code !== code) {
    await sql`update signup_codes set attempts = attempts + 1 where email = ${email}`;
    return NextResponse.json({ error: "Código incorreto." }, { status: 401 });
  }

  const { rows: existing } = await sql`select id from users where email = ${email}`;
  if (existing.length > 0) {
    await sql`delete from signup_codes where email = ${email}`;
    return NextResponse.json({ error: "Já existe uma conta com esse e-mail." }, { status: 409 });
  }

  const payload = row.payload as SignupPayload;
  const id = randomUUID();

  await sql`
    insert into users (id, first_name, last_name, email, phone, state, city, password_hash, password_salt)
    values (${id}, ${payload.firstName}, ${payload.lastName}, ${email}, ${payload.phone}, ${payload.state}, ${payload.city}, ${payload.passwordHash}, ${payload.passwordSalt})
  `;

  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await sql`insert into sessions (token, user_id, expires_at) values (${token}, ${id}, ${expiresAt})`;

  await sql`delete from signup_codes where email = ${email}`;

  return NextResponse.json({
    token,
    name: `${payload.firstName} ${payload.lastName}`,
    email,
    phone: payload.phone,
  });
}
