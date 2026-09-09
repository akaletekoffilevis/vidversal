import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import NeonAdapter from "@auth/neon-adapter";
import { Pool } from "@neondatabase/serverless";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export class EmailNotVerified extends CredentialsSignin {
  code = "email_not_verified";
}

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
});

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: NeonAdapter(pool),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "email-password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email || "").toLowerCase().trim();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;

        try {
          const { rows } = await pool.query(
            "SELECT * FROM \"User\" WHERE email = $1 LIMIT 1",
            [email]
          );
          const user = rows[0] as
            | { id: string; name?: string; email: string; password_hash?: string; image?: string; email_verified?: boolean }
            | undefined;

          if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
            return null;
          }
          if (!user.email_verified) {
            throw new EmailNotVerified();
          }
          return {
            id: user.id,
            name: user.name || user.email.split("@")[0],
            email: user.email,
            image: user.image || null,
          };
        } catch (err) {
          if (err instanceof EmailNotVerified) throw err;
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = ADMIN_EMAILS.includes(String(token.email).toLowerCase())
          ? "admin"
          : "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.uid as string;
        session.user.role = (token.role as "user" | "admin") || "user";
      }
      return session;
    },
    async signIn({ user }) {
      if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        // Diffuse le rôle admin dans la BD pour les accès externes
        await pool.query(
          "UPDATE \"User\" SET role = $1 WHERE email = $2",
          ["admin", user.email.toLowerCase()]
        ).catch(() => {});
      }
      return true;
    },
  },
});