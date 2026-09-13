import { BASE_PATH } from "./base-path";
import { getCurrentAccountKey } from "./account";

export interface TopicPerformance {
  discipline: string;
  topic: string;
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
}

export interface PerformanceSummary {
  // Sempre "desde o último diagnóstico salvo" — nunca uma janela fixa de
  // dias. null quando essa conta ainda não gerou nenhum diagnóstico (nesse
  // caso o resumo cobre tudo que já foi respondido).
  sinceDiagnosisAt: string | null;
  // true enquanto não passam DIAGNOSIS_COOLDOWN_HOURS desde o diagnóstico
  // anterior — o painel deve bloquear a geração de um novo e explicar o motivo.
  cooldownActive: boolean;
  cooldownEndsAt: string | null;
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  overallAccuracy: number;
  byTopic: TopicPerformance[];
}

export interface DiagnosisSnapshot {
  totalAnswered: number;
  totalCorrect: number;
  overallAccuracy: number;
  // null quando a disciplina não teve nenhuma questão respondida no período
  // desse diagnóstico — distingue de "respondeu e zerou" (accuracy 0).
  matematicaAnswered: number | null;
  matematicaAccuracy: number | null;
  fisicaAnswered: number | null;
  fisicaAccuracy: number | null;
  createdAt: string;
}

/** Soma total/correto de todos os tópicos de uma disciplina — usado pra montar o snapshot salvo no histórico. */
function accuracyForDiscipline(byTopic: TopicPerformance[], discipline: string): { answered: number; accuracy: number } | null {
  const topics = byTopic.filter((t) => t.discipline === discipline);
  const answered = topics.reduce((acc, t) => acc + t.total, 0);
  if (answered === 0) return null;
  const correct = topics.reduce((acc, t) => acc + t.correct, 0);
  return { answered, accuracy: Math.round((correct / answered) * 100) };
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

export async function fetchPerformanceSummary(): Promise<PerformanceSummary | null> {
  const accountKey = getCurrentAccountKey();
  try {
    const res = await fetch(`${BASE_PATH}/api/attempts/summary?accountKey=${encodeURIComponent(accountKey)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Registra um ponto no histórico de diagnósticos (gráfico de evolução do
 * F3Provas+), no máximo um por conta a cada DIAGNOSIS_COOLDOWN_HOURS — o
 * servidor reconfirma o cooldown e ignora silenciosamente (`saved: false`)
 * se ele ainda estiver ativo.
 */
export async function saveDiagnosisSnapshot(summary: PerformanceSummary): Promise<boolean> {
  const accountKey = getCurrentAccountKey();
  const matematica = accuracyForDiscipline(summary.byTopic, "matematica");
  const fisica = accuracyForDiscipline(summary.byTopic, "fisica");
  try {
    const res = await fetch(`${BASE_PATH}/api/diagnosis-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountKey,
        totalAnswered: summary.totalAnswered,
        totalCorrect: summary.totalCorrect,
        overallAccuracy: summary.overallAccuracy,
        matematicaAnswered: matematica?.answered ?? null,
        matematicaAccuracy: matematica?.accuracy ?? null,
        fisicaAnswered: fisica?.answered ?? null,
        fisicaAccuracy: fisica?.accuracy ?? null,
      }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data?.saved);
  } catch {
    return false;
  }
}

/** Histórico de diagnósticos já salvos dessa conta, do mais antigo pro mais recente — para o gráfico de evolução. */
export async function fetchDiagnosisHistory(): Promise<DiagnosisSnapshot[]> {
  const accountKey = getCurrentAccountKey();
  try {
    const res = await fetch(`${BASE_PATH}/api/diagnosis-history?accountKey=${encodeURIComponent(accountKey)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.snapshots) ? data.snapshots : [];
  } catch {
    return [];
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

// O último diagnóstico gerado fica salvo por conta, pra continuar visível ao
// reabrir a página em vez de sumir e pedir pra gerar de novo — só some quando
// o usuário gera outro ou limpa as estatísticas.
const DIAGNOSIS_CACHE_KEY = "f3_last_diagnosis";

interface CachedDiagnosis {
  summary: PerformanceSummary;
}

export function getCachedDiagnosis(): CachedDiagnosis | null {
  if (typeof window === "undefined") return null;
  try {
    const all = JSON.parse(localStorage.getItem(DIAGNOSIS_CACHE_KEY) || "{}") || {};
    return all[getCurrentAccountKey()] ?? null;
  } catch {
    return null;
  }
}

export function setCachedDiagnosis(entry: CachedDiagnosis) {
  if (typeof window === "undefined") return;
  try {
    const all = JSON.parse(localStorage.getItem(DIAGNOSIS_CACHE_KEY) || "{}") || {};
    all[getCurrentAccountKey()] = entry;
    localStorage.setItem(DIAGNOSIS_CACHE_KEY, JSON.stringify(all));
  } catch {
    /* localStorage indisponível: só perde a persistência entre visitas */
  }
}

export function clearCachedDiagnosis() {
  if (typeof window === "undefined") return;
  try {
    const all = JSON.parse(localStorage.getItem(DIAGNOSIS_CACHE_KEY) || "{}") || {};
    delete all[getCurrentAccountKey()];
    localStorage.setItem(DIAGNOSIS_CACHE_KEY, JSON.stringify(all));
  } catch {
    /* ignora */
  }
}

// Abaixo do que isso de questões novas respondidas desde o diagnóstico
// anterior (ou desde sempre, no primeiro diagnóstico da conta), a geração
// fica bloqueada e o painel sugere responder mais em vez de tirar conclusões
// de uma amostra pequena.
export const DIAGNOSIS_MIN_QUESTIONS = 20;
// Um assunto só entra como "ponto forte"/"ponto fraco" se tiver pelo menos
// essa quantidade de respostas — evita destacar um assunto injustamente com
// base numa ou duas questões.
const HIGHLIGHT_MIN_SAMPLE = 3;

// Mesmos limiares usados em accuracyBadgeClass/performanceTier (diagnosis-panel.tsx):
// só faz sentido chamar um assunto de "ponto forte" se o desempenho nele já
// está pelo menos na faixa "bom" (>=60%) — do contrário estaríamos rotulando
// como forte o assunto menos ruim de um desempenho geral fraco (ex.: 21%).
// Da mesma forma, só rotulamos "ponto a melhorar" se ainda não está excelente.
const STRONG_POINT_MIN_ACCURACY = 60;
const WEAK_POINT_MAX_ACCURACY = 80;

export function pickHighlights(byTopic: TopicPerformance[]): {
  strongest: TopicPerformance | null;
  weakest: TopicPerformance | null;
} {
  const eligible = byTopic.filter((t) => t.total >= HIGHLIGHT_MIN_SAMPLE);
  if (eligible.length === 0) return { strongest: null, weakest: null };

  const sorted = [...eligible].sort((a, b) => b.accuracy - a.accuracy);
  const strongestCandidate = sorted[0];
  const weakestCandidate = sorted[sorted.length - 1];

  const strongest = strongestCandidate.accuracy >= STRONG_POINT_MIN_ACCURACY ? strongestCandidate : null;
  const weakestRaw = weakestCandidate.accuracy < WEAK_POINT_MAX_ACCURACY ? weakestCandidate : null;
  // Só faz sentido mostrar os dois se forem assuntos diferentes.
  const weakest =
    weakestRaw && strongest && weakestRaw.topic === strongest.topic && weakestRaw.discipline === strongest.discipline
      ? null
      : weakestRaw;

  return { strongest, weakest };
}
