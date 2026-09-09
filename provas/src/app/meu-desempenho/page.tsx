"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { fetchCurrentProfile } from "@/lib/account";
import {
  fetchPerformanceSummary,
  hasPerformanceAccess,
  type Period,
  type PerformanceSummary,
} from "@/lib/performance";
import { getTopicsForDiscipline } from "@/lib/topics";

const DISCIPLINE_NAMES: Record<string, string> = { fisica: "Física", matematica: "Matemática" };

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "24h", label: "Últimas 24h" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
];

function topicName(discipline: string, slug: string) {
  return getTopicsForDiscipline(discipline).find((t) => t.slug === slug)?.name ?? slug;
}

export default function MeuDesempenhoPage() {
  const [checkedAccess, setCheckedAccess] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [period, setPeriod] = useState<Period>("7d");
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrentProfile().then((profile) => {
      setAllowed(hasPerformanceAccess(profile.email));
      setCheckedAccess(true);
    });
  }, []);

  useEffect(() => {
    if (!allowed) return;
    setLoading(true);
    fetchPerformanceSummary(period)
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [allowed, period]);

  if (!checkedAccess) return null;

  if (!allowed) {
    return (
      <main className="flex-1">
        <PageHero
          title="Meu Desempenho"
          subtitle="Acompanhe seus acertos e erros por assunto."
          icon={<BarChart3 className="size-7" />}
          iconBg="#0891b2"
          backHref="/"
          backLabel="F3Provas"
        />
        <div className="mx-auto w-full max-w-4xl px-6 py-12">
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="font-heading text-lg font-bold text-foreground">
              Esse recurso é exclusivo de quem tem o plano com desempenho
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Fale com a F3Exatas pra saber como liberar o acompanhamento de desempenho na sua conta.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const byDiscipline = (summary?.byTopic ?? []).reduce<Record<string, PerformanceSummary["byTopic"]>>((acc, t) => {
    (acc[t.discipline] ??= []).push(t);
    return acc;
  }, {});

  return (
    <main className="flex-1">
      <PageHero
        title="Meu Desempenho"
        subtitle="Acompanhe seus acertos e erros por assunto, e foque no que mais precisa."
        icon={<BarChart3 className="size-7" />}
        iconBg="#0891b2"
        backHref="/"
        backLabel="F3Provas"
      />

      <div className="mx-auto w-full max-w-4xl px-6 py-12">
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
            Nenhuma questão respondida nesse período ainda. Responda algumas questões e volte aqui.
          </p>
        )}

        {!loading && summary && summary.totalAnswered > 0 && (
          <>
            <div className="mb-8 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <div className="font-heading text-2xl font-extrabold text-foreground">{summary.totalAnswered}</div>
                <div className="text-xs text-muted-foreground">respondidas</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <div className="font-heading text-2xl font-extrabold text-emerald-600">{summary.overallAccuracy}%</div>
                <div className="text-xs text-muted-foreground">de acerto geral</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <div className="font-heading text-2xl font-extrabold text-red-500">{summary.totalWrong}</div>
                <div className="text-xs text-muted-foreground">erradas</div>
              </div>
            </div>

            {Object.entries(byDiscipline).map(([discipline, topics]) => {
              const sorted = [...topics].sort((a, b) => a.accuracy - b.accuracy);
              return (
                <div key={discipline} className="mb-8">
                  <h2 className="mb-3 font-heading text-lg font-bold text-foreground">
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
                            {topicName(discipline, t.topic)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t.correct} acertos · {t.wrong} erros · {t.total} respondidas
                          </div>
                        </div>
                        <div
                          className={`shrink-0 rounded-full px-3 py-1 font-heading text-sm font-bold ${
                            t.accuracy >= 70
                              ? "bg-emerald-100 text-emerald-700"
                              : t.accuracy >= 40
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
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
      </div>
    </main>
  );
}
