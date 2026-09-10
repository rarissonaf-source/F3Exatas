// Mesma allowlist do servidor (src/lib/provas-plus.ts) e do resto do site
// (auth-gate.js/.tsx) — duplicada aqui só pra checagem client-side de exibir
// ou não a ação (gerar diagnóstico, baixar PDF); o servidor sempre reconfirma.
const PROVAS_PLUS_ADMIN_EMAILS = ["rarissonaf@gmail.com", "cerqueirasidney@gmail.com"];

/** Checa, no cliente, se a conta tem acesso a um recurso exclusivo do F3Provas+ (diagnóstico, PDF, etc.). */
export function hasProvasPlusAccess(email: string, hasProvasPlus: boolean) {
  return PROVAS_PLUS_ADMIN_EMAILS.includes(email.trim().toLowerCase()) || hasProvasPlus;
}
