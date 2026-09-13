"use client";

import type { DiagnosisSnapshot } from "@/lib/performance";

const WIDTH = 600;
const HEIGHT = 160;
const PADDING_X = 12;
const PADDING_Y = 16;

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/** Gráfico de linha simples (sem lib externa) com a evolução do acerto geral a cada diagnóstico gerado. */
export function DiagnosisHistoryChart({ snapshots }: { snapshots: DiagnosisSnapshot[] }) {
  if (snapshots.length < 2) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">
          {snapshots.length === 0
            ? "Gere seu primeiro diagnóstico do dia pra começar a acompanhar sua evolução aqui."
            : "Volte amanhã e gere outro diagnóstico pra começar a ver sua evolução no gráfico."}
        </p>
      </div>
    );
  }

  const usableWidth = WIDTH - PADDING_X * 2;
  const usableHeight = HEIGHT - PADDING_Y * 2;
  const step = usableWidth / (snapshots.length - 1);

  const points = snapshots.map((s, i) => {
    const x = PADDING_X + step * i;
    const y = PADDING_Y + usableHeight * (1 - s.overallAccuracy / 100);
    return { x, y, snapshot: s };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];
  const trend = last.overallAccuracy - first.overallAccuracy;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold text-foreground">Sua evolução</h3>
        {trend !== 0 && (
          <span className={`text-xs font-semibold ${trend > 0 ? "text-emerald-600" : "text-red-500"}`}>
            {trend > 0 ? "+" : ""}
            {trend} p.p. desde o início
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Gráfico de evolução do acerto geral ao longo do tempo">
        {[0, 25, 50, 75, 100].map((mark) => {
          const y = PADDING_Y + usableHeight * (1 - mark / 100);
          return (
            <line
              key={mark}
              x1={PADDING_X}
              x2={WIDTH - PADDING_X}
              y1={y}
              y2={y}
              stroke="currentColor"
              className="text-border"
              strokeWidth={1}
            />
          );
        })}
        <path d={path} fill="none" stroke="#06b6d4" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#06b6d4" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{formatDate(first.createdAt)} · {first.overallAccuracy}%</span>
        <span>{formatDate(last.createdAt)} · {last.overallAccuracy}%</span>
      </div>
    </div>
  );
}
