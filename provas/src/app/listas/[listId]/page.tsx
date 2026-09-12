"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { QuestionCard } from "@/components/question-card";
import { getListById, type QuestionList } from "@/lib/question-lists";
import { BASE_PATH } from "@/lib/base-path";
import { fetchCurrentProfile } from "@/lib/account";
import { hasProvasPlusAccess } from "@/lib/plan-access";
import { getAnswersToday, recordDailyAnswer, DAILY_ANSWER_LIMIT } from "@/lib/daily-limit";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  const [plusAllowed, setPlusAllowed] = useState(false);
  const [answeredToday, setAnsweredToday] = useState(0);
  const [dailyLimitOpen, setDailyLimitOpen] = useState(false);

  useEffect(() => {
    fetchCurrentProfile().then((profile) => {
      setPlusAllowed(hasProvasPlusAccess(profile.email, profile.hasProvasPlus));
    });
    setAnsweredToday(getAnswersToday());
  }, []);

  function canVerifyAnswer() {
    if (plusAllowed) return true;
    if (answeredToday >= DAILY_ANSWER_LIMIT) {
      setDailyLimitOpen(true);
      return false;
    }
    return true;
  }

  function handleAnswerChecked() {
    if (!plusAllowed) {
      recordDailyAnswer();
      setAnsweredToday(getAnswersToday());
    }
  }

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
                onAnswerChecked={handleAnswerChecked}
                onBeforeVerify={canVerifyAnswer}
              />
            ))}
          </div>
        )}
      </div>

      {dailyLimitOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setDailyLimitOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-popover p-5 text-center text-popover-foreground ring-1 ring-border shadow-xl"
          >
            <p className="font-heading text-lg font-bold text-foreground">
              Você chegou ao limite de {DAILY_ANSWER_LIMIT} questões de hoje
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Volte amanhã pra continuar treinando, ou adquira o F3Provas+ pra responder sem limite &mdash; com essas
              mesmas {DAILY_ANSWER_LIMIT} questões de hoje você já teria dado suficiente pra ver seu diagnóstico de
              desempenho por assunto.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a href="#" className={cn(buttonVariants({ className: "w-full justify-center" }))}>
                Quero adquirir o F3Provas+
              </a>
              <button
                type="button"
                onClick={() => setDailyLimitOpen(false)}
                className="w-full rounded-md border border-border py-2 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Entendi, volto amanhã
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
