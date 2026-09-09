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
// enquanto não existe um sistema de planos de verdade, só esses e-mails têm
// acesso ao painel de desempenho. As respostas de todo mundo continuam sendo
// registradas normalmente, pra já existir histórico quando o plano for lançado.
export const PERFORMANCE_ADMIN_EMAILS = ["rarissonaf@gmail.com", "cerqueirasidney@gmail.com"];

export function hasPerformanceAccess(email: string) {
  return PERFORMANCE_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export const PERIOD_TO_INTERVAL: Record<string, string> = {
  "24h": "24 hours",
  "7d": "7 days",
  "30d": "30 days",
};
