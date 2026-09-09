import { NextRequest, NextResponse } from "next/server";
import { downloadSubtitles } from "@/lib/ytdlp";
import { getTier } from "@/lib/tier";
import fs from "fs/promises";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    const lang = req.nextUrl.searchParams.get("lang") || "all";

    if (!url) return NextResponse.json({ error: "URL requise" }, { status: 400 });

    const tier = await getTier();
    if (!tier.limits.subtitles) {
      return NextResponse.json(
        { error: "Les sous-titres sont réservés aux membres PRO", code: "PRO_REQUIRED" },
        { status: 402 }
      );
    }

    const { filePath, filename } = await downloadSubtitles(url, lang);
    const buf = await fs.readFile(filePath);
    await fs.unlink(filePath).catch(() => {});

    const ext = filename.endsWith(".vtt") ? "text/vtt" : "application/x-subrip";
    return new NextResponse(buf, {
      headers: {
        "Content-Type": ext,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}