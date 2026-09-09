import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { pool, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { token, email, password } = (await req.json()) as {
    token?: string;
    email?: string;
    password?: string;
  };

  const cleanEmail = (email || "").toLowerCase().trim();
  if (!cleanEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 8 caractères." },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(
      'SELECT expires FROM "VerificationToken" WHERE identifier = $1 AND token = $2 LIMIT 1',
      [cleanEmail, token || ""]
    );
    const row = result.rows[0] as { expires?: string } | undefined;
    if (!row || !row.expires || new Date(row.expires).getTime() < Date.now()) {
      return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 400 });
    }

    const userResult = await pool.query('SELECT id FROM "User" WHERE email = $1 LIMIT 1', [
      cleanEmail,
    ]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 400 });
    }
    const userId = userResult.rows[0].id as string;

    const hash = hashPassword(password);
    await pool.query(
      `INSERT INTO "Account" (id, "userId", type, provider, "providerAccountId", password_hash)
       VALUES ($1, $2, 'credentials', 'credentials', $3, $4)
       ON CONFLICT (provider, "providerAccountId")
       DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [randomUUID(), userId, cleanEmail, hash]
    );

    await pool.query('DELETE FROM "VerificationToken" WHERE identifier = $1', [cleanEmail]);

    return NextResponse.json({ ok: true, message: "Mot de passe réinitialisé." });
  } catch (err) {
    console.error("reset-password error", err);
    return NextResponse.json({ error: "Erreur serveur lors de la réinitialisation." }, { status: 500 });
  }
}