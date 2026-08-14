import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
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
  // padding assimétrico pra deixar o conteúdo dentro da área quadriculada do
  // modelo: abaixo da faixa laranja do cabeçalho e acima da onda do rodapé.
  page: {
    paddingTop: 70,
    paddingBottom: 210,
    paddingHorizontal: 40,
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
  title: { fontSize: 16, marginBottom: 4, fontFamily: "DejaVuSans", fontWeight: "bold" },
  subtitle: { fontSize: 10, marginBottom: 20, color: "#666" },
  questionHeader: { fontSize: 12, fontFamily: "DejaVuSans", fontWeight: "bold", marginBottom: 6 },
  statement: { marginBottom: 8, lineHeight: 1.4 },
  option: { marginBottom: 3, lineHeight: 1.3 },
  image: { marginVertical: 8 },
  spacer: { borderBottomWidth: 1, borderBottomColor: "#ccc", marginTop: 4, marginBottom: 24 },
  questionBlock: { marginBottom: 4 },
});

const OPTION_LETTER: Record<string, string> = { a: "A", b: "B", c: "C", d: "D", e: "E" };
const DISCIPLINE_NAMES: Record<string, string> = { fisica: "Física", matematica: "Matemática" };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ institution: string; discipline: string; topic: string }> }
) {
  const { institution, discipline, topic } = await params;
  const disciplineName = DISCIPLINE_NAMES[discipline];
  const institutionData = getInstitution(institution);
  const topicMeta = getTopicsForDiscipline(discipline).find((t) => t.slug === topic);
  if (!disciplineName || !institutionData || !topicMeta) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const questions = getQuestionsByTopic(institution, discipline, topic);
  const exams = Object.fromEntries(
    getExams(institution, discipline).map((e) => [e.id, e])
  );

  const publicRoot = path.join(process.cwd(), "public", "content-images", institution, discipline);

  const questionData = await Promise.all(
    questions.map(async (q) => {
      let imageDataUri: string | null = null;
      let imageWidthPt: number | null = null;
      let imageHeightPt: number | null = null;
      if (q.imagePath) {
        const fullPath = path.join(publicRoot, q.imagePath);
        const buf = fs.readFileSync(fullPath);
        const meta = await sharp(buf).metadata();
        const displayWidth = 260; // pt
        const ratio = (meta.height ?? 1) / (meta.width ?? 1);
        imageWidthPt = displayWidth;
        imageHeightPt = displayWidth * ratio;
        imageDataUri = `data:image/png;base64,${buf.toString("base64")}`;
      }
      return { q, imageDataUri, imageWidthPt, imageHeightPt };
    })
  );

  const doc = (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <Image src={TEMPLATE_BG_DATA_URI} style={styles.templateBg} fixed />
        {HEADER_ICON_LINKS.map(({ url, left }) => (
          <Link
            key={url}
            src={url}
            style={{
              position: "absolute",
              top: HEADER_ICON_TOP,
              left,
              width: HEADER_ICON_SIZE,
              height: HEADER_ICON_SIZE,
            }}
            fixed
          >
            <View style={{ width: "100%", height: "100%" }} />
          </Link>
        ))}
        <Text style={styles.title}>
          {institutionData.name} — {disciplineName} — {topicMeta.name}
        </Text>
        <Text style={styles.subtitle}>
          {questions.length} questões · espaço reservado para resolução após cada uma
        </Text>

        {questionData.map(({ q, imageDataUri, imageWidthPt, imageHeightPt }) => {
          const exam = exams[q.examId];
          return (
            <View key={q.id} style={styles.questionBlock} wrap={false}>
              <Text style={styles.questionHeader}>
                Questão {q.number} — {institutionData.name} {exam?.edition}
              </Text>
              <Text style={styles.statement}>{latexToPlainText(q.statement)}</Text>
              {imageDataUri && (
                <Image
                  src={imageDataUri}
                  style={{ ...styles.image, width: imageWidthPt!, height: imageHeightPt! }}
                />
              )}
              {q.options.map((opt) => (
                <Text key={opt.label} style={styles.option}>
                  {OPTION_LETTER[opt.label]}) {latexToPlainText(opt.text)}
                </Text>
              ))}
              <View style={styles.spacer} />
              <View style={{ height: 160 }} />
            </View>
          );
        })}
      </Page>
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
