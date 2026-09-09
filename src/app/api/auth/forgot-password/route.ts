import { NextResponse } from "next/server";
import { pool } from "@/lib/auth";
import { sendPasswordResetEmail, mailEnabled } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email } = (await req.json()) as { email?: string };
  const cleanEmail = (email || "").toLowerCase().trim();

  if (!cleanEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  if (mailEnabled) {
    try {
      const { rows } = await pool.query('SELECT id FROM "User" WHERE email = $1 LIMIT 1', [
        cleanEmail,
      ]);
      if (rows.length > 0) {
        await sendPasswordResetEmail(cleanEmail);
      }
    } catch (err) {
      console.error("forgot-password error", err);
    }
  }

  // Réponse générique pour ne pas révéler si l'adresse existe.
  return NextResponse.json({ ok: true });
}