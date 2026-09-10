import { sql } from "@vercel/postgres";

// Mesma allowlist usada em auth-gate.js/.tsx (window.F3Exatas.hasCourseAccess) —
// esses e-mails sempre têm acesso a qualquer recurso do F3Provas+ (diagnóstico
// de desempenho, PDF de resolução, etc.), independente de plano.
export const PROVAS_PLUS_ADMIN_EMAILS = ["rarissonaf@gmail.com", "cerqueirasidney@gmail.com"];

let profilesPlusColumnEnsured = false;

/** A coluna vive na tabela `profiles` (compartilhada com hub + F3Provas) pra já existir quando o F3Provas+ for vendido de verdade. */
export async function ensureProfilesPlusColumn() {
  if (profilesPlusColumnEnsured) return;
  await sql`alter table profiles add column if not exists has_provas_plus boolean not null default false`;
  profilesPlusColumnEnsured = true;
}

/** Checa acesso a um recurso exclusivo do F3Provas+ — sempre confirmado no servidor, nunca só no cliente. */
export async function hasProvasPlusAccess(accountKey: string): Promise<boolean> {
  const normalized = accountKey.trim().toLowerCase();
  if (PROVAS_PLUS_ADMIN_EMAILS.includes(normalized)) return true;

  await ensureProfilesPlusColumn();
  const { rows } = await sql`select has_provas_plus from profiles where account_key = ${accountKey}`;
  return rows.length > 0 && rows[0].has_provas_plus === true;
}
