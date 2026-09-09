import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { randomUUID } from "node:crypto";
import { ensurePerformanceTables } from "@/lib/performance-db";

export async function POST(req: NextRequest) {
  await ensurePerformanceTables();

  const body = await req.json().catch(() => null);
  const accountKey = typeof body?.accountKey === "string" ? body.accountKey.trim() : "";
  const institution = typeof body?.institution === "string" ? body.institution.trim() : "";
  const discipline = typeof body?.discipline === "string" ? body.discipline.trim() : "";
  const topic = typeof body?.topic === "string" ? body.topic.trim() : "";
  const questionId = typeof body?.questionId === "string" ? body.questionId.trim() : "";
  const isCorrect = Boolean(body?.isCorrect);

  if (!accountKey || !institution || !discipline || !topic || !questionId) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }

  await sql`
    insert into answer_attempts (id, account_key, institution, discipline, topic, question_id, is_correct)
    values (${randomUUID()}, ${accountKey}, ${institution}, ${discipline}, ${topic}, ${questionId}, ${isCorrect})
  `;

  return NextResponse.json({ ok: true });
}
