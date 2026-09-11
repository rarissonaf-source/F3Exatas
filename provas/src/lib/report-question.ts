import { BASE_PATH } from "@/lib/base-path";

export async function reportQuestion(input: {
  message: string;
  questionLabel: string;
  questionId: string;
  questionUrl: string;
  userName: string;
  userEmail: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(`${BASE_PATH}/api/report-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || "Não foi possível enviar o report." };
  return { ok: true };
}
