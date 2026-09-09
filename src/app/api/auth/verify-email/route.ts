import { NextResponse } from "next/server";
import { pool } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") || "";
  const email = (searchParams.get("email") || "").toLowerCase().trim();

  if (!token || !email) {
    return Response.redirect(new URL("/login?verified=missing", req.url));
  }

  try {
    const result = await pool.query(
      'SELECT token, expires FROM "VerificationToken" WHERE identifier = $1 AND token = $2 LIMIT 1',
      [email, token]
    );
    const row = result.rows[0] as { expires?: string } | undefined;
    if (!row || !row.expires || new Date(row.expires).getTime() < Date.now()) {
      return Response.redirect(new URL("/login?verified=invalid", req.url));
    }

    await pool.query(
      'UPDATE "User" SET email_verified = true, "emailVerified" = $1 WHERE email = $2',
      [new Date().toISOString(), email]
    );
    await pool.query('DELETE FROM "VerificationToken" WHERE identifier = $1', [email]);

    void sendWelcomeEmail(email);

    return Response.redirect(new URL("/login?verified=1", req.url));
  } catch (err) {
    console.error("verify-email error", err);
    return Response.redirect(new URL("/login?verified=error", req.url));
  }
}