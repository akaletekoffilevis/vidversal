import { auth } from "./auth";

/** L'admin est authentifié soit par cookie (session admin classique de /admin)
 *  soit par la session NextAuth avec le rôle admin. */
export async function isAdminRequest(req: Request): Promise<boolean> {
  const cookies = req.headers.get("cookie") ?? "";
  if (/(?:^|;\s*)vidversal_admin=1(?:;|$)/.test(cookies)) return true;
  const session = await auth().catch(() => null);
  return session?.user?.role === "admin";
}

export function unauthorized(): Response {
  return Response.json({ error: "Non autorisé" }, { status: 401 });
}