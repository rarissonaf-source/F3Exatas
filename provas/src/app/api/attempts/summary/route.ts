import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { ensurePerformanceTables, getDiagnosisEligibility } from "@/lib/performance-db";
import { hasProvasPlusAccess, PROVAS_PLUS_ADMIN_EMAILS } from "@/lib/provas-plus";

// O resumo nunca usa uma janela fixa (24h/7d/30d) — ele sempre soma as
// respostas dadas DEPOIS do último diagnóstico salvo dessa conta (ou desde
// sempre, se ainda não há um), pra cada novo diagnóstico refletir só o que é
// novo desde a última vez que o usuário conferiu seu progresso.
export async function GET(req: NextRequest) {
  await ensurePerformanceTables();

  const accountKey = (req.nextUrl.searchParams.get("accountKey") || "").trim();
  if (!accountKey || !(await hasProvasPlusAccess(accountKey))) {
    return NextResponse.json({ error: "Recurso disponível apenas para quem tem o plano com desempenho." }, { status: 403 });
  }

  const isAdmin = PROVAS_PLUS_ADMIN_EMAILS.includes(accountKey.toLowerCase());
  const eligibility = await getDiagnosisEligibility(accountKey, isAdmin);
  const since = eligibility.sinceDiagnosisAt ?? new Date(0).toISOString();

  const { rows } = await sql`
    select discipline, topic,
      count(*)::int as total,
      sum(case when is_correct then 1 else 0 end)::int as correct
    from answer_attempts
    where account_key = ${accountKey} and answered_at > ${since}::timestamptz
    group by discipline, topic
    order by discipline, topic
  `;

  const byTopic = rows.map((r) => ({
    discipline: r.discipline as string,
    topic: r.topic as string,
    total: r.total as number,
    correct: r.correct as number,
    wrong: (r.total as number) - (r.correct as number),
    accuracy: r.total ? Math.round(((r.correct as number) / (r.total as number)) * 100) : 0,
  }));

  const totalAnswered = byTopic.reduce((acc, t) => acc + t.total, 0);
  const totalCorrect = byTopic.reduce((acc, t) => acc + t.correct, 0);

  return NextResponse.json({
    sinceDiagnosisAt: eligibility.sinceDiagnosisAt,
    cooldownActive: eligibility.cooldownActive,
    cooldownEndsAt: eligibility.cooldownEndsAt,
    totalAnswered,
    totalCorrect,
    totalWrong: totalAnswered - totalCorrect,
    overallAccuracy: totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
    byTopic,
  });
}
