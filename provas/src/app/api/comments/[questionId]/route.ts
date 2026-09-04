import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

const MAX_TEXT_LENGTH = 2000;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await params;

  const { rows } = await sql`
    select id, author_name, author_picture, text, created_at
    from comments
    where question_id = ${questionId}
    order by created_at asc
  `;

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      authorName: r.author_name,
      authorPicture: r.author_picture,
      text: r.text,
      createdAt: new Date(r.created_at).getTime(),
    }))
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await params;
  const body = await req.json();

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const authorName = typeof body.authorName === "string" ? body.authorName.trim().slice(0, 120) : "Usuário F3Exatas";
  const authorEmail = typeof body.authorEmail === "string" ? body.authorEmail.trim().slice(0, 200) : "";
  const authorPicture = typeof body.authorPicture === "string" ? body.authorPicture.trim().slice(0, 500) : "";

  if (!text || text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: "Comentário inválido." }, { status: 400 });
  }

  const id = `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  await sql`
    insert into comments (id, question_id, author_email, author_name, author_picture, text)
    values (${id}, ${questionId}, ${authorEmail}, ${authorName || "Usuário F3Exatas"}, ${authorPicture}, ${text})
  `;

  return NextResponse.json({
    id,
    authorName: authorName || "Usuário F3Exatas",
    authorPicture,
    text,
    createdAt: Date.now(),
  });
}
