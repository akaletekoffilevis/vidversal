import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "admin";
      tier: "free" | "pro";
      banned: boolean;
      avatar_emoji?: string | null;
      lang?: string | null;
      theme?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: string;
    tier?: string;
    banned?: boolean;
    avatar_emoji?: string | null;
    lang?: string | null;
    theme?: string | null;
  }
}