import { BASE_PATH } from "./base-path";
import { getCurrentAccountKey } from "./account";

export type Period = "24h" | "7d" | "30d";

// Mesma allowlist do servidor (src/lib/performance-db.ts) e do resto do site
// (auth-gate.js/.tsx) — duplicada aqui só pra checagem client-side de exibir
// ou não o link/página; o servidor sempre reconfirma no /api/attempts/summary.
const PERFORMANCE_ADMIN_EMAILS = ["rarissonaf@gmail.com", "cerqueirasidney@gmail.com"];

export function hasPerformanceAccess(email: string) {
  return PERFORMANCE_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export interface TopicPerformance {
  discipline: string;
  topic: string;
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
}

export interface PerformanceSummary {
  period: Period;
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  overallAccuracy: number;
  byTopic: TopicPerformance[];
}

/** Registra uma resposta verificada — best-effort, nunca interrompe a experiência do usuário. */
export function logAttempt(params: {
  institution: string;
  discipline: string;
  topic: string;
  questionId: string;
  isCorrect: boolean;
}) {
  const accountKey = getCurrentAccountKey();
  fetch(`${BASE_PATH}/api/attempts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountKey, ...params }),
  }).catch(() => {
    /* sem conexão: perde esse registro, sem travar a experiência */
  });
}

export async function fetchPerformanceSummary(period: Period): Promise<PerformanceSummary | null> {
  const accountKey = getCurrentAccountKey();
  try {
    const res = await fetch(
      `${BASE_PATH}/api/attempts/summary?accountKey=${encodeURIComponent(accountKey)}&period=${period}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
