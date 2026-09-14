import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { ensurePerformanceTables, ensureDiagnosisSnapshotsTable } from "@/lib/performance-db";

export async function POST(req: NextRequest) {
  await ensurePerformanceTables();
  await ensureDiagnosisSnapshotsTable();

  const body = await req.json().catch(() => null);
  const accountKey = typeof body?.accountKey === "string" ? body.accountKey.trim() : "";

  if (!accountKey) {
    return NextResponse.json({ error: "accountKey obrigatório." }, { status: 400 });
  }

  // "Limpar estatísticas" apaga tudo relacionado a desempenho dessa conta —
  // as respostas em si e também o histórico de diagnósticos (gráfico de
  // evolução), já que ele deixaria de fazer sentido sem as respostas por trás.
  await sql`delete from answer_attempts where account_key = ${accountKey}`;
  await sql`delete from diagnosis_snapshots where account_key = ${accountKey}`;

  return NextResponse.json({ ok: true });
}
