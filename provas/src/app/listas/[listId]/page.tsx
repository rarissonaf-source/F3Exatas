"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { QuestionCard } from "@/components/question-card";
import { getListById, type QuestionList } from "@/lib/question-lists";
import { BASE_PATH } from "@/lib/base-path";
import type { ExamSource, Question } from "@/lib/types";

interface ListQuestion {
  question: Question;
  institution: string;
  institutionName: string;
  discipline: string;
  exam: ExamSource | undefined;
  topicName: string;
  topicColor: string;
}

export default function ListPage() {
  const { listId } = useParams<{ listId: string }>();
  const [list, setList] = useState<QuestionList | null | undefined>(undefined);
  const [items, setItems] = useState<ListQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getListById(listId).then((found) => {
      setList(found);
      if (!found || found.questionIds.length === 0) {
        setLoading(false);
        return;
      }
      fetch(`${BASE_PATH}/api/lists/questions?ids=${found.questionIds.map(encodeURIComponent).join(",")}`)
        .then((res) => res.json())
        .then(setItems)
        .finally(() => setLoading(false));
    });
  }, [listId]);

  if (list === undefined || loading) return null;

  if (!list) {
    return (
      <main className="flex-1">
        <PageHero title="Lista não encontrada" backHref="/" backLabel="Início" />
      </main>
    );
  }

  return (
    <main className="flex-1">
      <PageHero
        title={list.name}
        subtitle={`${items.length} ${items.length !== 1 ? "questões salvas" : "questão salva"}`}
        backHref="/"
        backLabel="Início"
      />
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        {items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Essa lista ainda não tem questões. Abra uma questão em qualquer prova e use o botão &quot;Lista&quot;
            pra salvar aqui.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {items.map((item, i) => (
              <QuestionCard
                key={item.question.id}
                question={item.question}
                exam={item.exam}
                index={i}
                institution={item.institution}
                institutionName={item.institutionName}
                discipline={item.discipline}
                topicColor={item.topicColor}
                onAnswerChecked={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
