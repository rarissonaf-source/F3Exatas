export type ExamType = "especifico" | "geral";
export type Discipline = "fisica" | "matematica";

export interface ExamSource {
  id: string;
  institution: string;
  year: number;
  edition: string; // e.g. "2012.1"
  examType: ExamType;
  sourceFile: string;
}

export type OptionLabel = "a" | "b" | "c" | "d" | "e";

export interface QuestionOption {
  label: OptionLabel;
  text: string; // may contain inline LaTeX wrapped in $...$
}

export interface Question {
  id: string;
  examId: string;
  discipline: Discipline;
  topic: string; // slug, e.g. "cinematica"
  number: number; // original question number in the source exam
  statement: string; // may contain inline LaTeX wrapped in $...$
  options: QuestionOption[];
  imagePath: string | null; // relative to content/<institution>/<discipline>/images
  correctAnswer?: OptionLabel; // only present when a gabarito was available
  annulled?: boolean; // question was officially annulled by the exam board (no valid alternative); answering is disabled
}

export interface Topic {
  slug: string;
  name: string;
  order: number;
  color: string;
}
