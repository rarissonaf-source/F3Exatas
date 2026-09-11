import { NextRequest, NextResponse } from "next/server";
import { sendQuestionReportEmail } from "@/lib/email";

const MAX_MESSAGE_LENGTH = 2000;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const questionLabel = typeof body.questionLabel === "string" ? body.questionLabel.trim().slice(0, 200) : "";
  const questionId = typeof body.questionId === "string" ? body.questionId.trim().slice(0, 200) : "";
  const questionUrl = typeof body.questionUrl === "string" ? body.questionUrl.trim().slice(0, 500) : "";
  const userName = typeof body.userName === "string" ? body.userName.trim().slice(0, 120) : "Usuário F3Exatas";
  const userEmail = typeof body.userEmail === "string" ? body.userEmail.trim().slice(0, 200) : "";

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Descreva o que deseja reportar." }, { status: 400 });
  }
  if (!questionLabel || !questionId) {
    return NextResponse.json({ error: "Questão não identificada." }, { status: 400 });
  }

  try {
    await sendQuestionReportEmail({
      userName: userName || "Usuário F3Exatas",
      userEmail,
      questionLabel,
      questionId,
      questionUrl,
      message,
    });
  } catch (err) {
    console.error("Falha ao enviar report de questão:", err);
    return NextResponse.json(
      { error: "Não foi possível enviar o report. Tente novamente em instantes." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
