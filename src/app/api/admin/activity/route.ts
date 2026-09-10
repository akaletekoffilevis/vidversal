import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, unauthorized } from "@/lib/admin";
import { ensureSchema, listActivity } from "@/lib/db";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return unauthorized();
  await ensureSchema().catch(() => {});
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 100), 500);
  const items = await listActivity(limit).catch(() => []);
  return NextResponse.json({ items });
}