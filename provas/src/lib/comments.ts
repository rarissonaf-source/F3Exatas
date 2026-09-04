import { BASE_PATH } from "@/lib/base-path";

export interface QuestionComment {
  id: string;
  authorName: string;
  authorPicture: string;
  text: string;
  createdAt: number;
}

export async function getComments(questionId: string): Promise<QuestionComment[]> {
  const res = await fetch(`${BASE_PATH}/api/comments/${questionId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function addComment(
  questionId: string,
  text: string,
  author: { name: string; email: string; picture: string }
): Promise<QuestionComment | null> {
  const res = await fetch(`${BASE_PATH}/api/comments/${questionId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      authorName: author.name,
      authorEmail: author.email,
      authorPicture: author.picture,
    }),
  });
  if (!res.ok) return null;
  return res.json();
}
