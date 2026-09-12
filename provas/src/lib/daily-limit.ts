const ANSWER_LOG_KEY = "f3provas_daily_answers";
const DAY_MS = 24 * 60 * 60 * 1000;

// Contas sem F3Provas+ só podem verificar essa quantidade de respostas por
// dia — mesmo número mínimo exigido pra gerar um diagnóstico
// (DIAGNOSIS_MIN_QUESTIONS em performance.ts), de propósito: quem esbarra
// no limite já tem dado suficiente pra ver um diagnóstico completo.
export const DAILY_ANSWER_LIMIT = 20;

function readLog(): number[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ANSWER_LOG_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function pruneLog(log: number[]): number[] {
  const now = Date.now();
  return log.filter((t) => now - t < DAY_MS);
}

/** Quantas respostas essa conta já verificou nas últimas 24h. */
export function getAnswersToday(): number {
  return pruneLog(readLog()).length;
}

/** Registra mais uma resposta verificada no contador diário. */
export function recordDailyAnswer() {
  if (typeof window === "undefined") return;
  const log = pruneLog(readLog());
  log.push(Date.now());
  localStorage.setItem(ANSWER_LOG_KEY, JSON.stringify(log));
}
