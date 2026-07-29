import { notFound } from "next/navigation";
import { getExams, getQuestionsByTopic } from "@/lib/data";
import { getTopicsForDiscipline } from "@/lib/topics";
import { TOPIC_ICONS } from "@/lib/topic-icons";
import { getInstitution } from "@/lib/institutions";
import { QuestionBrowser } from "@/components/question-browser";
import { PageHero } from "@/components/page-hero";

const DISCIPLINE_NAMES: Record<string, string> = { fisica: "Física", matematica: "Matemática" };

export default async function TopicPage({
  params,
}: {
  params: Promise<{ institution: string; discipline: string; topic: string }>;
}) {
  const { institution, discipline, topic } = await params;
  const disciplineName = DISCIPLINE_NAMES[discipline];
  const institutionData = getInstitution(institution);
  const topicMeta = getTopicsForDiscipline(discipline).find((t) => t.slug === topic);
  if (!disciplineName || !institutionData || !topicMeta) notFound();

  const questions = getQuestionsByTopic(institution, discipline, topic);
  if (questions.length === 0) notFound();

  const exams = getExams(institution, discipline);
  const examsById = Object.fromEntries(exams.map((e) => [e.id, e]));
  const Icon = TOPIC_ICONS[topic];

  return (
    <main className="flex-1">
      <PageHero
        title={topicMeta.name}
        subtitle={`${questions.length} ${questions.length !== 1 ? "questões" : "questão"} — clique para abrir.`}
        icon={Icon && <Icon className="size-7" />}
        iconBg={topicMeta.color}
        backHref={`/${institution}/${discipline}`}
        backLabel={disciplineName}
      />
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        <QuestionBrowser
          questions={questions}
          exams={examsById}
          institution={institution}
          institutionName={institutionData.name}
          discipline={discipline}
          topicSlug={topic}
          topicName={topicMeta.name}
          topicColor={topicMeta.color}
        />
      </div>
    </main>
  );
}
