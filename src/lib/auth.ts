import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import NeonAdapter from "@auth/neon-adapter";
import { Pool } from "@neondatabase/serverless";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getEnv } from "./config";
import { getDbUserByEmail } from "./db";

export class EmailNotVerified extends CredentialsSignin {
  code = "email_not_verified";
}

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const pool = new Pool({
  connectionString: getEnv(
    "VIDVERSAL_DATABASE_URL_UNPOOLED",
    "DATABASE_URL_UNPOOLED",
    "VIDVERSAL_DATABASE_URL",
    "DATABASE_URL",
  ),
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
          // Répare les liens de connexion orphelins créés par l'ancien bug
          // (Account credentials avec userid aléatoire) : rattache chaque ligne
          // au User du même email pour que l'ancien mot de passe refonctionne.
          await pool.query(
            `UPDATE "Account" a
             SET userid = u.id
             FROM "User" u
             WHERE a.provider = 'credentials'
               AND NOT EXISTS (SELECT 1 FROM "User" x WHERE x.id = a.userid)
               AND u.email = a.provideraccountid`
          ).catch(() => {});

          const { rows } = await pool.query(
            `SELECT u.*, a.password_hash FROM "User" u
             LEFT JOIN "Account" a ON a.userid = u.id AND a.provider = 'credentials'
             WHERE u.email = $1 LIMIT 1`,
            [email]
          );
          const user = rows[0] as
            | { id: string; name?: string; email: string; password_hash?: string; image?: string; email_verified?: boolean; banned?: boolean }
            | undefined;

          if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
            return null;
          }
          if (user.banned) {
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
        if (token.email) {
          const dbUser = await getDbUserByEmail(token.email).catch(() => null);
          token.tier = dbUser?.tier ?? "free";
          token.banned = dbUser?.banned ?? false;
          token.avatar_emoji = dbUser?.avatar_emoji ?? null;
          token.lang = dbUser?.lang ?? null;
          token.theme = dbUser?.theme ?? "system";
        }
      }
      if (token.role !== "admin") {
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
        session.user.tier = (token.tier as "free" | "pro") || "free";
        session.user.banned = Boolean(token.banned);
        session.user.avatar_emoji = (token.avatar_emoji as string | null | undefined) ?? null;
        session.user.lang = (token.lang as string | null | undefined) ?? null;
        session.user.theme = (token.theme as string | null | undefined) ?? "system";
      }
      return session;
    },
    async signIn({ user }) {
      if (user.email) {
        const email = user.email.toLowerCase();
        if (ADMIN_EMAILS.includes(email)) {
          // Diffuse le rôle admin dans la BD pour les accès externes
          await pool.query(
            "UPDATE \"User\" SET role = $1 WHERE email = $2",
            ["admin", email]
          ).catch(() => {});
          return true;
        }
        const dbUser = await getDbUserByEmail(email).catch(() => null);
        if (dbUser?.banned) return false;
      }
      return true;
    },
  },
});