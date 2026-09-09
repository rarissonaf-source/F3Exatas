const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_ADDRESS = "F3Exatas <verificacao@f3exatas.com.br>";
const LOGO_URL = "https://www.f3exatas.com.br/assets/logo-f3-badge.png";
const SITE_URL = "https://www.f3exatas.com.br";

function codeEmailHtml(code: string) {
  return `
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Confirme seu e-mail</title>
  </head>
  <body style="margin:0; padding:0; background:#f4f6fb; font-family:Arial, Helvetica, sans-serif;">
    <div style="padding:40px 16px;">
      <div style="max-width:440px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e6e8ef;">
        <div style="background:#131a2c; padding:28px 32px; text-align:center;">
          <img src="${LOGO_URL}" alt="F3Exatas" height="52" style="height:52px; display:inline-block;">
        </div>
        <div style="padding:32px;">
          <h1 style="margin:0 0 12px; font-size:20px; line-height:1.3; color:#131a2c;">Confirme seu e-mail</h1>
          <p style="margin:0 0 24px; font-size:14px; line-height:1.6; color:#444444;">
            Use o código abaixo pra concluir a criação da sua conta na F3Exatas. Ele é válido por 10 minutos.
          </p>
          <div style="background:#f4f6fb; border:1.5px dashed #f38d33; border-radius:12px; padding:18px; text-align:center; margin-bottom:24px;">
            <span style="font-size:34px; font-weight:800; letter-spacing:10px; color:#f38d33;">${code}</span>
          </div>
          <p style="margin:0; font-size:13px; line-height:1.6; color:#8a8f9c;">
            Se você não pediu esse código, pode ignorar este e-mail com segurança — sua conta não será criada sem ele.
          </p>
        </div>
        <div style="background:#f4f6fb; padding:18px 32px; text-align:center; border-top:1px solid #e6e8ef;">
          <p style="margin:0; font-size:12px; color:#9aa0ad;">
            F3Exatas &middot; <a href="${SITE_URL}" style="color:#9aa0ad; text-decoration:underline;">f3exatas.com.br</a>
          </p>
        </div>
      </div>
    </div>
  </body>
</html>
  `;
}

function codeEmailText(code: string) {
  return `Confirme seu e-mail na F3Exatas\n\nSeu código de verificação é: ${code}\n\nEle é válido por 10 minutos. Se você não pediu esse código, pode ignorar este e-mail.\n\nF3Exatas · ${SITE_URL}`;
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
      text: codeEmailText(code),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Falha ao enviar e-mail via Resend (${res.status}): ${detail}`);
  }
}
