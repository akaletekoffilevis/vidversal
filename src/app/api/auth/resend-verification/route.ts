import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email } = (await req.json()) as { email?: string };
  const cleanEmail = (email || "").toLowerCase().trim();
  if (!cleanEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  const sent = await sendVerificationEmail(cleanEmail);
  if (!sent) {
    return NextResponse.json(
      { error: "Impossible d'envoyer l'email. Réessayez plus tard." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, message: "Email de vérification renvoyé." });
}