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
  // Colunas por disciplina, adicionadas depois da criação inicial da tabela —
  // ficam nulas quando o período não teve nenhuma questão respondida daquela
  // disciplina, pra distinguir de "respondeu e zerou".
  await sql`alter table diagnosis_snapshots add column if not exists matematica_answered int`;
  await sql`alter table diagnosis_snapshots add column if not exists matematica_accuracy int`;
  await sql`alter table diagnosis_snapshots add column if not exists fisica_answered int`;
  await sql`alter table diagnosis_snapshots add column if not exists fisica_accuracy int`;
  diagnosisSnapshotsTableEnsured = true;
}

// Cadência do diagnóstico: um novo só conta como "novo diagnóstico" (gera um
// ponto no gráfico de evolução) depois de pelo menos 24h desde o anterior. O
// resumo em si (attempts/summary) sempre olha só pras respostas depois do
// último diagnóstico salvo — nunca uma janela fixa de dias — pra cada ponto
// do gráfico refletir só o que é novo desde a última vez.
export const DIAGNOSIS_COOLDOWN_HOURS = 24;

export interface DiagnosisEligibility {
  /** ISO da criação do último diagnóstico salvo, ou null se essa conta nunca gerou um. */
  sinceDiagnosisAt: string | null;
  /** Se true, ainda não passaram as DIAGNOSIS_COOLDOWN_HOURS desde o último diagnóstico. */
  cooldownActive: boolean;
  /** ISO de quando o cooldown termina, ou null se não há diagnóstico anterior. */
  cooldownEndsAt: string | null;
}

/** Busca o último diagnóstico salvo da conta e calcula se o cooldown de DIAGNOSIS_COOLDOWN_HOURS ainda está ativo. Contas admin nunca ficam em cooldown (usado pra testar sem esperar 24h). */
export async function getDiagnosisEligibility(accountKey: string, isAdmin: boolean): Promise<DiagnosisEligibility> {
  await ensureDiagnosisSnapshotsTable();

  const { rows } = await sql`
    select created_at from diagnosis_snapshots
    where account_key = ${accountKey}
    order by created_at desc
    limit 1
  `;
  const lastAt = (rows[0]?.created_at as Date | undefined) ?? null;
  if (!lastAt) return { sinceDiagnosisAt: null, cooldownActive: false, cooldownEndsAt: null };

  const cooldownEndsAt = new Date(lastAt.getTime() + DIAGNOSIS_COOLDOWN_HOURS * 60 * 60 * 1000);
  return {
    sinceDiagnosisAt: lastAt.toISOString(),
    cooldownActive: !isAdmin && cooldownEndsAt.getTime() > Date.now(),
    cooldownEndsAt: cooldownEndsAt.toISOString(),
  };
}
