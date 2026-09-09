"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Filter, Printer, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "@/components/question-card";
import { recordAnswerCheckAndMaybePrompt, MENTORIAS_URL } from "@/lib/checkin";
import { staggerContainer, fadeUpItem } from "@/lib/motion";
import { BASE_PATH } from "@/lib/base-path";
import type { ExamSource, Question } from "@/lib/types";

// Ignora acentos/caixa na busca — "área" deve achar "area" e vice-versa.
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

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
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
  }

  function handleAnswerChecked() {
    if (recordAnswerCheckAndMaybePrompt()) setCheckinOpen(true);
  }

  const years = useMemo(
    () =>
      Array.from(
        new Set(
          questions
            .map((q) => exams[q.examId]?.year)
            .filter((y): y is number => typeof y === "number")
        )
      ).sort((a, b) => b - a),
    [questions, exams]
  );

  const filteredQuestions = useMemo(() => {
    const term = normalize(searchQuery.trim());
    return questions.filter((q) => {
      if (yearFilter !== "all" && exams[q.examId]?.year !== yearFilter) return false;
      if (!term) return true;
      const haystack = normalize(`${q.statement} ${q.options.map((o) => o.text).join(" ")}`);
      return haystack.includes(term);
    });
  }, [questions, exams, yearFilter, searchQuery]);

  // Só aparece depois que a pessoa já rolou pra longe do topo (não faz
  // sentido oferecer "voltar ao topo" logo na primeira questão).
  useEffect(() => {
    function onScroll() {
      setShowBackToTop(window.scrollY > 500);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <div className="mt-6 flex items-center justify-end gap-1">
        <a
          href={`${BASE_PATH}/api/pdf/${institution}/${discipline}/${topicSlug}`}
          aria-label={`Baixar PDF de resolução — ${topicName}`}
          title="Baixar PDF de resolução"
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <Printer className="size-4" />
        </a>

        <div className="relative flex shrink-0 items-center">
          <Filter className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground/60" />
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
            aria-label="Filtrar por ano"
            title="Filtrar por ano"
            className="cursor-pointer appearance-none rounded-full bg-transparent py-2 pl-7 pr-3 text-xs font-medium text-muted-foreground/70 outline-none transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <option value="all">Todos</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <AnimatePresence initial={false} mode="wait">
          {searchOpen ? (
            <motion.div
              key="search-open"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 176, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="relative shrink-0 overflow-hidden"
            >
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  if (!searchQuery) setSearchOpen(false);
                }}
                onKeyDown={(e) => e.key === "Escape" && closeSearch()}
                placeholder="Pesquisar..."
                aria-label="Pesquisar nas questões"
                className="w-44 rounded-full bg-foreground/5 py-2 pl-7 pr-7 text-xs outline-none placeholder:text-muted-foreground/60"
              />
              <button
                type="button"
                onClick={closeSearch}
                aria-label="Fechar busca"
                className="absolute right-1.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground/50 transition-colors hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="search-closed"
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Pesquisar nas questões"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <Search className="size-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {filteredQuestions.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Nenhuma questão encontrada com esses filtros.
        </p>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mt-8 flex flex-col gap-5"
        >
          {filteredQuestions.map((q, i) => (
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
      )}

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            type="button"
            onClick={scrollToTop}
            aria-label="Voltar ao topo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed right-5 bottom-6 z-40 flex size-11 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 sm:right-8"
            style={{ backgroundColor: topicColor }}
          >
            <ArrowUp className="size-5" />
          </motion.button>
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
