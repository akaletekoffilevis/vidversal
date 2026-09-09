import nodemailer from "nodemailer";
import { randomBytes } from "crypto";
import { pool } from "@/lib/auth";
import { emailLayout, emailButton, BRAND, FOREGROUND, MUTED } from "@/lib/email-html";

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;
const from = process.env.EMAIL_FROM || `Vidversal <${user}>`;

export const mailEnabled = Boolean(user && pass);

const transporter = mailEnabled
  ? nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    })
  : null;

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<boolean> {
  if (!transporter) {
    console.warn("[email] SMTP non configuré — email non envoyé");
    return false;
  }
  try {
    await transporter.sendMail({
      from,
      to: opts.to,
      replyTo: opts.replyTo,
      subject: opts.subject,
      text: opts.text,
      html: opts.html || opts.text.replace(/\n/g, "<br/>"),
    });
    return true;
  } catch (err) {
    console.error("[email] erreur d'envoi :", err);
    return false;
  }
}

export async function sendVerificationEmail(email: string): Promise<boolean> {
  if (!mailEnabled) return false;
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

  await pool.query(
    'INSERT INTO "VerificationToken" (identifier, token, expires) VALUES ($1, $2, $3)',
    [email, token, expires]
  );

  const url = new URL("/api/auth/verify-email", buildBaseUrl());
  url.searchParams.set("token", token);
  url.searchParams.set("email", email);
  const link = url.toString();

  return sendMail({
    to: email,
    subject: "Confirmez votre adresse email — Vidversal",
    text: `Bonjour,\n\nMerci de vous être inscrit sur Vidversal.\nPour activer votre compte, cliquez sur le lien ci-dessous :\n\n${link}\n\nCe lien expire dans 24 h.\nSi vous n'avez pas demandé cette inscription, ignorez cet email.\n\nÀ bientôt,\nL'équipe Vidversal`,
    html: emailLayout({
      title: "Vérifiez votre email",
      preheader: "Une dernière étape avant de tout télécharger.",
      body: `
        <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${FOREGROUND}">
          Bonjour,
        </p>
        <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${FOREGROUND}">
          Merci de vous être inscrit sur <strong>Vidversal</strong>.
          Cliquez sur le bouton ci-dessous pour <strong>activer votre compte</strong> :
        </p>
        ${emailButton(link, "Activer mon compte")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0">
          <tr>
            <td style="border-top:1px solid #e2e8f0;padding-top:16px">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${MUTED}">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br />
                <a href="${link}" style="color:${BRAND};word-break:break-all">${link}</a>
              </p>
              <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${MUTED}">
                Ce lien expire dans <strong>24 h</strong>. Si vous n'avez pas demandé cette inscription,
                ignorez simplement cet email.
              </p>
            </td>
          </tr>
        </table>`,
    }),
  });
}

function buildBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  return "http://localhost:3012";
}

export async function sendWelcomeEmail(email: string): Promise<boolean> {
  if (!mailEnabled) return false;
  const url = new URL("/", buildBaseUrl()).toString();
  return sendMail({
    to: email,
    subject: "Bienvenue sur Vidversal 🎉",
    text: `Bienvenue sur Vidversal !\n\nVous pouvez dès maintenant coller un lien YouTube, TikTok, Instagram... et télécharger la vidéo dans la qualité et le format de votre choix.\n\nCommencer : ${url}`,
    html: emailLayout({
      title: "Bienvenue sur Vidversal",
      preheader: "Votre compte est activé. Bonne découverte !",
      body: `
        <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${FOREGROUND}">
          Bonjour, et bienvenue ! Votre compte a bien été <strong>activé</strong>. 🎉
        </p>
        <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${FOREGROUND}">
          Vous pouvez maintenant coller un lien <strong>YouTube, TikTok, Instagram, X, Facebook,
          Twitch, Vimeo</strong>… et télécharger la vidéo dans la <strong>qualité</strong> et le
          <strong>format</strong> de votre choix (vidéo ou audio MP3).
        </p>
        ${emailButton(url, "Commencer à télécharger")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0">
          <tr>
            <td style="border-top:1px solid #e2e8f0;padding-top:16px">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${MUTED}">
                💡 Astuce : utilisez le <strong>mode audio</strong> pour extraire un MP3 en un clic.
              </p>
              <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${MUTED}">
                À très vite,
                <br />L'équipe Vidversal
              </p>
            </td>
          </tr>
        </table>`,
    }),
  });
}