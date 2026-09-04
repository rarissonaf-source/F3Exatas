import { BASE_PATH } from "@/lib/base-path";

export interface QuestionComment {
  id: string;
  authorEmail: string;
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
): Promise<{ comment: QuestionComment; error?: undefined } | { comment?: undefined; error: string }> {
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
  const data = await res.json();
  if (!res.ok) return { error: data.error || "Não foi possível publicar o comentário." };
  return { comment: data };
}

export async function deleteComment(
  questionId: string,
  commentId: string,
  authorEmail: string
): Promise<boolean> {
  const res = await fetch(
    `${BASE_PATH}/api/comments/${questionId}?commentId=${encodeURIComponent(commentId)}&authorEmail=${encodeURIComponent(authorEmail)}`,
    { method: "DELETE" }
  );
  return res.ok;
}
