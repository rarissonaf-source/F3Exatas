const STORAGE_KEY = "f3provas_lists";

export interface QuestionList {
  id: string;
  name: string;
  questionIds: string[];
}

type ListMap = Record<string, QuestionList>;

function readLists(): ListMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeLists(lists: ListMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export function getLists(): QuestionList[] {
  return Object.values(readLists()).sort((a, b) => a.name.localeCompare(b.name));
}

export function createList(name: string): QuestionList {
  const lists = readLists();
  const id = `list-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const list: QuestionList = { id, name, questionIds: [] };
  lists[id] = list;
  writeLists(lists);
  return list;
}

export function toggleQuestionInList(listId: string, questionId: string): QuestionList | null {
  const lists = readLists();
  const list = lists[listId];
  if (!list) return null;
  list.questionIds = list.questionIds.includes(questionId)
    ? list.questionIds.filter((id) => id !== questionId)
    : [...list.questionIds, questionId];
  writeLists(lists);
  return list;
}
