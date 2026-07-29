import { notFound } from "next/navigation";
import Link from "next/link";
import { PieChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getTopicsWithCounts } from "@/lib/data";
import { getInstitution } from "@/lib/institutions";
import { TOPIC_ICONS } from "@/lib/topic-icons";
import { TopicDistributionChart } from "@/components/topic-distribution-chart";
import { MotionGrid, MotionItem } from "@/components/motion-grid";
import { PageHero } from "@/components/page-hero";

const DISCIPLINE_NAMES: Record<string, string> = { fisica: "Física", matematica: "Matemática" };

export default async function DisciplinePage({
  params,
}: {
  params: Promise<{ institution: string; discipline: string }>;
}) {
  const { institution, discipline } = await params;
  const disciplineName = DISCIPLINE_NAMES[discipline];
  const institutionData = getInstitution(institution);
  if (!disciplineName || !institutionData) notFound();

  const topics = getTopicsWithCounts(institution, discipline);

  return (
    <main className="flex-1">
      <PageHero
        title={disciplineName}
        subtitle="Escolha um assunto para ver as questões."
        backHref={`/${institution}`}
        backLabel={institutionData.name}
      />
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        <MotionGrid className="grid gap-4 sm:grid-cols-2">
          {topics.map((topic) => {
            const Icon = TOPIC_ICONS[topic.slug];
            const disabled = topic.count === 0;
            return (
              <MotionItem key={topic.slug}>
                <Link
                  href={disabled ? "#" : `/${institution}/${discipline}/${topic.slug}`}
                  className={disabled ? "pointer-events-none" : "group"}
                  aria-disabled={disabled}
                >
                  <Card
                    className={`flex-row items-center gap-4 p-5 ring-1 ring-border transition-all ${
                      disabled ? "opacity-40" : "hover:-translate-y-1 hover:shadow-lg"
                    }`}
                  >
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
                        {disabled ? "Em breve" : "Ver questões"}
                      </p>
                    </div>
                    <span
                      className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full px-2.5 text-sm font-bold text-white"
                      style={{ backgroundColor: disabled ? "var(--muted-foreground)" : topic.color }}
                    >
                      {topic.count}
                    </span>
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
          <p className="text-sm text-muted-foreground">
            Distribuição das {topics.reduce((s, t) => s + t.count, 0)} questões de{" "}
            {disciplineName.toLowerCase()} por assunto, nas provas da {institutionData.name}.
          </p>
          <TopicDistributionChart
            topics={topics.filter((t) => t.count > 0).map((t) => ({ slug: t.slug, name: t.name, count: t.count }))}
          />
        </Card>
      </div>
    </main>
  );
}
