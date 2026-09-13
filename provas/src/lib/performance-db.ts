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

let diagnosisSnapshotsTableEnsured = false;

// Um ponto por diagnóstico gerado (no máximo 1 por conta por dia — ver
// /api/diagnosis-history), usado pra montar o gráfico de evolução do
// F3Provas+. Guarda só o resumo geral; o detalhamento por assunto de cada
// snapshot pode ser recalculado a partir de answer_attempts se um dia for
// necessário, então não duplicamos isso aqui.
export async function ensureDiagnosisSnapshotsTable() {
  if (diagnosisSnapshotsTableEnsured) return;
  await sql`
    create table if not exists diagnosis_snapshots (
      id text primary key,
      account_key text not null,
      period text not null,
      total_answered int not null,
      total_correct int not null,
      overall_accuracy int not null,
      created_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists diagnosis_snapshots_account_idx on diagnosis_snapshots (account_key, created_at)`;
  diagnosisSnapshotsTableEnsured = true;
}

export const PERIOD_TO_INTERVAL: Record<string, string> = {
  "24h": "24 hours",
  "7d": "7 days",
  "30d": "30 days",
};
