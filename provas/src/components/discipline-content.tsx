"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PieChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TOPIC_ICONS } from "@/lib/topic-icons";
import { TopicDistributionChart } from "@/components/topic-distribution-chart";
import { MotionGrid, MotionItem } from "@/components/motion-grid";
import { fetchCurrentProfile } from "@/lib/account";
import { hasProvasPlusAccess } from "@/lib/plan-access";

interface TopicWithCount {
  slug: string;
  name: string;
  color: string;
  count: number;
}

interface Props {
  institution: string;
  discipline: string;
  disciplineName: string;
  institutionName: string;
  topics: TopicWithCount[];
}

export function DisciplineContent({ institution, discipline, disciplineName, institutionName, topics }: Props) {
  const [plusAllowed, setPlusAllowed] = useState(false);

  useEffect(() => {
    fetchCurrentProfile().then((profile) => {
      setPlusAllowed(hasProvasPlusAccess(profile.email, profile.hasProvasPlus));
    });
  }, []);

  const totalCount = topics.reduce((s, t) => s + t.count, 0);

  return (
    <>
      <MotionGrid className="grid gap-4 sm:grid-cols-2">
        {topics.map((topic) => {
          const Icon = TOPIC_ICONS[topic.slug];
          return (
            <MotionItem key={topic.slug}>
              <Link href={`/${institution}/${discipline}/${topic.slug}`} className="group">
                <Card className="flex-row items-center gap-4 p-5 ring-1 ring-border transition-all hover:-translate-y-1 hover:shadow-lg">
                  <span
                    className="flex size-13 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm transition-transform group-hover:scale-105"
                    style={{ backgroundColor: topic.color }}
                  >
                    {Icon && <Icon className="size-6" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-heading text-lg font-bold tracking-tight leading-tight">
                      {topic.name}
                    </h2>
                    <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                      Ver questões
                    </p>
                  </div>
                  {plusAllowed && (
                    <span
                      className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full px-2.5 text-sm font-bold text-white"
                      style={{ backgroundColor: topic.color }}
                    >
                      {topic.count}
                    </span>
                  )}
                </Card>
              </Link>
            </MotionItem>
          );
        })}
      </MotionGrid>

      <Card className="mt-8 gap-2 p-6 ring-1 ring-border">
        <div className="flex items-center gap-2">
          <PieChart className="size-5 text-brand-orange" />
          <h2 className="font-heading text-xl font-bold tracking-tight">Assuntos que mais caem</h2>
        </div>

        {plusAllowed ? (
          <>
            <p className="text-sm text-muted-foreground">
              Distribuição das {totalCount} questões de {disciplineName.toLowerCase()} por assunto, nas provas da{" "}
              {institutionName}.
            </p>
            <TopicDistributionChart topics={topics} />
          </>
        ) : (
          <div className="relative mt-2">
            <div aria-hidden className="pointer-events-none select-none blur-sm opacity-70">
              <p className="text-sm text-muted-foreground">
                Distribuição das {totalCount} questões de {disciplineName.toLowerCase()} por assunto, nas provas da{" "}
                {institutionName}.
              </p>
              <TopicDistributionChart topics={topics} />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/55 p-6 text-center">
              <p className="max-w-xs font-heading text-sm font-bold text-foreground">
                Veja quais assuntos mais caem e direcione seus estudos com o F3Provas+
              </p>
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-full bg-brand-orange px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
              >
                Quero adquirir o F3Provas+
              </a>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
