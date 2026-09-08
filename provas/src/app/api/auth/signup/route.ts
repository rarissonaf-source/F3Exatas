import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { randomUUID } from "node:crypto";
import { ensureAuthTables, generateSessionToken, hashPassword, SESSION_DAYS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await ensureAuthTables();

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const firstName = typeof body.firstName === "string" ? body.firstName.trim().slice(0, 80) : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim().slice(0, 80) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : "";
  const state = typeof body.state === "string" ? body.state.trim().slice(0, 2).toUpperCase() : "";
  const city = typeof body.city === "string" ? body.city.trim().slice(0, 120) : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!firstName || !lastName || !email || !phone || !state || !city || !password) {
    return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "A senha precisa ter pelo menos 8 caracteres." }, { status: 400 });
  }

  const { rows: existing } = await sql`select id from users where email = ${email}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "Já existe uma conta com esse e-mail." }, { status: 409 });
  }

  const { hash, salt } = hashPassword(password);
  const id = randomUUID();

  await sql`
    insert into users (id, first_name, last_name, email, phone, state, city, password_hash, password_salt)
    values (${id}, ${firstName}, ${lastName}, ${email}, ${phone}, ${state}, ${city}, ${hash}, ${salt})
  `;

  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await sql`insert into sessions (token, user_id, expires_at) values (${token}, ${id}, ${expiresAt})`;

  return NextResponse.json({ token, name: `${firstName} ${lastName}`, email, phone });
}
