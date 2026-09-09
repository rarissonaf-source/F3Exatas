import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { ensurePerformanceTables, hasPerformanceAccess, PERIOD_TO_INTERVAL } from "@/lib/performance-db";

export async function GET(req: NextRequest) {
  await ensurePerformanceTables();

  const accountKey = (req.nextUrl.searchParams.get("accountKey") || "").trim();
  const period = req.nextUrl.searchParams.get("period") || "7d";
  const interval = PERIOD_TO_INTERVAL[period] || PERIOD_TO_INTERVAL["7d"];

  if (!accountKey || !hasPerformanceAccess(accountKey)) {
    return NextResponse.json({ error: "Recurso disponível apenas para quem tem o plano com desempenho." }, { status: 403 });
  }

  const { rows } = await sql`
    select discipline, topic,
      count(*)::int as total,
      sum(case when is_correct then 1 else 0 end)::int as correct
    from answer_attempts
    where account_key = ${accountKey} and answered_at >= now() - ${interval}::interval
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
    period,
    totalAnswered,
    totalCorrect,
    totalWrong: totalAnswered - totalCorrect,
    overallAccuracy: totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
    byTopic,
  });
}
