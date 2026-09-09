import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import {
  ensureAuthTables,
  hashPassword,
  generateVerificationCode,
  SIGNUP_CODE_TTL_MINUTES,
} from "@/lib/auth";
import { sendSignupCodeEmail } from "@/lib/email";

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
  const payload = { firstName, lastName, phone, state, city, passwordHash: hash, passwordSalt: salt };
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + SIGNUP_CODE_TTL_MINUTES * 60 * 1000).toISOString();

  try {
    await sendSignupCodeEmail(email, code);
  } catch (err) {
    console.error("Falha ao enviar código de verificação:", err);
    return NextResponse.json(
      { error: "Não foi possível enviar o e-mail de verificação. Tente novamente em instantes." },
      { status: 502 }
    );
  }

  await sql`
    insert into signup_codes (email, code, payload, attempts, expires_at)
    values (${email}, ${code}, ${JSON.stringify(payload)}, 0, ${expiresAt})
    on conflict (email) do update set
      code = excluded.code,
      payload = excluded.payload,
      attempts = 0,
      expires_at = excluded.expires_at,
      created_at = now()
  `;

  return NextResponse.json({ ok: true });
}
