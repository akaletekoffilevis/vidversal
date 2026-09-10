import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, unauthorized } from "@/lib/admin";

const WORKER_URL_HINTS = [
  process.env.NEXT_PUBLIC_DOWNLOAD_API_URL,
  process.env.VIDVERSAL_DOWNLOAD_API_URL,
].filter(Boolean) as string[];

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();

  let url: string | null = null;
  try {
    const cookie = req.headers.get("cookie") ?? "";
    const parsed = Object.fromEntries(
      cookie.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, v.join("=")];
      })
    );
    if (parsed.vidversal_worker_url && parsed.vidversal_worker_url.startsWith("http")) {
      url = parsed.vidversal_worker_url;
    }
  } catch {
    url = null;
  }
  url = url ?? WORKER_URL_HINTS[0] ?? null;

  const now = Date.now();
  let ok = false;
  let status = 0;
  let detail = "URL non configurée";

  if (url) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(url, { method: "GET", signal: ctrl.signal });
      clearTimeout(timer);
      status = res.status;
      ok = res.ok || status === 400 || status === 404;
      detail = `HTTP ${status}`;
    } catch (err) {
      detail = err instanceof Error && err.name === "AbortError" ? "Timeout (6 s)" : "Injoignable";
    }
  }

  return NextResponse.json({ url, ok, status, detail, latencyMs: Date.now() - now });
}