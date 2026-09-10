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

export const PERIOD_TO_INTERVAL: Record<string, string> = {
  "24h": "24 hours",
  "7d": "7 days",
  "30d": "30 days",
};
