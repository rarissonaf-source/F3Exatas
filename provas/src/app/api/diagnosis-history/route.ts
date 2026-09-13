import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { randomUUID } from "node:crypto";
import { ensureDiagnosisSnapshotsTable } from "@/lib/performance-db";
import { hasProvasPlusAccess } from "@/lib/provas-plus";

// Histórico de diagnósticos gerados, usado pro gráfico de evolução do
// F3Provas+. Limitado a 1 snapshot por conta a cada 24h (ver POST abaixo) pra
// os pontos do gráfico terem espaçamento significativo em vez de virarem
// ruído se o usuário gerar o diagnóstico várias vezes seguidas.

export async function GET(req: NextRequest) {
  await ensureDiagnosisSnapshotsTable();

  const accountKey = (req.nextUrl.searchParams.get("accountKey") || "").trim();
  if (!accountKey || !(await hasProvasPlusAccess(accountKey))) {
    return NextResponse.json({ error: "Recurso disponível apenas para quem tem o plano com desempenho." }, { status: 403 });
  }

  const { rows } = await sql`
    select total_answered, total_correct, overall_accuracy, created_at
    from diagnosis_snapshots
    where account_key = ${accountKey}
    order by created_at asc
    limit 90
  `;

  return NextResponse.json({
    snapshots: rows.map((r) => ({
      totalAnswered: r.total_answered as number,
      totalCorrect: r.total_correct as number,
      overallAccuracy: r.overall_accuracy as number,
      createdAt: (r.created_at as Date).toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  await ensureDiagnosisSnapshotsTable();

  const body = await req.json().catch(() => null);
  const accountKey = typeof body?.accountKey === "string" ? body.accountKey.trim() : "";
  const period = typeof body?.period === "string" ? body.period.trim() : "";
  const totalAnswered = Number.isFinite(body?.totalAnswered) ? Math.trunc(body.totalAnswered) : NaN;
  const totalCorrect = Number.isFinite(body?.totalCorrect) ? Math.trunc(body.totalCorrect) : NaN;
  const overallAccuracy = Number.isFinite(body?.overallAccuracy) ? Math.trunc(body.overallAccuracy) : NaN;

  if (!accountKey || !period || Number.isNaN(totalAnswered) || Number.isNaN(totalCorrect) || Number.isNaN(overallAccuracy)) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }

  if (!(await hasProvasPlusAccess(accountKey))) {
    return NextResponse.json({ error: "Recurso disponível apenas para quem tem o plano com desempenho." }, { status: 403 });
  }

  const { rows: recent } = await sql`
    select 1 from diagnosis_snapshots
    where account_key = ${accountKey} and created_at >= now() - interval '24 hours'
    limit 1
  `;
  if (recent.length > 0) {
    return NextResponse.json({ ok: true, saved: false, reason: "already_today" });
  }

  await sql`
    insert into diagnosis_snapshots (id, account_key, period, total_answered, total_correct, overall_accuracy)
    values (${randomUUID()}, ${accountKey}, ${period}, ${totalAnswered}, ${totalCorrect}, ${overallAccuracy})
  `;

  return NextResponse.json({ ok: true, saved: true });
}
