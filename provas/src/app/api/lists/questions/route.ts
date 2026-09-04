import { NextRequest, NextResponse } from "next/server";
import { getExamById, getQuestions } from "@/lib/data";
import { getInstitution, INSTITUTIONS } from "@/lib/institutions";
import { getTopicsForDiscipline } from "@/lib/topics";

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids") || "";
  const ids = idsParam.split(",").filter(Boolean);
  if (ids.length === 0) return NextResponse.json([]);

  const found: Array<{
    question: ReturnType<typeof getQuestions>[number];
    institution: string;
    institutionName: string;
    discipline: string;
    exam: ReturnType<typeof getExamById>;
    topicName: string;
    topicColor: string;
  }> = [];

  for (const inst of INSTITUTIONS) {
    for (const disc of inst.disciplines) {
      const questions = getQuestions(inst.slug, disc.slug);
      const topics = getTopicsForDiscipline(disc.slug);
      for (const question of questions) {
        if (!ids.includes(question.id)) continue;
        const topic = topics.find((t) => t.slug === question.topic);
        found.push({
          question,
          institution: inst.slug,
          institutionName: getInstitution(inst.slug)?.name ?? inst.slug,
          discipline: disc.slug,
          exam: getExamById(inst.slug, disc.slug, question.examId),
          topicName: topic?.name ?? question.topic,
          topicColor: topic?.color ?? "#6366f1",
        });
      }
    }
  }

  // Mantém a ordem em que os IDs foram salvos na lista.
  found.sort((a, b) => ids.indexOf(a.question.id) - ids.indexOf(b.question.id));

  return NextResponse.json(found);
}
