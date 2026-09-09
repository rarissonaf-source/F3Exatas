import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// Rota temporária de manutenção: limpa fotos de comentário corrompidas pelo
// antigo limite de 500 caracteres em /api/comments (fotos em base64 ficavam
// cortadas no meio, virando uma imagem quebrada). Remover após rodar uma vez.
export async function POST() {
  const { rows } = await sql`
    update comments
    set author_picture = ''
    where author_picture like 'data:image%'
      and length(author_picture) = 500
    returning id, question_id
  `;

  return NextResponse.json({ fixed: rows.length, rows });
}

export async function GET() {
  const { rows } = await sql`
    select id, question_id, length(author_picture) as len, left(author_picture, 24) as prefix
    from comments
    where author_picture is not null and author_picture <> ''
    order by created_at desc
  `;
  return NextResponse.json({ total: rows.length, rows });
}
