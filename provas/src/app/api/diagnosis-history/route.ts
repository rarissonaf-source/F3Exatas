import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { randomUUID } from "node:crypto";
import { ensureDiagnosisSnapshotsTable, getDiagnosisEligibility } from "@/lib/performance-db";
import { hasProvasPlusAccess, PROVAS_PLUS_ADMIN_EMAILS } from "@/lib/provas-plus";

// Histórico de diagnósticos gerados, usado pro gráfico de evolução do
// F3Provas+ (uma linha por disciplina). Um novo diagnóstico só é aceito aqui
// depois do cooldown de DIAGNOSIS_COOLDOWN_HOURS desde o anterior (ver
// getDiagnosisEligibility em performance-db.ts) — o mesmo cálculo que
// /api/attempts/summary usa pra decidir se o botão de gerar deve funcionar,
// então em condições normais este POST só é chamado quando já elegível; a
// checagem aqui existe pra não confiar só no cliente.

/** `null` quando o corpo não trouxe a disciplina (0 questões respondidas dela desde o último diagnóstico) — distingue de "respondeu e zerou". */
function parseNullableInt(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Number.isFinite(value) ? Math.trunc(value as number) : null;
}

export async function GET(req: NextRequest) {
  await ensureDiagnosisSnapshotsTable();

  const accountKey = (req.nextUrl.searchParams.get("accountKey") || "").trim();
  if (!accountKey || !(await hasProvasPlusAccess(accountKey))) {
    return NextResponse.json({ error: "Recurso disponível apenas para quem tem o plano com desempenho." }, { status: 403 });
  }

  const { rows } = await sql`
    select total_answered, total_correct, overall_accuracy,
      matematica_answered, matematica_accuracy, fisica_answered, fisica_accuracy,
      created_at
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
      matematicaAnswered: r.matematica_answered as number | null,
      matematicaAccuracy: r.matematica_accuracy as number | null,
      fisicaAnswered: r.fisica_answered as number | null,
      fisicaAccuracy: r.fisica_accuracy as number | null,
      createdAt: (r.created_at as Date).toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  await ensureDiagnosisSnapshotsTable();

  const body = await req.json().catch(() => null);
  const accountKey = typeof body?.accountKey === "string" ? body.accountKey.trim() : "";
  const totalAnswered = Number.isFinite(body?.totalAnswered) ? Math.trunc(body.totalAnswered) : NaN;
  const totalCorrect = Number.isFinite(body?.totalCorrect) ? Math.trunc(body.totalCorrect) : NaN;
  const overallAccuracy = Number.isFinite(body?.overallAccuracy) ? Math.trunc(body.overallAccuracy) : NaN;
  const matematicaAnswered = parseNullableInt(body?.matematicaAnswered);
  const matematicaAccuracy = parseNullableInt(body?.matematicaAccuracy);
  const fisicaAnswered = parseNullableInt(body?.fisicaAnswered);
  const fisicaAccuracy = parseNullableInt(body?.fisicaAccuracy);

  if (!accountKey || Number.isNaN(totalAnswered) || Number.isNaN(totalCorrect) || Number.isNaN(overallAccuracy)) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }

  if (!(await hasProvasPlusAccess(accountKey))) {
    return NextResponse.json({ error: "Recurso disponível apenas para quem tem o plano com desempenho." }, { status: 403 });
  }

  const isAdmin = PROVAS_PLUS_ADMIN_EMAILS.includes(accountKey.toLowerCase());
  const { cooldownActive } = await getDiagnosisEligibility(accountKey, isAdmin);
  if (cooldownActive) {
    return NextResponse.json({ ok: true, saved: false, reason: "cooldown" });
  }

  await sql`
    insert into diagnosis_snapshots (
      id, account_key, period, total_answered, total_correct, overall_accuracy,
      matematica_answered, matematica_accuracy, fisica_answered, fisica_accuracy
    )
    values (
      ${randomUUID()}, ${accountKey}, 'since_last', ${totalAnswered}, ${totalCorrect}, ${overallAccuracy},
      ${matematicaAnswered}, ${matematicaAccuracy}, ${fisicaAnswered}, ${fisicaAccuracy}
    )
  `;

  return NextResponse.json({ ok: true, saved: true });
}
