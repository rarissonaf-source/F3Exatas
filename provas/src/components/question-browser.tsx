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
  ZoomIn,
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
import type { ExamSource, OptionLabel, Question } from "@/lib/types";

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

const OPTION_LABELS: Record<OptionLabel, string> = { a: "A", b: "B", c: "C", d: "D", e: "E" };

const CHECKIN_LOG_KEY = "f3provas_answer_checks";
const CHECKIN_SHOWN_KEY = "f3provas_checkin_last_shown";
const DAY_MS = 24 * 60 * 60 * 1000;
const CHECKIN_THRESHOLD = 10;
const MENTORIAS_URL = "https://f3-exatas.vercel.app/mentorias/index.html";

function recordAnswerCheckAndMaybePrompt(): boolean {
  if (typeof window === "undefined") return false;

  const now = Date.now();
  let log: number[] = [];
  try {
    log = JSON.parse(localStorage.getItem(CHECKIN_LOG_KEY) ?? "[]");
  } catch {
    log = [];
  }
  log = log.filter((t) => now - t < DAY_MS);
  log.push(now);
  localStorage.setItem(CHECKIN_LOG_KEY, JSON.stringify(log));

  if (log.length < CHECKIN_THRESHOLD) return false;

  const lastShown = Number(localStorage.getItem(CHECKIN_SHOWN_KEY) ?? 0);
  if (now - lastShown < DAY_MS) return false;

  localStorage.setItem(CHECKIN_SHOWN_KEY, String(now));
  return true;
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState<OptionLabel | null>(null);
  const [checked, setChecked] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = (i: number) => {
    if (i < 0 || i >= questions.length) return;
    setOpenIndex(i);
    setSelected(null);
    setChecked(false);
    setZoomedImage(null);
  };

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && zoomedImage) {
        setZoomedImage(null);
        return;
      }
      if (e.key === "ArrowRight") goTo(openIndex + 1);
      if (e.key === "ArrowLeft") goTo(openIndex - 1);
      if (e.key === "Escape") setOpenIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex, questions.length, zoomedImage]);

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
                  {institutionName} {exam?.edition} ·{" "}
                  {exam?.examType === "geral" ? "Conh. Gerais" : "Conh. Específicos"}
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

      <Dialog
        open={current !== null}
        onOpenChange={(open, eventDetails) => {
          if (eventDetails.reason === "escape-key" && zoomedImage) {
            eventDetails.cancel();
            setZoomedImage(null);
            return;
          }
          if (!open) {
            setOpenIndex(null);
            setZoomedImage(null);
          }
        }}
      >
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
                    {institutionName} {currentExam?.edition} ·{" "}
                    {currentExam?.examType === "geral" ? "Conh. Gerais" : "Conh. Específicos"}
                  </DialogTitle>
                </div>

                <div className={current.imagePath ? "grid gap-4 sm:grid-cols-2 sm:items-start" : ""}>
                  <div className="text-lg leading-relaxed">
                    <LatexText text={current.statement} />
                  </div>

                  {current.imagePath && (
                    <button
                      type="button"
                      onClick={() =>
                        setZoomedImage(
                          `/content-images/${institution}/${discipline}/${current.imagePath}`
                        )
                      }
                      className="group/img relative justify-self-center"
                      aria-label="Ampliar figura da questão"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/content-images/${institution}/${discipline}/${current.imagePath}`}
                        alt={`Figura da questão ${current.number}`}
                        className="max-h-[38vh] w-full cursor-zoom-in rounded-lg border border-border object-contain transition-opacity group-hover/img:opacity-80 sm:max-h-[45vh]"
                      />
                      <span className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover/img:opacity-100">
                        <ZoomIn className="size-4" />
                      </span>
                    </button>
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
                    onClick={() => {
                      setChecked(true);
                      if (recordAnswerCheckAndMaybePrompt()) setCheckinOpen(true);
                    }}
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

      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6"
            onClick={() => setZoomedImage(null)}
          >
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoomedImage}
              alt="Figura ampliada"
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
