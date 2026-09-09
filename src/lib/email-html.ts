// Gabarit HTML des emails, aux couleurs du site (thème clair).
// Compatible clients mail : table-based, styles inline.

export const BRAND = "#2563eb";
export const BRAND_DARK = "#1d4ed8";
export const FOREGROUND = "#0f172a";
export const MUTED = "#64748b";
export const SITE_BG = "#f8fafc";
export const CARD_BG = "#ffffff";
export const BORDER = "#e2e8f0";

export function emailHeader(): string {
  return `
    <div style="padding:32px 24px 8px;text-align:center">
      <span style="font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:800;letter-spacing:-0.5px;color:${FOREGROUND}">
        <span style="color:${BRAND}">Vid</span>versal</span>
    </div>
    <div style="padding:0 24px 20px;text-align:center">
      <span style="display:inline-block;width:48px;height:3px;border-radius:2px;background:${BRAND}"></span>
    </div>`;
}

export function emailFooter(): string {
  const year = new Date().getFullYear();
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px">
      <tr>
        <td style="text-align:center;padding:0 24px 32px">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${MUTED}">
            Vidversal — confirmez, téléchargez, savourez.
          </p>
          <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#94a3b8">
            Téléchargement réservé à un usage personnel sur des vidéos publiques.
            Ne contournez jamais les DRM. © ${year} Vidversal
          </p>
          <p style="margin:10px 0 0">
            <a href="https://vidversal.fr" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${BRAND};text-decoration:none">vidversal.fr</a>
          </p>
        </td>
      </tr>
    </table>`;
}

export function emailButton(href: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px 0">
      <tr>
        <td align="center" style="border-radius:10px;background:${BRAND};box-shadow:0 4px 12px rgba(37,99,235,0.28)">
          <a href="${href}" target="_blank"
             style="display:inline-block;padding:13px 28px;border-radius:10px;background:${BRAND};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;text-decoration:none">
            ${label}
          </a>
        </td>
      </tr>
    </table>`;
}

export function emailLayout(opts: {
  title: string;
  body: string;
  preheader?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="fr" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${opts.title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:${SITE_BG};word-spacing:normal">
  ${opts.preheader ? `<div style="display:none;font-size:1px;color:${SITE_BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${opts.preheader}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${SITE_BG}" style="background:${SITE_BG}">
    <tr>
      <td align="center" style="padding:16px 8px 40px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto">
          <tr>
            <td style="padding:0">
              ${emailHeader()}

              <div style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,0.06)">
                <div style="padding:28px 32px">
                  <h1 style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:1.3;font-weight:800;color:${FOREGROUND}">
                    ${opts.title}
                  </h1>
                  <div style="width:36px;height:3px;border-radius:2px;background:${BRAND};margin:0 0 20px"></div>
                  ${opts.body}
                </div>
              </div>

              ${emailFooter()}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}