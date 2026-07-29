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

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "DejaVuSans" },
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
