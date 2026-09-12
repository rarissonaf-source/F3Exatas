import { notFound } from "next/navigation";
import { getTopicsWithCounts } from "@/lib/data";
import { getInstitution } from "@/lib/institutions";
import { DisciplineContent } from "@/components/discipline-content";
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

  const topics = getTopicsWithCounts(institution, discipline).filter((t) => t.count > 0);

  return (
    <main className="flex-1">
      <PageHero
        title={disciplineName}
        subtitle="Escolha um assunto para ver as questões."
        backHref={`/${institution}`}
        backLabel={institutionData.name}
      />
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        <DisciplineContent
          institution={institution}
          discipline={discipline}
          disciplineName={disciplineName}
          institutionName={institutionData.name}
          topics={topics}
        />
      </div>
    </main>
  );
}
