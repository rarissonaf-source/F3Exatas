"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Lock, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchPerformanceSummary,
  clearAttempts,
  pickHighlights,
  getCachedDiagnosis,
  setCachedDiagnosis,
  clearCachedDiagnosis,
  saveDiagnosisSnapshot,
  fetchDiagnosisHistory,
  isDiagnosisExplainerDismissed,
  DIAGNOSIS_MIN_QUESTIONS,
  type PerformanceSummary,
  type TopicPerformance,
  type DiagnosisSnapshot,
} from "@/lib/performance";
import { getTopicsForDiscipline } from "@/lib/topics";
import { DiagnosisHistoryChart } from "@/components/diagnosis-history-chart";
import { DiagnosisInfoDialog } from "@/components/diagnosis-info-dialog";

const DISCIPLINE_NAMES: Record<string, string> = { fisica: "Física", matematica: "Matemática" };

type DisciplineFilter = "all" | "fisica" | "matematica";

const DISCIPLINE_OPTIONS: { value: DisciplineFilter; label: string }[] = [
  { value: "all", label: "Tudo" },
  { value: "matematica", label: "Matemática" },
  { value: "fisica", label: "Física" },
];

type Mode = "idle" | "loading" | "result" | "locked" | "cooldown";

function filterSummary(summary: PerformanceSummary, filter: DisciplineFilter): PerformanceSummary {
  if (filter === "all") return summary;
  const byTopic = summary.byTopic.filter((t) => t.discipline === filter);
  const totalAnswered = byTopic.reduce((acc, t) => acc + t.total, 0);
  const totalCorrect = byTopic.reduce((acc, t) => acc + t.correct, 0);
  return {
    sinceDiagnosisAt: summary.sinceDiagnosisAt,
    cooldownActive: summary.cooldownActive,
    cooldownEndsAt: summary.cooldownEndsAt,
    byTopic,
    totalAnswered,
    totalCorrect,
    totalWrong: totalAnswered - totalCorrect,
    overallAccuracy: totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
  };
}

function topicName(discipline: string, slug: string) {
  return getTopicsForDiscipline(discipline).find((t) => t.slug === slug)?.name ?? slug;
}

function topicLabel(t: TopicPerformance) {
  return `${topicName(t.discipline, t.topic)} · ${DISCIPLINE_NAMES[t.discipline] ?? t.discipline}`;
}

// Três faixas de desempenho, usadas tanto no acerto geral quanto nos badges
// por assunto — mesmos limiares (60/80) em todo o diagnóstico.
function accuracyBadgeClass(accuracy: number) {
  if (accuracy >= 80) return "bg-emerald-100 text-emerald-700";
  if (accuracy >= 60) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-600";
}

function performanceTier(accuracy: number): { label: string; textClass: string } {
  if (accuracy >= 80) return { label: "Excelente desempenho!", textClass: "text-emerald-600" };
  if (accuracy >= 60)
    return { label: "Bom desempenho, com espaço pra evoluir ainda mais", textClass: "text-amber-600" };
  return { label: "Desempenho baixo — precisa melhorar", textClass: "text-red-500" };
}

/** "Xh Ymin" até `iso`, ou null se já passou. */
function formatCountdown(iso: string): string | null {
  const diffMs = new Date(iso).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const totalMinutes = Math.ceil(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes} min`;
  return `${hours}h ${minutes}min`;
}

export function DiagnosisPanel({ allowed }: { allowed: boolean }) {
  const [disciplineFilter, setDisciplineFilter] = useState<DisciplineFilter>("all");
  const [mode, setMode] = useState<Mode>("idle");
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [clearing, setClearing] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [history, setHistory] = useState<DiagnosisSnapshot[]>([]);
  const [infoOpen, setInfoOpen] = useState(false);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, []);

  // Carrega o histórico de diagnósticos já salvos (gráfico de evolução) assim
  // que a conta tem acesso liberado, sem depender de já ter gerado um
  // diagnóstico nesta visita.
  useEffect(() => {
    if (!allowed) return;
    fetchDiagnosisHistory().then(setHistory);
  }, [allowed]);

  // Restaura o último diagnóstico gerado por essa conta, se existir, em vez de
  // pedir pra gerar de novo toda vez que a página é reaberta.
  useEffect(() => {
    const cached = getCachedDiagnosis();
    if (cached) {
      setSummary(cached.summary);
      setMode("result");
    }
  }, []);

  // Mostra a explicação da cadência automaticamente na primeira vez que o
  // usuário esbarra em um bloqueio (cooldown ou poucas questões novas), a
  // menos que já tenha marcado "não mostrar de novo".
  function maybeAutoExplain() {
    if (!isDiagnosisExplainerDismissed()) setInfoOpen(true);
  }

  async function handleGenerate() {
    if (!allowed) {
      setMode("locked");
      return;
    }

    setMode("loading");
    setProgress(6);

    progressTimer.current = setInterval(() => {
      setProgress((p) => (p < 88 ? p + Math.random() * 14 : p));
    }, 220);

    const data = await fetchPerformanceSummary();

    if (progressTimer.current) clearInterval(progressTimer.current);
    setProgress(100);
    setSummary(data);

    if (data?.cooldownActive) {
      setTimeout(() => {
        setMode("cooldown");
        maybeAutoExplain();
      }, 350);
      return;
    }

    if (data) {
      setCachedDiagnosis({ summary: data });
      // Só registra um ponto no histórico quando o diagnóstico é confiável
      // (amostra mínima atingida) — o servidor ainda garante o cooldown de
      // 24h, então isso só evita uma chamada de rede desnecessária.
      if (data.totalAnswered >= DIAGNOSIS_MIN_QUESTIONS) {
        const saved = await saveDiagnosisSnapshot(data);
        // Refaz a busca em vez de montar a entrada localmente — evita duplicar
        // aqui a lógica de cálculo por disciplina que já vive em performance.ts.
        if (saved) setHistory(await fetchDiagnosisHistory());
      } else if (data.sinceDiagnosisAt) {
        // Só é "questões novas insuficientes" quando já existe um diagnóstico
        // anterior — no primeiro diagnóstico da conta, o mesmo limite abaixo
        // já cobre esse caso com a mensagem "não tem dados ainda".
        maybeAutoExplain();
      }
    }
    setTimeout(() => setMode("result"), 350);
  }

  async function handleClear() {
    setClearing(true);
    const ok = await clearAttempts();
    setClearing(false);
    setConfirmingClear(false);
    if (ok) {
      clearCachedDiagnosis();
      setMode("idle");
      setSummary(null);
    }
  }

  const filtered = summary ? filterSummary(summary, disciplineFilter) : null;
  const byDiscipline = (filtered?.byTopic ?? []).reduce<Record<string, TopicPerformance[]>>((acc, t) => {
    (acc[t.discipline] ??= []).push(t);
    return acc;
  }, {});
  const { strongest, weakest } = filtered ? pickHighlights(filtered.byTopic) : { strongest: null, weakest: null };
  const hasEnoughData = (filtered?.totalAnswered ?? 0) >= DIAGNOSIS_MIN_QUESTIONS;
  const isFirstDiagnosis = !summary?.sinceDiagnosisAt;
  const countdown = summary?.cooldownEndsAt ? formatCountdown(summary.cooldownEndsAt) : null;

  return (
    <div>
      <div className="mb-4 flex items-center gap-1.5">
        <p className="text-xs font-semibold text-muted-foreground">Como funciona o diagnóstico</p>
        <DiagnosisInfoDialog open={infoOpen} onOpenChange={setInfoOpen} />
      </div>

      {mode === "result" && (
        <div className="mb-6 flex flex-wrap gap-2">
          {DISCIPLINE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={disciplineFilter === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setDisciplineFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      )}

      {mode === "idle" && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <Sparkles className="mx-auto mb-3 size-8 text-cyan-600" />
          <p className="font-heading text-lg font-bold text-foreground">Pronto pra ver seu diagnóstico?</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Cruzamos suas respostas pra mostrar onde você está mandando bem e onde precisa reforçar.
          </p>
          <Button className="mt-5" onClick={handleGenerate}>
            Gerar diagnóstico
          </Button>
        </div>
      )}

      {mode === "loading" && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="font-heading text-sm font-bold text-foreground">Processando seu diagnóstico...</p>
          <div className="mx-auto mt-4 h-2.5 w-full max-w-sm overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-brand-orange transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Cruzando suas respostas por assunto...</p>
        </div>
      )}

      {mode === "locked" && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
            <Lock className="size-6" />
          </span>
          <p className="font-heading text-lg font-bold text-foreground">Esse recurso é exclusivo do F3Provas+</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            O diagnóstico de desempenho por assunto é um benefício do F3Provas+. Adquira o plano pra desbloquear o
            acompanhamento completo das suas respostas.
          </p>
        </div>
      )}

      {mode === "cooldown" && (
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-8 text-center">
          <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
            <Clock className="size-6" />
          </span>
          <p className="font-heading text-lg font-bold text-cyan-900">Seu próximo diagnóstico ainda está esquentando</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-cyan-800">
            {countdown
              ? `Você poderá gerar um novo diagnóstico em ${countdown}.`
              : "Já pode gerar um novo diagnóstico — tente de novo."}{" "}
            Continue respondendo questões nesse meio-tempo pra ele vir completo.
          </p>
          <Button variant="outline" className="mt-5" onClick={handleGenerate}>
            Verificar novamente
          </Button>
        </div>
      )}

      {mode === "result" && filtered && filtered.totalAnswered === 0 && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {isFirstDiagnosis
              ? "Nenhuma questão respondida ainda. Responda algumas questões e gere de novo."
              : "Nenhuma questão nova respondida desde seu último diagnóstico ainda."}
          </p>
        </div>
      )}

      {mode === "result" && filtered && filtered.totalAnswered > 0 && !hasEnoughData && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="font-heading text-base font-bold text-amber-800">
            Você respondeu {filtered.totalAnswered} de {DIAGNOSIS_MIN_QUESTIONS} questões
            {isFirstDiagnosis ? "" : " desde seu último diagnóstico"}.
          </p>
          <p className="mt-1.5 text-sm text-amber-700">
            Responda mais {DIAGNOSIS_MIN_QUESTIONS - filtered.totalAnswered} pra gerar um diagnóstico completo.
          </p>
        </div>
      )}

      {mode === "result" && filtered && filtered.totalAnswered > 0 && hasEnoughData && (
        <>
          <div
            className={`mb-4 rounded-2xl border p-4 text-center font-heading text-sm font-bold ${accuracyBadgeClass(filtered.overallAccuracy)} border-transparent`}
          >
            {performanceTier(filtered.overallAccuracy).label}
          </div>

          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <div className="font-heading text-3xl font-extrabold text-foreground">{filtered.totalAnswered}</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">
                {isFirstDiagnosis ? "respondidas" : "novas desde o último"}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <div
                className={`font-heading text-3xl font-extrabold ${performanceTier(filtered.overallAccuracy).textClass}`}
              >
                {filtered.overallAccuracy}%
              </div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">de acerto geral</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-center">
              <div className="font-heading text-3xl font-extrabold text-red-500">{filtered.totalWrong}</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">erradas</div>
            </div>
          </div>

          <div className="mb-6">
            <DiagnosisHistoryChart snapshots={history} />
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            {strongest && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <TrendingUp className="size-4" />
                  </span>
                  <span className="font-heading text-xs font-bold uppercase tracking-wide text-emerald-700">
                    Ponto forte
                  </span>
                </div>
                <p className="mt-3 font-heading text-base font-bold text-emerald-900">{topicLabel(strongest)}</p>
                <p className="mt-1 text-sm text-emerald-700">
                  {strongest.correct} acertos em {strongest.total} questões ({strongest.accuracy}%)
                </p>
              </div>
            )}
            {weakest && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-full bg-red-500 text-white">
                    <TrendingDown className="size-4" />
                  </span>
                  <span className="font-heading text-xs font-bold uppercase tracking-wide text-red-600">
                    Ponto a melhorar
                  </span>
                </div>
                <p className="mt-3 font-heading text-base font-bold text-red-900">{topicLabel(weakest)}</p>
                <p className="mt-1 text-sm text-red-700">
                  {weakest.correct} acertos em {weakest.total} questões ({weakest.accuracy}%)
                </p>
              </div>
            )}
          </div>

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
        </>
      )}

      {mode === "result" && summary && summary.totalAnswered > 0 && (
        <div className="mt-2 border-t border-border pt-5">
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
      )}
    </div>
  );
}
