"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  fetchPerformanceSummary,
  clearAttempts,
  pickHighlights,
  DIAGNOSIS_MIN_QUESTIONS,
  type Period,
  type PerformanceSummary,
  type TopicPerformance,
} from "@/lib/performance";
import { getTopicsForDiscipline } from "@/lib/topics";

const DISCIPLINE_NAMES: Record<string, string> = { fisica: "Física", matematica: "Matemática" };

const PERIOD_OPTIONS: { value: Period; label: string; nounLabel: string }[] = [
  { value: "24h", label: "Últimas 24h", nounLabel: "nas últimas 24h" },
  { value: "7d", label: "Últimos 7 dias", nounLabel: "nos últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias", nounLabel: "nos últimos 30 dias" },
];

function topicName(discipline: string, slug: string) {
  return getTopicsForDiscipline(discipline).find((t) => t.slug === slug)?.name ?? slug;
}

function topicLabel(t: TopicPerformance) {
  return `${topicName(t.discipline, t.topic)} (${DISCIPLINE_NAMES[t.discipline] ?? t.discipline})`;
}

function accuracyBadgeClass(accuracy: number) {
  if (accuracy >= 70) return "bg-emerald-100 text-emerald-700";
  if (accuracy >= 40) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-600";
}

export function DiagnosisPanel() {
  const [period, setPeriod] = useState<Period>("7d");
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchPerformanceSummary(period)
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [period]);

  async function handleClear() {
    setClearing(true);
    const ok = await clearAttempts();
    setClearing(false);
    setConfirmingClear(false);
    if (ok) {
      setSummary({ period, totalAnswered: 0, totalCorrect: 0, totalWrong: 0, overallAccuracy: 0, byTopic: [] });
    }
  }

  const periodOption = PERIOD_OPTIONS.find((p) => p.value === period)!;
  const byDiscipline = (summary?.byTopic ?? []).reduce<Record<string, TopicPerformance[]>>((acc, t) => {
    (acc[t.discipline] ??= []).push(t);
    return acc;
  }, {});
  const { strongest, weakest } = summary ? pickHighlights(summary.byTopic) : { strongest: null, weakest: null };
  const hasEnoughData = (summary?.totalAnswered ?? 0) >= DIAGNOSIS_MIN_QUESTIONS;

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {PERIOD_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={period === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      {!loading && summary && summary.totalAnswered === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhuma questão respondida {periodOption.nounLabel} ainda. Responda algumas questões e volte aqui.
        </p>
      )}

      {!loading && summary && summary.totalAnswered > 0 && !hasEnoughData && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-heading text-sm font-bold text-amber-800">
            Você respondeu {summary.totalAnswered} de {DIAGNOSIS_MIN_QUESTIONS} questões {periodOption.nounLabel}.
          </p>
          <p className="mt-1 text-sm text-amber-700">
            Responda mais {DIAGNOSIS_MIN_QUESTIONS - summary.totalAnswered} pra gerar um diagnóstico completo.
          </p>
        </div>
      )}

      {!loading && summary && summary.totalAnswered > 0 && hasEnoughData && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-5">
          <p className="font-heading text-base font-bold text-foreground">
            Você respondeu {summary.totalAnswered} questões {periodOption.nounLabel}, acertando{" "}
            {summary.overallAccuracy}%.
          </p>
          {strongest && (
            <p className="mt-2 text-sm text-foreground">
              🟢 <span className="font-semibold">Seu ponto forte:</span> {topicLabel(strongest)} — {strongest.correct}{" "}
              acertos em {strongest.total} ({strongest.accuracy}%)
            </p>
          )}
          {weakest && (
            <p className="mt-1 text-sm text-foreground">
              🔴 <span className="font-semibold">Você precisa reforçar:</span> {topicLabel(weakest)} —{" "}
              {weakest.correct} acertos em {weakest.total} ({weakest.accuracy}%)
            </p>
          )}
        </div>
      )}

      {!loading && summary && summary.totalAnswered > 0 && (
        <>
          {Object.entries(byDiscipline).map(([discipline, topics]) => {
            const sorted = [...topics].sort((a, b) => a.accuracy - b.accuracy);
            return (
              <div key={discipline} className="mb-6">
                <h2 className="mb-3 font-heading text-base font-bold text-foreground">
                  {DISCIPLINE_NAMES[discipline] ?? discipline}
                </h2>
                <div className="flex flex-col gap-2">
                  {sorted.map((t) => (
                    <div
                      key={t.topic}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-heading text-sm font-semibold text-foreground">
                          {topicName(t.discipline, t.topic)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t.correct} acertos · {t.wrong} erros · {t.total} respondidas
                        </div>
                      </div>
                      <div className={`shrink-0 rounded-full px-3 py-1 font-heading text-sm font-bold ${accuracyBadgeClass(t.accuracy)}`}>
                        {t.accuracy}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="mt-8 border-t border-border pt-5">
            {!confirmingClear ? (
              <button
                type="button"
                onClick={() => setConfirmingClear(true)}
                className="text-sm font-semibold text-muted-foreground underline-offset-2 hover:text-red-600 hover:underline"
              >
                Limpar estatísticas
              </button>
            ) : (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Isso apaga todo o histórico de respostas dessa conta, sem volta. Tem certeza?
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="destructive" size="sm" onClick={handleClear} disabled={clearing}>
                    {clearing ? "Limpando..." : "Sim, limpar tudo"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirmingClear(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
