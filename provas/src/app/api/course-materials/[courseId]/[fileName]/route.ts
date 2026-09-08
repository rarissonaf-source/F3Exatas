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
  // pelo Google (caso dos e-mails administrativos) pode não ter linha aqui
  // — nesse caso o carimbo sai só com o que existir.
  const { rows } = await sql`
    select first_name, last_name, phone, state, city from users where email = ${email}
  `;
  const u = rows[0];
  const fullName = u ? `${u.first_name} ${u.last_name}` : "";
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

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize();

    page.drawText(stampLine, {
      x: width / 2 - stampLine.length * 3.2,
      y: height / 2,
      size: 13,
      font,
      color: rgb(0.85, 0.15, 0.1),
      opacity: 0.16,
      rotate: degrees(35),
    });

    page.drawText(stampLine, {
      x: 20,
      y: 14,
      size: 7,
      font,
      color: rgb(0.35, 0.35, 0.35),
      opacity: 0.85,
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
