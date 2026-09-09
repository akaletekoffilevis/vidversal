import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { pool, hashPassword, ADMIN_EMAILS } from "@/lib/auth";
import { sendVerificationEmail, mailEnabled } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { name, email, password } = (await req.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  const cleanEmail = (email || "").toLowerCase().trim();
  if (!cleanEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 8 caractères." },
      { status: 400 }
    );
  }
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Nom requis." }, { status: 400 });
  }

  const role = ADMIN_EMAILS.includes(cleanEmail) ? "admin" : "user";
  const requireVerification = mailEnabled;

  try {
    const existing = await pool.query(
      'SELECT id, email_verified FROM "User" WHERE email = $1 LIMIT 1',
      [cleanEmail]
    );
    if (existing.rows.length > 0) {
      if (existing.rows[0].email_verified) {
        return NextResponse.json(
          { error: "Un compte existe déjà avec cet email. Connectez-vous." },
          { status: 409 }
        );
      }
      const sent = await sendVerificationEmail(cleanEmail);
      return NextResponse.json({
        ok: true,
        needVerification: true,
        message: sent ? "Email de vérification renvoyé. Consultez votre boîte mail." : null,
      });
    }

    const userId = randomUUID();
    await pool.query(
      'INSERT INTO "User" (id, name, email, role, email_verified) VALUES ($1, $2, $3, $4, $5)',
      [userId, name.trim(), cleanEmail, role, !requireVerification]
    );
    // Nettoie d'éventuelles lignes orphelines créées par l'ancien bug (userId aléatoire)
    await pool.query(
      'DELETE FROM "Account" WHERE provider = $1 AND provideraccountid = $2 AND userid NOT IN (SELECT id FROM "User")',
      ["credentials", cleanEmail]
    );
    await pool.query(
      'INSERT INTO "Account" (id, userid, type, provider, provideraccountid, password_hash) VALUES ($1, $2, $3, $4, $5, $6)',
      [randomUUID(), userId, "credentials", "credentials", cleanEmail, hashPassword(password)]
    );

    if (requireVerification) {
      await sendVerificationEmail(cleanEmail);
      return NextResponse.json({
        ok: true,
        needVerification: true,
        message: "Compte créé. Vérifiez votre boîte mail pour activer votre compte.",
      });
    }

    return NextResponse.json({ ok: true, message: "Compte créé. Bienvenue !" });
  } catch (err) {
    console.error("signup error", err);
    return NextResponse.json({ error: "Erreur serveur lors de l'inscription." }, { status: 500 });
  }
}