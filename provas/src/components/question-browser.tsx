"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/question-card";
import { recordAnswerCheckAndMaybePrompt, MENTORIAS_URL } from "@/lib/checkin";
import { staggerContainer, fadeUpItem } from "@/lib/motion";
import type { ExamSource, Question } from "@/lib/types";

interface Props {
  questions: Question[];
  exams: Record<string, ExamSource>;
  institution: string;
  institutionName: string;
  discipline: string;
  topicSlug: string;
  topicName: string;
  topicColor: string;
}

export function QuestionBrowser({
  questions,
  exams,
  institution,
  institutionName,
  discipline,
  topicSlug,
  topicName,
  topicColor,
}: Props) {
  const [checkinOpen, setCheckinOpen] = useState(false);

  function handleAnswerChecked() {
    if (recordAnswerCheckAndMaybePrompt()) setCheckinOpen(true);
  }

  return (
    <>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="mt-8 flex flex-col gap-5"
      >
        {questions.map((q, i) => (
          <motion.div key={q.id} variants={fadeUpItem}>
            <QuestionCard
              question={q}
              exam={exams[q.examId]}
              index={i}
              institution={institution}
              institutionName={institutionName}
              discipline={discipline}
              topicColor={topicColor}
              onAnswerChecked={handleAnswerChecked}
            />
          </motion.div>
        ))}
      </motion.div>

      <a
        href={`/api/pdf/${institution}/${discipline}/${topicSlug}`}
        className="mt-8 inline-flex items-center gap-2.5 rounded-full py-2.5 pl-2.5 pr-5 text-sm font-bold uppercase tracking-wide text-white shadow-md transition-transform hover:scale-[1.02]"
        style={{ backgroundColor: topicColor }}
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-white/20">
          <Download className="size-4" />
        </span>
        Baixar PDF de resolução — {topicName}
      </a>

      <AnimatePresence>
        {checkinOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-4 sm:items-center"
            onClick={() => setCheckinOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-popover p-5 text-popover-foreground ring-1 ring-border shadow-xl"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                  F3
                </span>
                <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm leading-relaxed">
                  Você já resolveu <strong>10 questões</strong> hoje! Como tá indo o rendimento até agora?
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Button onClick={() => setCheckinOpen(false)} className="w-full justify-center">
                  Tá tudo certo, bora continuar
                </Button>
                <a
                  href={MENTORIAS_URL}
                  target="_blank"
                  rel="noopener"
                  onClick={() => setCheckinOpen(false)}
                  className="w-full rounded-md border border-border py-2 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Preciso de uma ajuda extra
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
