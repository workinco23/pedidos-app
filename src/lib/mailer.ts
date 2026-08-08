import nodemailer from "nodemailer";

export interface EnviarCorreoLiberacionParams {
  destinatario: string;
  asunto: string;
  cuerpo: string;
  qrDataUrl: string;
}

const BANNER_URL = "https://www.ferreynet.com.pe/#/public";

const BANNER_HTML = `
  <a href="${BANNER_URL}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5a742;border-radius:4px;margin-top:24px;">
      <tr>
        <td style="padding:20px;width:220px;" valign="middle">
          <table role="presentation" cellpadding="0" cellspacing="0" style="background-color:#14141a;border-radius:6px;">
            <tr>
              <td style="padding:16px 20px;">
                <span style="font-family:Arial,sans-serif;font-size:22px;font-weight:bold;color:#ffffff;">ferrey</span><span style="font-family:Arial,sans-serif;font-size:22px;font-weight:bold;color:#f5a742;">net</span>
                <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:1px;color:#cccccc;margin-top:2px;">TU ALIADO DIGITAL</div>
              </td>
            </tr>
          </table>
        </td>
        <td style="padding:20px;" valign="middle">
          <div style="font-family:Arial,sans-serif;font-size:18px;font-weight:bold;color:#7a1f1f;margin-bottom:8px;">Descubre Ferreynet</div>
          <div style="font-family:Arial,sans-serif;font-size:12px;font-weight:bold;color:#3a2a10;line-height:1.5;">
            Descarga comprobantes electrónicos (facturas, notas de crédito y más)<br/>
            Estado de cuenta.<br/>
            Seguimiento de pedidos.
          </div>
        </td>
      </tr>
    </table>
  </a>
`;

export async function enviarCorreoLiberacion({
  destinatario,
  asunto,
  cuerpo,
  qrDataUrl,
}: EnviarCorreoLiberacionParams) {
  const cuerpoHtml = cuerpo
    .split("\n")
    .filter((linea) => linea.trim() !== "")
    .map((linea) => `<p style="margin:0 0 8px;">${linea}</p>`)
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:560px;">
      ${cuerpoHtml}
      <p style="margin:16px 0;"><img src="cid:qr-code" alt="Código QR del pedido" style="width:220px;height:220px" /></p>
      ${BANNER_HTML}
    </div>
  `;

  if (!process.env.SMTP_HOST) {
    console.log(
      `[mailer:mock] Correo a ${destinatario} — asunto: "${asunto}". ` +
        "Configura SMTP_HOST/SMTP_USER/SMTP_PASS en .env.local para enviar correos reales."
    );
    return { mock: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const base64Qr = qrDataUrl.split(",")[1];

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: destinatario,
    subject: asunto,
    html,
    attachments: [
      {
        filename: "qr-pedido.png",
        content: base64Qr,
        encoding: "base64",
        cid: "qr-code",
      },
    ],
  });

  return { mock: false };
}
