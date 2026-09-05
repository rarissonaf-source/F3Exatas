import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  const { listId } = await params;
  const body = await req.json();
  const accountKey = typeof body.accountKey === "string" ? body.accountKey.trim() : "";
  const questionId = typeof body.questionId === "string" ? body.questionId.trim() : "";

  if (!accountKey || !questionId) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { rows } = await sql`
    select question_ids from question_lists where id = ${listId} and account_key = ${accountKey}
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Lista não encontrada." }, { status: 404 });
  }

  const current: string[] = rows[0].question_ids || [];
  const updated = current.includes(questionId)
    ? current.filter((id) => id !== questionId)
    : [...current, questionId];

  await sql`
    update question_lists set question_ids = ${JSON.stringify(updated)} where id = ${listId}
  `;

  return NextResponse.json({ id: listId, questionIds: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  const { listId } = await params;
  const accountKey = req.nextUrl.searchParams.get("accountKey") || "";

  if (!accountKey) {
    return NextResponse.json({ error: "Sem permissão para apagar esta lista." }, { status: 403 });
  }

  const { rowCount } = await sql`
    delete from question_lists where id = ${listId} and account_key = ${accountKey}
  `;

  if (rowCount === 0) {
    return NextResponse.json({ error: "Lista não encontrada ou sem permissão." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
