"use client";

import type { DiagnosisSnapshot } from "@/lib/performance";

const WIDTH = 600;
const HEIGHT = 180;
const PADDING_X = 12;
const PADDING_Y = 16;

const LINES = [
  { key: "matematica" as const, label: "Matemática", color: "#8b5cf6" },
  { key: "fisica" as const, label: "Física", color: "#f97316" },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function accuracyKey(line: (typeof LINES)[number]) {
  return line.key === "matematica" ? ("matematicaAccuracy" as const) : ("fisicaAccuracy" as const);
}

/** Constrói o "d" de um <path>, pulando (sem interpolar) os pontos em que a disciplina não teve dados naquele snapshot. */
function buildPath(points: { x: number; y: number | null }[]) {
  let d = "";
  let drawing = false;
  points.forEach(({ x, y }) => {
    if (y === null) {
      drawing = false;
      return;
    }
    d += `${drawing ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)} `;
    drawing = true;
  });
  return d.trim();
}

/** Gráfico de linha simples (sem lib externa) com a evolução do acerto por disciplina a cada diagnóstico gerado. */
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

  const linesData = LINES.map((line) => {
    const key = accuracyKey(line);
    const points = snapshots.map((s, i) => {
      const x = PADDING_X + step * i;
      const accuracy = s[key];
      const y = accuracy === null ? null : PADDING_Y + usableHeight * (1 - accuracy / 100);
      return { x, y, accuracy };
    });
    const withData = points.filter((p) => p.accuracy !== null);
    const first = withData[0]?.accuracy ?? null;
    const last = withData[withData.length - 1]?.accuracy ?? null;
    const trend = first !== null && last !== null ? last - first : null;
    return { ...line, path: buildPath(points), points, hasData: withData.length > 0, trend };
  });

  const anyData = linesData.some((l) => l.hasData);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading text-sm font-bold text-foreground">Sua evolução</h3>
        <div className="flex flex-wrap gap-3">
          {linesData.map((line) => (
            <span key={line.key} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: line.color }} />
              {line.label}
              {line.trend !== null && line.trend !== 0 && (
                <span className={line.trend > 0 ? "text-emerald-600" : "text-red-500"}>
                  ({line.trend > 0 ? "+" : ""}
                  {line.trend} p.p.)
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {!anyData ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Ainda não há dados suficientes de Matemática ou Física pra desenhar o gráfico.
        </p>
      ) : (
        <>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Gráfico de evolução do acerto por disciplina ao longo do tempo">
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
            {linesData.map(
              (line) =>
                line.hasData && (
                  <g key={line.key}>
                    <path d={line.path} fill="none" stroke={line.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                    {line.points.map(
                      (p, i) => p.y !== null && <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={line.color} />
                    )}
                  </g>
                )
            )}
          </svg>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{formatDate(snapshots[0].createdAt)}</span>
            <span>{formatDate(snapshots[snapshots.length - 1].createdAt)}</span>
          </div>
        </>
      )}
    </div>
  );
}
