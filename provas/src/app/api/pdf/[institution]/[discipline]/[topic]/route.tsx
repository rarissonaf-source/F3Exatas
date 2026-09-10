import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Link,
  Font,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { getExams, getQuestionsByTopic } from "@/lib/data";
import { getTopicsForDiscipline } from "@/lib/topics";
import { getInstitution } from "@/lib/institutions";
import { latexToPlainText } from "@/lib/latex-plain";
import { hasProvasPlusAccess } from "@/lib/provas-plus";
import type { Question } from "@/lib/types";

export const runtime = "nodejs";

// DejaVu Sans has full Unicode coverage (superscript/subscript digits, Greek
// letters, √, ×, ·) — the standard Helvetica font only covers WinAnsi and
// renders those as broken glyphs.
Font.register({
  family: "DejaVuSans",
  fonts: [
    { src: path.join(process.cwd(), "src/fonts/DejaVuSans.ttf"), fontWeight: "normal" },
    { src: path.join(process.cwd(), "src/fonts/DejaVuSans-Bold.ttf"), fontWeight: "bold" },
  ],
});

// Página A4 em pontos (72pt/in) — mesma proporção do fundo rasterizado a
// partir do modelo da F3Exatas (src/pdf-assets/f3-template-bg.png).
const PAGE_WIDTH_PT = 595.28;
const PAGE_HEIGHT_PT = 841.89;

// Área útil dentro do modelo: abaixo da faixa laranja do cabeçalho e acima
// da onda do rodapé (medida sobre o fundo rasterizado).
const PADDING_TOP = 70;
const PADDING_BOTTOM = 100;
const PADDING_X = 40;
const COLUMN_GAP = 24;
const COLUMN_WIDTH = (PAGE_WIDTH_PT - PADDING_X * 2 - COLUMN_GAP) / 2;

const TEMPLATE_BG_DATA_URI = (() => {
  const buf = fs.readFileSync(path.join(process.cwd(), "src/pdf-assets/f3-template-bg.png"));
  return `data:image/png;base64,${buf.toString("base64")}`;
})();

// Links dos ícones do cabeçalho do modelo (whatsapp, instagram, site) — uma
// constante cada, pra trocar em um lugar só quando o número/canal mudar.
const WHATSAPP_URL = "https://whatsapp.com/channel/0029Vb6EbFCDp2QFrLj4Ge3r";
const INSTAGRAM_URL = "https://www.instagram.com/f3exatas";
const SITE_URL = "https://f3-exatas.vercel.app";

// Posição (em pt) de cada ícone dentro da faixa laranja do cabeçalho,
// medida sobre o fundo rasterizado em src/pdf-assets/f3-template-bg.png.
const HEADER_ICON_LINKS = [
  { url: WHATSAPP_URL, left: 449 },
  { url: INSTAGRAM_URL, left: 501 },
  { url: SITE_URL, left: 553 },
] as const;
const HEADER_ICON_TOP = 7;
const HEADER_ICON_SIZE = 30;

const styles = StyleSheet.create({
  page: {
    paddingTop: PADDING_TOP,
    paddingBottom: PADDING_BOTTOM,
    paddingHorizontal: PADDING_X,
    fontSize: 11,
    fontFamily: "DejaVuSans",
  },
  templateBg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE_WIDTH_PT,
    height: PAGE_HEIGHT_PT,
  },
  title: { fontSize: 15, marginBottom: 3, fontFamily: "DejaVuSans", fontWeight: "bold" },
  subtitle: { fontSize: 9, marginBottom: 14, color: "#666" },
  columns: { flexDirection: "row", gap: COLUMN_GAP },
  column: { width: COLUMN_WIDTH },
  questionHeader: { fontSize: 10.5, fontFamily: "DejaVuSans", fontWeight: "bold", marginBottom: 4, color: "#263959" },
  statement: { marginBottom: 6, lineHeight: 1.35 },
  option: { marginBottom: 2, lineHeight: 1.3 },
  image: { marginVertical: 6 },
  questionBlock: { marginBottom: 12, paddingBottom: 10, borderBottomWidth: 0.75, borderBottomColor: "#ddd" },
});

const OPTION_LETTER: Record<string, string> = { a: "A", b: "B", c: "C", d: "D", e: "E" };
const DISCIPLINE_NAMES: Record<string, string> = { fisica: "Física", matematica: "Matemática" };

// Largura de exibição das imagens dentro de uma coluna (mais estreita que a
// coluna inteira pra sobrar respiro nas laterais).
const IMAGE_DISPLAY_WIDTH = 190;

// Lê largura/altura direto do cabeçalho IHDR do PNG (todas as imagens do
// conteúdo são PNG). Evita depender do `sharp`, cujo binário nativo não
// carrega de forma confiável no runtime serverless da Vercel.
function getPngDimensions(buf: Buffer): { width: number; height: number } {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

// Estimativa de layout pra decidir quantas questões cabem em cada coluna —
// @react-pdf/renderer não tem "column-count" nativo, então paginamos à mão
// medindo a altura provável de cada questão (heurística, não exata: baseada
// em contagem de caracteres por linha pra DejaVu Sans 11pt numa coluna de
// ~COLUMN_WIDTH pt). A página continua com `wrap` ligado como rede de
// segurança, caso a estimativa erre pra menos.
// Constantes calibradas contra renderizações reais (a altura de linha do
// @react-pdf/renderer fica bem acima de fontSize*lineHeight — tem um
// espaçamento extra embutido no motor de texto).
const CHARS_PER_LINE = Math.floor(COLUMN_WIDTH / 5.3);
const STATEMENT_LINE_HEIGHT = 17;
const OPTION_LINE_HEIGHT = 16;
const HEADER_BLOCK_HEIGHT = 19;
const QUESTION_BLOCK_SPACING = 12 + 10; // marginBottom + paddingBottom do questionBlock
const PAGE_HEADER_HEIGHT = 15 + 3 + 9 + 14; // title + subtitle, com margens

function estimateLines(text: string, charsPerLine: number) {
  return Math.max(1, Math.ceil(text.length / charsPerLine));
}

function estimateQuestionHeight(
  q: Question,
  imageHeightPt: number | null
): number {
  let height = HEADER_BLOCK_HEIGHT;
  height += estimateLines(latexToPlainText(q.statement), CHARS_PER_LINE) * STATEMENT_LINE_HEIGHT + 6;
  if (imageHeightPt) height += imageHeightPt + 12;
  for (const opt of q.options) {
    const lines = estimateLines(latexToPlainText(opt.text), CHARS_PER_LINE - 3);
    height += lines * OPTION_LINE_HEIGHT + 2;
  }
  height += QUESTION_BLOCK_SPACING;
  return height;
}

interface QuestionRenderData {
  q: Question;
  imageDataUri: string | null;
  imageWidthPt: number | null;
  imageHeightPt: number | null;
  examLabel: string;
}

interface PageChunk {
  left: QuestionRenderData[];
  right: QuestionRenderData[];
}

// Preenche a coluna esquerda até estourar a altura útil, depois a direita,
// depois abre uma nova página — mesma leitura de um caderno de provas impresso.
// Ao topar com uma questão grande demais pra sobra da coluna, procura, numa
// janela próxima da fila, uma questão menor que ainda caiba ali — sem isso, o
// algoritmo abriria página nova e desperdiçaria o resto do espaço da coluna.
const LOOKAHEAD_WINDOW = 10;
// Reserva de segurança sobre a altura estimada — a contagem de linhas por
// caractere é uma aproximação, então evita decisões de encaixe coladas no
// limite exato (o que faria o próprio @react-pdf/renderer abrir uma página
// extra pra continuar o conteúdo que estourou).
const HEIGHT_SAFETY_FACTOR = 0.97;

function chunkIntoPages(items: QuestionRenderData[]): PageChunk[] {
  const usableHeight =
    (PAGE_HEIGHT_PT - PADDING_TOP - PADDING_BOTTOM - PAGE_HEADER_HEIGHT) * HEIGHT_SAFETY_FACTOR;
  const heights = new Map(items.map((item) => [item, estimateQuestionHeight(item.q, item.imageHeightPt)]));
  const queue = [...items];
  const pages: PageChunk[] = [];

  function fillColumn(target: QuestionRenderData[]): number {
    let filled = 0;
    let progress = true;
    while (progress) {
      progress = false;
      const window = Math.min(queue.length, LOOKAHEAD_WINDOW);
      for (let i = 0; i < window; i++) {
        const h = heights.get(queue[i])!;
        if (filled + h <= usableHeight || target.length === 0) {
          target.push(queue[i]);
          filled += h;
          queue.splice(i, 1);
          progress = true;
          break;
        }
      }
    }
    return filled;
  }

  while (queue.length > 0) {
    const left: QuestionRenderData[] = [];
    const right: QuestionRenderData[] = [];
    fillColumn(left);
    fillColumn(right);
    pages.push({ left, right });
  }
  return pages;
}

function QuestionEntry({ data }: { data: QuestionRenderData }) {
  const { q, imageDataUri, imageWidthPt, imageHeightPt, examLabel } = data;
  return (
    <View style={styles.questionBlock} wrap={false}>
      <Text style={styles.questionHeader}>
        Questão {q.number} — {examLabel}
      </Text>
      <Text style={styles.statement}>{latexToPlainText(q.statement)}</Text>
      {imageDataUri && (
        <Image src={imageDataUri} style={{ ...styles.image, width: imageWidthPt!, height: imageHeightPt! }} />
      )}
      {q.options.map((opt) => (
        <Text key={opt.label} style={styles.option}>
          {OPTION_LETTER[opt.label]}) {latexToPlainText(opt.text)}
        </Text>
      ))}
    </View>
  );
}

function TemplateChrome() {
  return (
    <>
      <Image src={TEMPLATE_BG_DATA_URI} style={styles.templateBg} fixed />
      {HEADER_ICON_LINKS.map(({ url, left }) => (
        <Link
          key={url}
          src={url}
          style={{ position: "absolute", top: HEADER_ICON_TOP, left, width: HEADER_ICON_SIZE, height: HEADER_ICON_SIZE }}
          fixed
        >
          <View style={{ width: "100%", height: "100%" }} />
        </Link>
      ))}
    </>
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ institution: string; discipline: string; topic: string }> }
) {
  const { institution, discipline, topic } = await params;
  const disciplineName = DISCIPLINE_NAMES[discipline];
  const institutionData = getInstitution(institution);
  const topicMeta = getTopicsForDiscipline(discipline).find((t) => t.slug === topic);
  if (!disciplineName || !institutionData || !topicMeta) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // Baixar o PDF de resolução é um recurso do F3Provas+ — sempre confirmado no servidor.
  const accountKey = req.nextUrl.searchParams.get("accountKey") || "";
  if (!accountKey || !(await hasProvasPlusAccess(accountKey))) {
    return NextResponse.json(
      { error: "Baixar o PDF de resolução é exclusivo de quem tem o F3Provas+." },
      { status: 403 }
    );
  }

  const questions = getQuestionsByTopic(institution, discipline, topic);
  const exams = Object.fromEntries(getExams(institution, discipline).map((e) => [e.id, e]));

  const publicRoot = path.join(process.cwd(), "public", "content-images", institution, discipline);

  const questionData: QuestionRenderData[] = questions.map((q) => {
    let imageDataUri: string | null = null;
    let imageWidthPt: number | null = null;
    let imageHeightPt: number | null = null;
    if (q.imagePath) {
      const fullPath = path.join(publicRoot, q.imagePath);
      const buf = fs.readFileSync(fullPath);
      const { width, height } = getPngDimensions(buf);
      const ratio = height / width;
      imageWidthPt = IMAGE_DISPLAY_WIDTH;
      imageHeightPt = IMAGE_DISPLAY_WIDTH * ratio;
      imageDataUri = `data:image/png;base64,${buf.toString("base64")}`;
    }
    const exam = exams[q.examId];
    return {
      q,
      imageDataUri,
      imageWidthPt,
      imageHeightPt,
      examLabel: `${institutionData.name} ${exam?.edition ?? ""}`.trim(),
    };
  });

  const pages = chunkIntoPages(questionData);

  const doc = (
    <Document>
      {pages.map((chunk, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page} wrap>
          <TemplateChrome />
          {pageIndex === 0 && (
            <>
              <Text style={styles.title}>
                {institutionData.name} — {disciplineName} — {topicMeta.name}
              </Text>
              <Text style={styles.subtitle}>{questions.length} questões</Text>
            </>
          )}
          <View style={styles.columns}>
            <View style={styles.column}>
              {chunk.left.map((item) => (
                <QuestionEntry key={item.q.id} data={item} />
              ))}
            </View>
            <View style={styles.column}>
              {chunk.right.map((item) => (
                <QuestionEntry key={item.q.id} data={item} />
              ))}
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );

  const buffer = await renderToBuffer(doc);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${institution}-${discipline}-${topic}.pdf"`,
    },
  });
}
