import { NextResponse } from "next/server";
import { getPlanConfig } from "@/lib/plans";

/** Limites des plans exposées publiquement (utilisées par le front et la page /pricing). */
export async function GET() {
  const config = await getPlanConfig().catch(() => null);
  if (!config) {
    return NextResponse.json({ error: "Configuration indisponible" }, { status: 503 });
  }
  return NextResponse.json({
    free: config.free,
    pro: config.pro,
    pricing: config.pricing,
  });
}