import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { sql } from "@vercel/postgres";

let tablesEnsured = false;

export async function ensureAuthTables() {
  if (tablesEnsured) return;
  await sql`
    create table if not exists users (
      id text primary key,
      first_name text not null,
      last_name text not null,
      email text not null unique,
      phone text not null,
      state text not null,
      city text not null,
      password_hash text not null,
      password_salt text not null,
      created_at timestamptz not null default now()
    )
  `;
  await sql`
    create table if not exists sessions (
      token text primary key,
      user_id text not null references users (id) on delete cascade,
      created_at timestamptz not null default now(),
      expires_at timestamptz not null
    )
  `;
  await sql`create index if not exists sessions_user_id_idx on sessions (user_id)`;
  await sql`
    create table if not exists signup_codes (
      email text primary key,
      code text not null,
      payload jsonb not null,
      attempts int not null default 0,
      expires_at timestamptz not null,
      created_at timestamptz not null default now()
    )
  `;
  tablesEnsured = true;
}

export const SIGNUP_CODE_TTL_MINUTES = 10;
export const SIGNUP_CODE_MAX_ATTEMPTS = 5;

export function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string) {
  const candidate = scryptSync(password, salt, 64);
  const stored = Buffer.from(hash, "hex");
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
}

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

export const SESSION_DAYS = 90;
