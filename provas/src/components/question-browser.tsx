"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Download,
  ImageIcon,
  Info,
  XCircle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LatexText } from "@/components/latex-text";
import { staggerContainer, fadeUpItem } from "@/lib/motion";
import type { ExamSource, Question } from "@/lib/types";

interface Props {
  questions: Question[];
  exams: Record<string, ExamSource>;
  institution: string;
  discipline: string;
  topicSlug: string;
  topicName: string;
  topicColor: string;
}

type OptionLabel = "a" | "b" | "c" | "d";

const OPTION_LABELS = { a: "A", b: "B", c: "C", d: "D" } as const;

export function QuestionBrowser({
  questions,
  exams,
  institution,
  discipline,
  topicSlug,
  topicName,
  topicColor,
}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState<OptionLabel | null>(null);
  const [checked, setChecked] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = (i: number) => {
    if (i < 0 || i >= questions.length) return;
    setOpenIndex(i);
    setSelected(null);
    setChecked(false);
  };

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(openIndex + 1);
      if (e.key === "ArrowLeft") goTo(openIndex - 1);
      if (e.key === "Escape") setOpenIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex, questions.length]);

  const current = openIndex !== null ? questions[openIndex] : null;
  const currentExam = current ? exams[current.examId] : null;
  const hasGabarito = Boolean(current?.correctAnswer);
  const isCorrect = checked && hasGabarito && selected === current?.correctAnswer;

  return (
    <>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {questions.map((q, i) => {
          const exam = exams[q.examId];
          return (
            <motion.div key={q.id} variants={fadeUpItem} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
              <Card
                className="group cursor-pointer gap-2 border-l-4 p-5 ring-1 ring-border transition-shadow hover:shadow-md"
                style={{ borderLeftColor: topicColor }}
                onClick={() => goTo(i)}
              >
                <div className="flex items-center justify-between">
                  <p className="font-heading text-base font-bold uppercase tracking-tight">
                    Questão {q.number}
                  </p>
                  {q.imagePath && (
                    <ImageIcon className="size-4 text-muted-foreground" strokeWidth={2} />
                  )}
                </div>
                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  UVA {exam?.edition} · {exam?.examType === "geral" ? "Conh. Gerais" : "Conh. Específicos"}
                </p>
              </Card>
            </motion.div>
          );
        })}
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

      <Dialog open={current !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-3xl max-h-[85vh] overflow-y-auto p-0"
          onTouchStart={(e) => {
            touchStartX.current = e.changedTouches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null || openIndex === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            if (dx > 60) goTo(openIndex - 1);
            if (dx < -60) goTo(openIndex + 1);
            touchStartX.current = null;
          }}
        >
          {current && (
            <div className="relative flex flex-col">
              <div className="h-1.5 w-full" style={{ backgroundColor: topicColor }} />
              <button
                onClick={() => setOpenIndex(null)}
                className="absolute right-4 top-5 z-10 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex flex-col gap-4 p-6"
                >
                <div className="flex flex-wrap items-center gap-2.5 pr-8">
                  <span
                    className="rounded-full px-3 py-1 text-sm font-bold uppercase tracking-wide text-white"
                    style={{ backgroundColor: topicColor }}
                  >
                    Questão {current.number}
                  </span>
                  <DialogTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    UVA {currentExam?.edition} ·{" "}
                    {currentExam?.examType === "geral" ? "Conh. Gerais" : "Conh. Específicos"}
                  </DialogTitle>
                </div>

                <div className={current.imagePath ? "grid gap-4 sm:grid-cols-2 sm:items-start" : ""}>
                  <div className="text-lg leading-relaxed">
                    <LatexText text={current.statement} />
                  </div>

                  {current.imagePath && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/content-images/${institution}/${discipline}/${current.imagePath}`}
                      alt={`Figura da questão ${current.number}`}
                      className="max-h-[38vh] w-full justify-self-center rounded-lg border border-border object-contain sm:max-h-[45vh]"
                    />
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {current.options.map((opt) => {
                    const isSelected = selected === opt.label;
                    const isTheCorrectOne = checked && hasGabarito && opt.label === current.correctAnswer;
                    const isWrongSelected = checked && hasGabarito && isSelected && !isTheCorrectOne;

                    return (
                      <motion.button
                        key={opt.label}
                        type="button"
                        disabled={checked}
                        onClick={() => setSelected(opt.label)}
                        whileTap={checked ? undefined : { scale: 0.985 }}
                        className={`flex w-full items-start gap-3 rounded-xl p-4 text-left text-base transition-colors ${
                          isTheCorrectOne
                            ? "bg-emerald-50 ring-1 ring-emerald-400 dark:bg-emerald-950/40"
                            : isWrongSelected
                              ? "bg-red-50 ring-1 ring-red-400 dark:bg-red-950/40"
                              : isSelected
                                ? "bg-muted ring-1 ring-foreground/30"
                                : "bg-muted/60 hover:bg-muted disabled:hover:bg-muted/60"
                        }`}
                      >
                        <span
                          className="flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                          style={{
                            backgroundColor: isTheCorrectOne
                              ? "#059669"
                              : isWrongSelected
                                ? "#dc2626"
                                : topicColor,
                          }}
                        >
                          {OPTION_LABELS[opt.label]}
                        </span>
                        <span className="flex-1 pt-0.5">
                          <LatexText text={opt.text} />
                        </span>
                        {isTheCorrectOne && (
                          <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                        )}
                        {isWrongSelected && <XCircle className="size-5 shrink-0 text-red-600" />}
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {checked && !hasGabarito && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 rounded-xl bg-muted/60 p-4 text-base text-muted-foreground"
                    >
                      <Info className="size-5 shrink-0" />
                      Gabarito ainda não disponível para esta questão.
                    </motion.div>
                  )}

                  {checked && hasGabarito && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className={`rounded-xl p-4 text-base font-semibold ${
                        isCorrect
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                      }`}
                    >
                      {isCorrect
                        ? "Resposta correta!"
                        : `Resposta incorreta. A alternativa correta é a ${OPTION_LABELS[current.correctAnswer!]}.`}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!checked && (
                  <Button
                    disabled={selected === null}
                    onClick={() => setChecked(true)}
                    style={{ backgroundColor: topicColor }}
                    className="text-base font-bold uppercase tracking-wide text-white hover:opacity-90"
                  >
                    Verificar resposta
                  </Button>
                )}

                <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={openIndex === 0}
                    onClick={() => openIndex !== null && goTo(openIndex - 1)}
                    className="font-semibold uppercase tracking-wide"
                  >
                    <ChevronLeft className="size-4" />
                    Anterior
                  </Button>
                  <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    {(openIndex ?? 0) + 1} / {questions.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={openIndex === questions.length - 1}
                    onClick={() => openIndex !== null && goTo(openIndex + 1)}
                    className="font-semibold uppercase tracking-wide"
                  >
                    Próxima
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
