import { NextResponse } from "next/server";
import { sendMail } from "@/lib/email";
import { emailLayout, FOREGROUND, MUTED, BRAND } from "@/lib/email-html";

export const dynamic = "force-dynamic";

const SUBJECTS: Record<string, string> = {
  bug: "Signaler un bug",
  feature: "Suggestion de fonctionnalité",
  billing: "Question sur l'abonnement",
  legal: "Demande légale / RGPD",
  other: "Autre",
};

export async function POST(req: Request) {
  const { name, email, subject, message } = (await req.json()) as {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  const cleanName = (name || "").trim().slice(0, 100);
  const cleanEmail = (email || "").toLowerCase().trim();
  const cleanMessage = (message || "").trim().slice(0, 10000);

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return NextResponse.json(
      { error: "Tous les champs sont requis." },
      { status: 400 }
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  const subjectLabel = subject ? SUBJECTS[subject] || "Autre" : "Autre";
  const destination = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;
  if (!destination) {
    return NextResponse.json(
      { error: "Envoi de messages temporairement indisponible." },
      { status: 503 }
    );
  }

  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:7px 0;white-space:nowrap;vertical-align:top">
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${MUTED}">${label}</span>
      </td>
      <td style="padding:7px 0 7px 14px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${FOREGROUND};word-break:break-all">${value}</td>
    </tr>`;

  const sent = await sendMail({
    to: destination,
    replyTo: cleanEmail,
    subject: `[Contact] ${subjectLabel} — ${cleanName}`,
    text: `Nom : ${cleanName}\nEmail : ${cleanEmail}\nSujet : ${subjectLabel}\n\n${cleanMessage}`,
    html: emailLayout({
      title: "Nouveau message de contact",
      preheader: `De ${cleanName} — ${subjectLabel}`,
      body: `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${row("Nom", esc(cleanName))}
          ${row("Email", esc(cleanEmail))}
          ${row("Sujet", esc(subjectLabel))}
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px">
          <tr>
            <td style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px">
              <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:${MUTED}">Message</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${FOREGROUND};white-space:pre-wrap">${esc(cleanMessage)}</p>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED}">
          Répondre à : <a href="mailto:${esc(cleanEmail)}" style="color:${BRAND}">${esc(cleanEmail)}</a>
        </p>`,
    }),
  });

  if (!sent) {
    return NextResponse.json(
      { error: "Envoi impossible pour le moment. Réessayez plus tard." },
      { status: 502 }
    );
  }
  return NextResponse.json({ ok: true });
}