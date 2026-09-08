import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { sql } from "@vercel/postgres";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import { ensureAuthTables } from "@/lib/auth";

// Mesma lista usada em auth-gate.js (window.F3Exatas.hasCourseAccess) — sem
// backend de compra ainda, então o "acesso" de curso é essa allowlist manual.
const ADMIN_EMAILS = ["rarissonaf@gmail.com", "cerqueirasidney@gmail.com"];

const MATERIALS_ROOT = path.join(process.cwd(), "content", "course-materials");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; fileName: string }> }
) {
  await ensureAuthTables();

  const { courseId, fileName } = await params;
  const email = (req.nextUrl.searchParams.get("email") || "").trim().toLowerCase();
  const googleName = (req.nextUrl.searchParams.get("name") || "").trim();

  if (!email || !ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Você ainda não tem acesso a este material." }, { status: 403 });
  }

  const safeCourseId = path.basename(courseId);
  const safeFileName = path.basename(fileName);
  const filePath = path.join(MATERIALS_ROOT, safeCourseId, safeFileName);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }

  // Dados de cadastro (nome, sobrenome, telefone, cidade, estado) vêm da
  // tabela users, preenchida no cadastro por e-mail/senha. Quem entrou só
  // pelo Google (caso dos e-mails administrativos) não tem linha aqui — nesse
  // caso usa o nome que o próprio Google informou (parâmetro "name"), e
  // telefone/cidade/estado ficam em branco, já que o Google não fornece isso.
  const { rows } = await sql`
    select first_name, last_name, phone, state, city from users where email = ${email}
  `;
  const u = rows[0];
  const fullName = u ? `${u.first_name} ${u.last_name}` : googleName;
  const phone = u?.phone || "";
  const city = u?.city || "";
  const state = u?.state || "";
  const location = city && state ? `${city}/${state}` : city || state || "";
  const stampedAt = new Date().toLocaleString("pt-BR", { timeZone: "America/Fortaleza" });

  const stampParts = [fullName, phone, email, location, stampedAt].filter(Boolean);
  const stampLine = stampParts.join(" · ");

  const original = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(original);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Carimbo único, na margem esquerda (área em branco da folha), na
  // vertical, lendo de baixo pra cima — em vez de sobrepor o conteúdo
  // impresso no meio da página.
  for (const page of pdfDoc.getPages()) {
    const { height } = page.getSize();
    const maxLength = height - 40;

    let size = 9;
    let textWidth = font.widthOfTextAtSize(stampLine, size);
    if (textWidth > maxLength) {
      size = Math.max(5, size * (maxLength / textWidth));
      textWidth = font.widthOfTextAtSize(stampLine, size);
    }

    page.drawText(stampLine, {
      x: 14,
      y: Math.max(20, (height - textWidth) / 2),
      size,
      font,
      color: rgb(0.55, 0.1, 0.08),
      opacity: 0.55,
      rotate: degrees(90),
    });
  }

  const stamped = await pdfDoc.save();

  return new NextResponse(Buffer.from(stamped), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
