import { BASE_PATH } from "./base-path";
import { getCurrentAccountKey } from "./account";

export interface QuestionList {
  id: string;
  name: string;
  questionIds: string[];
}

export async function getLists(): Promise<QuestionList[]> {
  const accountKey = getCurrentAccountKey();
  try {
    const res = await fetch(`${BASE_PATH}/api/lists?accountKey=${encodeURIComponent(accountKey)}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getListById(id: string): Promise<QuestionList | null> {
  const lists = await getLists();
  return lists.find((l) => l.id === id) ?? null;
}

export async function createList(name: string): Promise<QuestionList> {
  const accountKey = getCurrentAccountKey();
  const res = await fetch(`${BASE_PATH}/api/lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountKey, name }),
  });
  return res.json();
}

export async function toggleQuestionInList(
  listId: string,
  questionId: string
): Promise<QuestionList | null> {
  const accountKey = getCurrentAccountKey();
  try {
    const res = await fetch(`${BASE_PATH}/api/lists/${encodeURIComponent(listId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountKey, questionId }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function deleteList(listId: string): Promise<boolean> {
  const accountKey = getCurrentAccountKey();
  try {
    const res = await fetch(
      `${BASE_PATH}/api/lists/${encodeURIComponent(listId)}?accountKey=${encodeURIComponent(accountKey)}`,
      { method: "DELETE" }
    );
    return res.ok;
  } catch {
    return false;
  }
}
