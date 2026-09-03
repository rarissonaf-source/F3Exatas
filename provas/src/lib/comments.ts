const STORAGE_KEY = "f3provas_comments";

export interface QuestionComment {
  id: string;
  authorName: string;
  authorPicture: string;
  text: string;
  createdAt: number;
}

type CommentMap = Record<string, QuestionComment[]>;

function readAll(): CommentMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeAll(map: CommentMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getComments(questionId: string): QuestionComment[] {
  return readAll()[questionId] ?? [];
}

export function addComment(
  questionId: string,
  text: string,
  author: { name: string; picture: string }
): QuestionComment {
  const map = readAll();
  const comment: QuestionComment = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    authorName: author.name,
    authorPicture: author.picture,
    text,
    createdAt: Date.now(),
  };
  map[questionId] = [...(map[questionId] ?? []), comment];
  writeAll(map);
  return comment;
}
