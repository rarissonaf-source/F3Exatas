import { sql } from "@vercel/postgres";

let tablesEnsured = false;

export async function ensurePerformanceTables() {
  if (tablesEnsured) return;
  await sql`
    create table if not exists answer_attempts (
      id text primary key,
      account_key text not null,
      institution text not null,
      discipline text not null,
      topic text not null,
      question_id text not null,
      is_correct boolean not null,
      answered_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists answer_attempts_account_idx on answer_attempts (account_key, answered_at)`;
  tablesEnsured = true;
}

// Mesma allowlist usada em auth-gate.js/.tsx (window.F3Exatas.hasCourseAccess) —
// esses e-mails sempre têm acesso ao painel de desempenho, independente de plano.
export const PERFORMANCE_ADMIN_EMAILS = ["rarissonaf@gmail.com", "cerqueirasidney@gmail.com"];

let profilesPlusColumnEnsured = false;

/** A coluna vive na tabela `profiles` (compartilhada com hub + F3Provas) pra já existir quando o F3Provas+ for vendido de verdade. */
export async function ensureProfilesPlusColumn() {
  if (profilesPlusColumnEnsured) return;
  await sql`alter table profiles add column if not exists has_provas_plus boolean not null default false`;
  profilesPlusColumnEnsured = true;
}

/** Gera diagnóstico é exclusivo de admins ou de quem tem o F3Provas+ — checado sempre no servidor, nunca só no cliente. */
export async function hasPerformanceAccess(accountKey: string): Promise<boolean> {
  const normalized = accountKey.trim().toLowerCase();
  if (PERFORMANCE_ADMIN_EMAILS.includes(normalized)) return true;

  await ensureProfilesPlusColumn();
  const { rows } = await sql`select has_provas_plus from profiles where account_key = ${accountKey}`;
  return rows.length > 0 && rows[0].has_provas_plus === true;
}

export const PERIOD_TO_INTERVAL: Record<string, string> = {
  "24h": "24 hours",
  "7d": "7 days",
  "30d": "30 days",
};
