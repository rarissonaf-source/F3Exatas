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
