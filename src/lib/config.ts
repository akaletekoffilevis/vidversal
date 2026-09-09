/**
 * Configuration côté client pour le téléchargement.
 *
 * - NEXT_PUBLIC_DOWNLOAD_API_URL : URL de base du worker de téléchargement
 *   (Railway/Render/Fly.io). Quand elle est définie, le frontend appelle
 *   directement le worker au lieu des routes /api locales.
 *   Exemple : https://vidversal-worker.up.railway.app
 *
 * - NEXT_PUBLIC_ENABLE_DOWNLOAD : active/désactive l'UI de téléchargement.
 *   Sur Vercel sans worker, mettre "false" affiche le site avec le
 *   téléchargement "bientôt disponible".
 */
export const DOWNLOAD_API_URL =
  process.env.NEXT_PUBLIC_DOWNLOAD_API_URL?.replace(/\/$/, "") || "";

export const DOWNLOAD_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_DOWNLOAD !== "false";

export function apiUrl(path: string): string {
  return DOWNLOAD_API_URL
    ? `${DOWNLOAD_API_URL}${path}`
    : `/api${path}`;
}