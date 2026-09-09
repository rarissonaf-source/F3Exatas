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

/** Apaga todo o histórico de respostas dessa conta (sem volta). */
export async function clearAttempts(): Promise<boolean> {
  const accountKey = getCurrentAccountKey();
  try {
    const res = await fetch(`${BASE_PATH}/api/attempts/clear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountKey }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Abaixo do que isso de questões respondidas no período, o diagnóstico sugere
// responder mais em vez de tentar tirar conclusões de uma amostra pequena.
export const DIAGNOSIS_MIN_QUESTIONS = 20;
// Um assunto só entra como "ponto forte"/"ponto fraco" se tiver pelo menos
// essa quantidade de respostas — evita destacar um assunto injustamente com
// base numa ou duas questões.
const HIGHLIGHT_MIN_SAMPLE = 3;

export function pickHighlights(byTopic: TopicPerformance[]): {
  strongest: TopicPerformance | null;
  weakest: TopicPerformance | null;
} {
  const eligible = byTopic.filter((t) => t.total >= HIGHLIGHT_MIN_SAMPLE);
  if (eligible.length === 0) return { strongest: null, weakest: null };

  const sorted = [...eligible].sort((a, b) => b.accuracy - a.accuracy);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  // Só faz sentido mostrar os dois se forem assuntos diferentes.
  return {
    strongest,
    weakest: weakest.topic === strongest.topic && weakest.discipline === strongest.discipline ? null : weakest,
  };
}
