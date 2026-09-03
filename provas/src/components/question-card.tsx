"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  X,
  ZoomIn,
  MessageSquare,
  ListPlus,
  Share2,
  Copy,
  Plus,
  AlertTriangle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LatexText } from "@/components/latex-text";
import { createList, getLists, toggleQuestionInList, type QuestionList } from "@/lib/question-lists";
import { getComments, addComment, type QuestionComment } from "@/lib/comments";
import { getCurrentProfile } from "@/lib/account";
import { BASE_PATH } from "@/lib/base-path";
import type { ExamSource, OptionLabel, Question } from "@/lib/types";

const OPTION_LABELS: Record<OptionLabel, string> = { a: "A", b: "B", c: "C", d: "D", e: "E" };

type Panel = "comments" | "lists" | "share" | null;

interface Props {
  question: Question;
  exam?: ExamSource;
  index: number;
  institution: string;
  institutionName: string;
  discipline: string;
  topicColor: string;
  onAnswerChecked: () => void;
}

export function QuestionCard({
  question,
  exam,
  index,
  institution,
  institutionName,
  discipline,
  topicColor,
  onAnswerChecked,
}: Props) {
  const [selected, setSelected] = useState<OptionLabel | null>(null);
  const [checked, setChecked] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [highlighted, setHighlighted] = useState(
    () => typeof window !== "undefined" && window.location.hash === `#${question.id}`
  );
  const rootRef = useRef<HTMLDivElement>(null);

  const hasGabarito = Boolean(question.correctAnswer);
  const isCorrect = checked && hasGabarito && selected === question.correctAnswer;
  const isAnnulled = Boolean(question.annulled);
  const imageUrl = question.imagePath
    ? `${BASE_PATH}/content-images/${institution}/${discipline}/${question.imagePath}`
    : null;

  useEffect(() => {
    if (!highlighted) return;
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(() => setHighlighted(false), 2200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!zoomedImage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomedImage(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomedImage]);

  function handleVerify() {
    setChecked(true);
    onAnswerChecked();
  }

  const togglePanel = (next: Exclude<Panel, null>) => setPanel((p) => (p === next ? null : next));

  return (
    <div
      id={question.id}
      ref={rootRef}
      className={`scroll-mt-24 rounded-2xl border bg-card p-5 transition-shadow sm:p-6 ${
        highlighted ? "border-brand-orange ring-2 ring-brand-orange/50" : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold uppercase tracking-wide text-muted-foreground sm:text-sm">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span className="text-border">|</span>
          <span>
            {institutionName} {exam?.edition}
          </span>
          <span className="text-border">|</span>
          <span>{exam?.examType === "geral" ? "Conh. Gerais" : "Conh. Específicos"}</span>
        </div>
        <button
          type="button"
          onClick={() => togglePanel("share")}
          aria-label="Compartilhar questão"
          className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${
            panel === "share" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Share2 className="size-4" />
        </button>
      </div>

      <div className={`mt-4 ${imageUrl ? "grid gap-4 sm:grid-cols-2 sm:items-start" : ""}`}>
        <div className="text-base leading-relaxed sm:text-lg">
          <LatexText text={question.statement} />
        </div>

        {imageUrl && (
          <button
            type="button"
            onClick={() => setZoomedImage(true)}
            className="group/img relative justify-self-center"
            aria-label="Ampliar figura da questão"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`Figura da questão ${question.number}`}
              className="max-h-[38vh] w-full cursor-zoom-in rounded-lg border border-border object-contain transition-opacity group-hover/img:opacity-80 sm:max-h-[45vh]"
            />
            <span className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover/img:opacity-100">
              <ZoomIn className="size-4" />
            </span>
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {question.options.map((opt) => {
          const isSelected = selected === opt.label;
          const isTheCorrectOne = checked && hasGabarito && opt.label === question.correctAnswer;
          const isWrongSelected = checked && hasGabarito && isSelected && !isTheCorrectOne;
          const optionImageUrl = opt.imagePath
            ? `${BASE_PATH}/content-images/${institution}/${discipline}/${opt.imagePath}`
            : null;

          return (
            <motion.button
              key={opt.label}
              type="button"
              disabled={checked || isAnnulled}
              onClick={() => setSelected(opt.label)}
              whileTap={checked || isAnnulled ? undefined : { scale: 0.985 }}
              className={`flex w-full items-start gap-3 rounded-xl p-4 text-left text-base transition-colors ${
                isAnnulled
                  ? "cursor-not-allowed bg-muted/40 opacity-60"
                  : isTheCorrectOne
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
                  backgroundColor: isTheCorrectOne ? "#059669" : isWrongSelected ? "#dc2626" : topicColor,
                }}
              >
                {OPTION_LABELS[opt.label]}
              </span>
              {optionImageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={optionImageUrl}
                  alt={`Alternativa ${OPTION_LABELS[opt.label]}`}
                  className="max-h-40 flex-1 rounded-lg border border-border bg-white object-contain p-1"
                />
              ) : (
                <span className="flex-1 pt-0.5">
                  <LatexText text={opt.text} />
                </span>
              )}
              {isTheCorrectOne && <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />}
              {isWrongSelected && <XCircle className="size-5 shrink-0 text-red-600" />}
            </motion.button>
          );
        })}
      </div>

      {isAnnulled && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-base font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <span>
            Questão anulada pelo gabarito oficial do IFMA. Não há alternativa correta — a questão é exibida
            apenas para referência.
          </span>
        </div>
      )}

      <AnimatePresence>
        {checked && !isAnnulled && !hasGabarito && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-2 rounded-xl bg-muted/60 p-4 text-base text-muted-foreground"
          >
            Gabarito ainda não disponível para esta questão.
          </motion.div>
        )}

        {checked && !isAnnulled && hasGabarito && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`mt-4 rounded-xl p-4 text-base font-semibold ${
              isCorrect
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
            }`}
          >
            {isCorrect
              ? "Resposta correta!"
              : `Resposta incorreta. A alternativa correta é a ${OPTION_LABELS[question.correctAnswer!]}.`}
          </motion.div>
        )}
      </AnimatePresence>

      {!checked && !isAnnulled && (
        <Button
          disabled={selected === null}
          onClick={handleVerify}
          style={{ backgroundColor: topicColor }}
          className="mt-4 text-base font-bold uppercase tracking-wide text-white hover:opacity-90"
        >
          Verificar resposta
        </Button>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-1 border-t border-border pt-3">
        <ToolbarButton
          icon={MessageSquare}
          label="Comentário"
          active={panel === "comments"}
          onClick={() => togglePanel("comments")}
        />
        <ToolbarButton
          icon={ListPlus}
          label="Lista"
          active={panel === "lists"}
          onClick={() => togglePanel("lists")}
        />
        <ToolbarButton
          icon={Share2}
          label="Compartilhar"
          active={panel === "share"}
          onClick={() => togglePanel("share")}
        />
      </div>

      <AnimatePresence mode="wait">
        {panel === "comments" && (
          <PanelWrapper key="comments">
            <CommentsPanel questionId={question.id} />
          </PanelWrapper>
        )}
        {panel === "lists" && (
          <PanelWrapper key="lists">
            <ListsPanel questionId={question.id} />
          </PanelWrapper>
        )}
        {panel === "share" && (
          <PanelWrapper key="share">
            <SharePanel questionId={question.id} />
          </PanelWrapper>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {zoomedImage && imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6"
            onClick={() => setZoomedImage(false)}
          >
            <button
              type="button"
              onClick={() => setZoomedImage(false)}
              className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Figura ampliada"
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PanelWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="mt-4">{children}</div>
    </motion.div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof MessageSquare;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors sm:text-sm ${
        active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

function commentInitials(name: string): string {
  return (name || "F3")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

function CommentAvatar({ name, picture }: { name: string; picture: string }) {
  return picture ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={picture} alt="" className="size-8 shrink-0 rounded-full object-cover" />
  ) : (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
      {commentInitials(name)}
    </span>
  );
}

function CommentsPanel({ questionId }: { questionId: string }) {
  const [comments, setComments] = useState<QuestionComment[]>([]);
  const [profile, setProfile] = useState({ name: "Usuário F3Exatas", picture: "" });
  const [text, setText] = useState("");

  useEffect(() => {
    setComments(getComments(questionId));
    const p = getCurrentProfile();
    setProfile({ name: p.name || "Usuário F3Exatas", picture: p.picture });
  }, [questionId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const comment = addComment(questionId, trimmed, profile);
    setComments((prev) => [...prev, comment]);
    setText("");
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.length > 0 && (
        <div className="flex flex-col gap-3">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <CommentAvatar name={c.authorName} picture={c.authorPicture} />
              <div className="flex-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-foreground">{c.authorName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(
                      new Date(c.createdAt)
                    )}
                  </span>
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-foreground">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <CommentAvatar name={profile.name} picture={profile.picture} />
        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva algo..."
            aria-label="Escrever comentário"
            className="w-full rounded-full border border-border bg-foreground/5 py-2.5 pl-4 pr-11 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-brand-orange/50"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            aria-label="Enviar comentário"
            className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
          >
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function ListsPanel({ questionId }: { questionId: string }) {
  const [lists, setLists] = useState<QuestionList[]>(() => getLists());
  const [newListName, setNewListName] = useState("");

  function handleToggle(listId: string) {
    const updated = toggleQuestionInList(listId, questionId);
    if (updated) setLists((prev) => prev.map((l) => (l.id === listId ? updated : l)));
  }

  function handleCreate() {
    const name = newListName.trim();
    if (!name) return;
    const list = createList(name);
    toggleQuestionInList(list.id, questionId);
    setLists((prev) => [...prev, { ...list, questionIds: [questionId] }]);
    setNewListName("");
  }

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <p className="mb-2 text-sm font-semibold text-foreground">Adicionar a uma lista</p>
      {lists.length === 0 && (
        <p className="text-sm text-muted-foreground">Você ainda não criou nenhuma lista.</p>
      )}
      <div className="flex flex-col gap-2">
        {lists.map((list) => (
          <label key={list.id} className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={list.questionIds.includes(questionId)}
              onChange={() => handleToggle(list.id)}
              className="size-4 accent-brand-orange"
            />
            {list.name}
            <span className="text-muted-foreground">({list.questionIds.length})</span>
          </label>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Nome da nova lista"
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-brand-orange"
        />
        <Button size="sm" onClick={handleCreate} className="gap-1">
          <Plus className="size-4" />
          Criar
        </Button>
      </div>
    </div>
  );
}

function SharePanel({ questionId }: { questionId: string }) {
  const [link] = useState(() =>
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}#${questionId}`
      : ""
  );
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`Olha essa questão: ${link}`)}`}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
      >
        WhatsApp
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted"
      >
        <Copy className="size-4" />
        {copied ? "Link copiado!" : "Copiar link"}
      </button>
    </div>
  );
}
