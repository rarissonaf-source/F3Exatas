"use client";

import { useState } from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { DiagnosisSnapshot } from "@/lib/performance";

const WIDTH = 640;
const HEIGHT = 220;
const PADDING_X = 16;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 30;
const Y_AXIS_LABEL_WIDTH = 30;

const LINES = [
  { key: "matematica" as const, label: "Matemática", accuracyKey: "matematicaAccuracy" as const, color: "var(--chart-2)" },
  { key: "fisica" as const, label: "Física", accuracyKey: "fisicaAccuracy" as const, color: "var(--chart-1)" },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Últimos dois pontos com dado (não-null) de uma disciplina — usado pra comparar com o diagnóstico anterior, não com o primeiro da série. */
function lastTwo(values: (number | null)[]): [number | null, number | null] {
  const withData = values.filter((v): v is number => v !== null);
  return [withData[withData.length - 2] ?? null, withData[withData.length - 1] ?? null];
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

function TrendBadge({ label, color, previous, current }: { label: string; color: string; previous: number | null; current: number | null }) {
  if (current === null) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 px-3.5 py-2.5">
        <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">sem dados ainda</p>
        </div>
      </div>
    );
  }

  const delta = previous === null ? null : current - previous;
  const Icon = delta === null || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const deltaClass = delta === null || delta === 0 ? "text-muted-foreground" : delta > 0 ? "text-emerald-600" : "text-red-500";

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5">
      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="font-heading text-lg font-extrabold text-foreground">{current}%</p>
      </div>
      <div className={`flex shrink-0 items-center gap-1 text-sm font-bold ${deltaClass}`}>
        <Icon className="size-4" />
        {delta !== null && (
          <span>
            {delta > 0 ? "+" : ""}
            {delta}%
          </span>
        )}
      </div>
    </div>
  );
}

interface HoveredPoint {
  lineKey: string;
  label: string;
  color: string;
  x: number;
  y: number;
  accuracy: number;
  createdAt: string;
}

/** Gráfico de linha (sem lib externa) com a evolução do acerto por disciplina, um ponto por diagnóstico gerado. */
export function DiagnosisHistoryChart({ snapshots }: { snapshots: DiagnosisSnapshot[] }) {
  const [hovered, setHovered] = useState<HoveredPoint | null>(null);

  if (snapshots.length < 2) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="font-heading text-sm font-bold text-foreground">Sua evolução</p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
          {snapshots.length === 0
            ? "Gere seu primeiro diagnóstico pra começar a acompanhar sua evolução aqui — a cada novo diagnóstico, um ponto é adicionado ao gráfico."
            : "Seu próximo diagnóstico já vai aparecer aqui comparado com este, assim que estiver disponível."}
        </p>
      </div>
    );
  }

  // Se dois pontos caírem na mesma data (comum ao testar com o bypass de
  // admin, gerando vários diagnósticos no mesmo dia), o rótulo passa a
  // incluir o horário também — senão pareceriam o mesmo ponto repetido.
  const hasDuplicateDates = new Set(snapshots.map((s) => formatDate(s.createdAt))).size < snapshots.length;
  const paddingBottom = hasDuplicateDates ? PADDING_BOTTOM + 12 : PADDING_BOTTOM;

  const usableWidth = WIDTH - PADDING_X * 2 - Y_AXIS_LABEL_WIDTH;
  const usableHeight = HEIGHT - PADDING_TOP - paddingBottom;
  const chartLeft = PADDING_X + Y_AXIS_LABEL_WIDTH;
  const step = snapshots.length > 1 ? usableWidth / (snapshots.length - 1) : 0;
  const lastIndex = snapshots.length - 1;

  const linesData = LINES.map((line) => {
    const points = snapshots.map((s, i) => {
      const x = chartLeft + step * i;
      const accuracy = s[line.accuracyKey];
      const y = accuracy === null ? null : PADDING_TOP + usableHeight * (1 - accuracy / 100);
      return { x, y, accuracy, createdAt: s.createdAt };
    });
    const [previous, current] = lastTwo(snapshots.map((s) => s[line.accuracyKey]));
    return { ...line, path: buildPath(points), points, previous, current };
  });

  const anyData = linesData.some((l) => l.current !== null);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-1 font-heading text-base font-bold text-foreground">Sua evolução</h3>

      {!anyData ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Ainda não há dados suficientes de Matemática ou Física pra desenhar o gráfico.
        </p>
      ) : (
        <>
          <div className="my-4 grid gap-2.5 sm:grid-cols-2">
            {linesData.map((line) => (
              <TrendBadge key={line.key} label={line.label} color={line.color} previous={line.previous} current={line.current} />
            ))}
          </div>

          <div className="relative">
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="w-full overflow-visible"
              role="img"
              aria-label="Gráfico de evolução do acerto por disciplina, um ponto por diagnóstico. Passe o mouse sobre os pontos pra ver o valor exato."
            >
              {[0, 25, 50, 75, 100].map((mark) => {
                const y = PADDING_TOP + usableHeight * (1 - mark / 100);
                return (
                  <g key={mark}>
                    <line x1={chartLeft} x2={WIDTH - PADDING_X} y1={y} y2={y} stroke="currentColor" className="text-border" strokeWidth={1} />
                    <text x={chartLeft - 8} y={y} textAnchor="end" dominantBaseline="middle" className="fill-muted-foreground text-[10px]">
                      {mark}%
                    </text>
                  </g>
                );
              })}

              {linesData.map((line) => (
                <g key={line.key}>
                  {line.path && <path d={line.path} fill="none" stroke={line.color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />}
                  {line.points.map((p, i) => {
                    if (p.y === null || p.accuracy === null) return null;
                    const isHovered = hovered?.lineKey === line.key && hovered.x === p.x && hovered.y === p.y;
                    const point = { x: p.x, y: p.y, accuracy: p.accuracy, createdAt: p.createdAt };
                    const onEnter = () =>
                      setHovered({ lineKey: line.key, label: line.label, color: line.color, ...point });
                    const onLeave = () => setHovered(null);
                    return (
                      <g key={i}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isHovered ? (i === lastIndex ? 8 : 6) : i === lastIndex ? 6 : 4}
                          fill={line.color}
                          stroke="var(--card)"
                          strokeWidth={i === lastIndex ? 2.5 : 1.5}
                          className="transition-[r] duration-100"
                        />
                        {/* área de toque maior e invisível, mais fácil de acertar com o mouse que o ponto visível */}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={12}
                          fill="transparent"
                          onMouseEnter={onEnter}
                          onMouseLeave={onLeave}
                          onFocus={onEnter}
                          onBlur={onLeave}
                          tabIndex={0}
                          role="button"
                          aria-label={`${line.label}, ${formatDate(p.createdAt)} ${formatTime(p.createdAt)}: ${p.accuracy}%`}
                          className="cursor-pointer outline-none"
                        />
                      </g>
                    );
                  })}
                </g>
              ))}

              {snapshots.map((s, i) => {
                // Com muitos pontos, só rotula alguns (sempre o primeiro e o
                // último) pra não amontoar datas ilegíveis no eixo.
                const labelEvery = Math.max(1, Math.ceil(snapshots.length / 8));
                if (i !== 0 && i !== lastIndex && i % labelEvery !== 0) return null;
                const x = chartLeft + step * i;
                const boldIfLast = i === lastIndex ? "font-bold" : "";
                return (
                  <g key={i}>
                    <text x={x} y={HEIGHT - paddingBottom + 18} textAnchor="middle" className={`fill-muted-foreground text-[10px] ${boldIfLast}`}>
                      {formatDate(s.createdAt)}
                    </text>
                    {hasDuplicateDates && (
                      <text x={x} y={HEIGHT - paddingBottom + 29} textAnchor="middle" className={`fill-muted-foreground text-[9px] ${boldIfLast}`}>
                        {formatTime(s.createdAt)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {hovered && (
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg"
                style={{
                  left: `${(hovered.x / WIDTH) * 100}%`,
                  top: `${(hovered.y / HEIGHT) * 100}%`,
                  marginTop: "-10px",
                }}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  <span className="size-2 rounded-full" style={{ backgroundColor: hovered.color }} />
                  {hovered.label}
                  <span className="font-heading font-extrabold">{hovered.accuracy}%</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {formatDate(hovered.createdAt)} · {formatTime(hovered.createdAt)}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
