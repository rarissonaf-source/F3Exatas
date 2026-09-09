const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_ADDRESS = "F3Exatas <verificacao@f3exatas.com.br>";

function codeEmailHtml(code: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 420px; margin: 0 auto; color: #131a2c;">
      <h2 style="margin-bottom: 8px;">Confirme seu e-mail</h2>
      <p style="color: #444; line-height: 1.5;">
        Use o código abaixo para concluir a criação da sua conta na F3Exatas:
      </p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 10px; text-align: center; color: #ff7a1a; margin: 24px 0;">
        ${code}
      </p>
      <p style="color: #888; font-size: 13px;">
        O código expira em 10 minutos. Se você não solicitou esse código, pode ignorar este e-mail.
      </p>
    </div>
  `;
}

/** Envia o código de verificação de cadastro via Resend. Lança erro se a API não estiver configurada ou falhar. */
export async function sendSignupCodeEmail(to: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY não configurada.");
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [to],
      subject: "Seu código de verificação — F3Exatas",
      html: codeEmailHtml(code),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Falha ao enviar e-mail via Resend (${res.status}): ${detail}`);
  }
}
