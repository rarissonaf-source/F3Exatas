export type ExamType = "especifico" | "geral";

export interface ExamSource {
  id: string;
  institution: string;
  year: number;
  edition: string; // e.g. "2012.1"
  examType: ExamType;
  sourceFile: string;
}

export interface QuestionOption {
  label: "a" | "b" | "c" | "d";
  text: string; // may contain inline LaTeX wrapped in $...$
}

export interface Question {
  id: string;
  examId: string;
  discipline: "fisica";
  topic: string; // slug, e.g. "cinematica"
  number: number; // original question number in the source exam
  statement: string; // may contain inline LaTeX wrapped in $...$
  options: QuestionOption[];
  imagePath: string | null; // relative to content/uva/fisica/images
  correctAnswer?: "a" | "b" | "c" | "d"; // only present when a gabarito was available
}

export interface Topic {
  slug: string;
  name: string;
  order: number;
  color: string;
}
