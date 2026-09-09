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
  const token = await createToken(email, 1000 * 60 * 60 * 24);

  const url = new URL("/api/auth/verify-email", getBaseUrl());
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

function createToken(email: string, ttlMs: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + ttlMs).toISOString();
  return pool
    .query(
      'INSERT INTO "VerificationToken" (identifier, token, expires) VALUES ($1, $2, $3)',
      [email, token, expires]
    )
    .then(() => token);
}

/**
 * URL de base des liens envoyés par email.
 * Priorité : SITE_URL (domaine public, ex. https://vidversal.fr),
 * puis l'alias de production Vercel, puis AUTH_URL / NEXTAUTH_URL.
 * Ne PAS utiliser VERCEL_URL en premier : c'est l'URL interne de déploiement
 * (https://projet-hash-user.vercel.app) qui change à chaque push
 * et pointe vers de vieux déploiements → liens morts après quelques heures.
 */
export function getBaseUrl(): string {
  const explicit =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3012";
}

export async function sendPasswordResetEmail(email: string): Promise<boolean> {
  if (!mailEnabled) return false;
  const token = await createToken(email, 1000 * 60 * 60);

  const url = new URL("/reset-password", getBaseUrl());
  url.searchParams.set("token", token);
  url.searchParams.set("email", email);
  const link = url.toString();

  return sendMail({
    to: email,
    subject: "Réinitialisation de votre mot de passe — Vidversal",
    text: `Bonjour,\n\nVous avez demandé à réinitialiser votre mot de passe Vidversal.\nCliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :\n\n${link}\n\nCe lien expire dans 1 h.\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.\n\nL'équipe Vidversal`,
    html: emailLayout({
      title: "Réinitialiser votre mot de passe",
      preheader: "Un lien pour choisir un nouveau mot de passe.",
      body: `
        <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${FOREGROUND}">
          Bonjour,
        </p>
        <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${FOREGROUND}">
          Vous avez demandé à réinitialiser votre mot de passe <strong>Vidversal</strong>.
          Cliquez sur le bouton ci-dessous pour en choisir un nouveau :
        </p>
        ${emailButton(link, "Réinitialiser mon mot de passe")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0">
          <tr>
            <td style="border-top:1px solid #e2e8f0;padding-top:16px">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${MUTED}">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br />
                <a href="${link}" style="color:${BRAND};word-break:break-all">${link}</a>
              </p>
              <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${MUTED}">
                Ce lien expire dans <strong>1 h</strong>. Si vous n'êtes pas à l'origine de cette
                demande, ignorez simplement cet email.
              </p>
            </td>
          </tr>
        </table>`,
    }),
  });
}

export async function sendWelcomeEmail(email: string): Promise<boolean> {
  if (!mailEnabled) return false;
  const url = new URL("/", getBaseUrl()).toString();
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