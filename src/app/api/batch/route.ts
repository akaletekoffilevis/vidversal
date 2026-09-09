import { NextRequest, NextResponse } from "next/server";
import { getTier } from "@/lib/tier";
import { downloadVideo } from "@/lib/ytdlp";
import fs from "fs/promises";
import path from "path";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const { urls, audioOnly } = await req.json();
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "Liste d'URLs requise" }, { status: 400 });
    }

    const tier = await getTier();
    if (urls.length > tier.limits.batchSize) {
      return NextResponse.json(
        { error: `Le téléchargement batch est limité à ${tier.limits.batchSize} vidéos. Passez PRO pour aller plus loin.`, code: "BATCH_LIMIT" },
        { status: 402 }
      );
    }

    const results = [];
    for (const url of urls) {
      if (typeof url !== "string") {
        results.push({ url, ok: false, error: "URL invalide" });
        continue;
      }
      try {
        const { filePath, filename } = await downloadVideo(url, {
          audioOnly: Boolean(audioOnly),
          audioFormat: "mp3",
        });
        const buf = await fs.readFile(filePath);
        await fs.unlink(filePath).catch(() => {});
        results.push({ url, ok: true, filename, data: buf });
      } catch (e) {
        results.push({ url, ok: false, error: e instanceof Error ? e.message : "Erreur" });
      }
    }

    const okResults = results.filter((r) => r.ok && r.data);
    if (okResults.length === 0) {
      return NextResponse.json({ success: false, total: urls.length, results }, { status: 400 });
    }

    // Un seul fichier : on renvoie directement
    if (okResults.length === 1) {
      const r = okResults[0];
      return new NextResponse(r.data, {
        headers: {
          "Content-Type": audioOnly ? "audio/mpeg" : "video/mp4",
          "Content-Disposition": `attachment; filename="${r.filename}"`,
        },
      });
    }

    // Plusieurs : on les envoie un à un via des URLs temporaires n'est pas possible ici
    // On renvoie les métadonnées, le client téléchargera en série.
    return NextResponse.json({
      success: true,
      total: urls.length,
      results: results.map(({ data, ...rest }) => rest),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}