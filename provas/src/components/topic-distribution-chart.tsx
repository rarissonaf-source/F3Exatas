"use client";

import { useId, useState } from "react";

interface TopicCount {
  slug: string;
  name: string;
  count: number;
}

interface Props {
  topics: TopicCount[];
}

// Validated categorical palette (see dataviz skill reference palette).
// Slots assigned in fixed rank order — 6 real segments + one neutral
// "Outros" bucket so the donut stays at the ≤7-segment part-to-whole cap.
// Site has no dark-mode toggle wired up yet, so only the light steps are used.
const SLOTS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300"];
const OUTROS_COLOR = "#898781";
const TOP_N = 6;
const SIZE = 200;
const RADIUS = 74;
const STROKE = 30;
const GAP_PX = 3;

export function TopicDistributionChart({ topics }: Props) {
  const gradientId = useId();
  const [hovered, setHovered] = useState<number | null>(null);

  const sorted = [...topics].sort((a, b) => b.count - a.count);
  const total = sorted.reduce((s, t) => s + t.count, 0);
  const top = sorted.slice(0, TOP_N);
  const restCount = sorted.slice(TOP_N).reduce((s, t) => s + t.count, 0);

  const segments = [
    ...top.map((t, i) => ({
      name: t.name,
      count: t.count,
      color: SLOTS[i],
    })),
    ...(restCount > 0
      ? [{ name: "Outros assuntos", count: restCount, color: OUTROS_COLOR }]
      : []),
  ];

  const circumference = 2 * Math.PI * RADIUS;
  let cumulative = 0;

  return (
    <div className="mt-6">
    <div className="grid gap-8 sm:grid-cols-[auto_1fr]">
      <div className="relative mx-auto size-[200px] shrink-0">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          role="img"
          aria-label={`Distribuição das ${total} questões por assunto`}
        >
          <title>Distribuição das questões por assunto</title>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--border)"
            strokeWidth={STROKE}
          />
          {segments.map((seg, i) => {
            const fraction = seg.count / total;
            const segLength = Math.max(fraction * circumference - GAP_PX, 0);
            const offset = -cumulative;
            cumulative += fraction * circumference;
            const isHovered = hovered === i;
            return (
              <circle
                key={`${gradientId}-${i}`}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered ? STROKE + 6 : STROKE}
                strokeDasharray={`${segLength} ${circumference - segLength}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                className="cursor-pointer transition-[stroke-width] duration-150"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
                role="img"
                aria-label={`${seg.name}: ${seg.count} questões (${Math.round((seg.count / total) * 100)}%)`}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold" style={{ fontVariantNumeric: "proportional-nums" }}>
            {hovered !== null ? segments[hovered].count : total}
          </span>
          <span className="text-xs text-muted-foreground">
            {hovered !== null ? `${Math.round((segments[hovered].count / total) * 100)}% do total` : "questões"}
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-1.5">
        {segments.map((seg, i) => (
          <div
            key={seg.name}
            className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors ${
              hovered === i ? "bg-muted" : ""
            }`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: seg.color }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate text-foreground">{seg.name}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {seg.count} · {Math.round((seg.count / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>

    <details className="mt-6 group">
      <summary className="cursor-pointer text-sm font-medium text-primary select-none">
        Ver tabela completa (todos os assuntos)
      </summary>
      <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Assunto</th>
              <th className="px-3 py-2 text-right font-medium tabular-nums">Questões</th>
              <th className="px-3 py-2 text-right font-medium tabular-nums">%</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => (
              <tr key={t.slug} className="border-b border-border last:border-0">
                <td className="px-3 py-2">{t.name}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{t.count}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {Math.round((t.count / total) * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
    </div>
  );
}
