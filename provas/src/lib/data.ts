import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { ExamSource, Question } from "./types";
import { getTopicsForDiscipline } from "./topics";

const CONTENT_ROOT = path.join(process.cwd(), "content");

function readJson<T>(relativePath: string): T {
  const full = path.join(CONTENT_ROOT, relativePath);
  return JSON.parse(fs.readFileSync(full, "utf-8")) as T;
}

export function getExams(institution: string, discipline: string): ExamSource[] {
  return readJson<ExamSource[]>(`${institution}/${discipline}/exams.json`);
}

export function getQuestions(institution: string, discipline: string): Question[] {
  return readJson<Question[]>(`${institution}/${discipline}/questions.json`);
}

export function getTopicsWithCounts(institution: string, discipline: string) {
  const questions = getQuestions(institution, discipline);
  return getTopicsForDiscipline(discipline).map((topic) => ({
    ...topic,
    count: questions.filter((q) => q.topic === topic.slug).length,
  }));
}

export function getQuestionsByTopic(
  institution: string,
  discipline: string,
  topicSlug: string
): Question[] {
  const questions = getQuestions(institution, discipline);
  const exams = getExams(institution, discipline);
  const examOrder = new Map(exams.map((e, i) => [e.id, i]));
  return questions
    .filter((q) => q.topic === topicSlug)
    .sort((a, b) => {
      const examDiff = (examOrder.get(a.examId) ?? 0) - (examOrder.get(b.examId) ?? 0);
      if (examDiff !== 0) return examDiff;
      return a.number - b.number;
    });
}

export function getExamById(
  institution: string,
  discipline: string,
  examId: string
): ExamSource | undefined {
  return getExams(institution, discipline).find((e) => e.id === examId);
}

export function imageUrl(institution: string, discipline: string, imagePath: string) {
  return `/content-images/${institution}/${discipline}/${imagePath}`;
}
