# Vidversal

**Téléchargez n'importe quelle vidéo, depuis n'importe quelle plateforme, juste avec le lien.**

Collez un lien (YouTube, TikTok, Instagram, X/Twitter, Facebook, Twitch, Vimeo, Dailymotion, Reddit...) et téléchargez la vidéo dans la qualité, le format et la langue de votre choix.

## Fonctionnalités

### Gratuit
- Téléchargement depuis toutes les plateformes majeures
- Qualités standard (jusqu'à 1080p)
- Détection automatique de la plateforme
- Mode sombre/clair
- Historique de téléchargements (avec compte)

### Premium (prochainement)
- Qualité 4K / 8K, HDR, 60fps
- Extraction audio MP3 / FLAC / WAV
- Conversion de format (MP4, WebM, MKV, AVI, GIF...)
- Téléchargement batch (jusqu'à 50 liens)
- Playlists & chaînes entières
- Sous-titres traduits
- Création de GIF
- Résumé + transcription IA (Whisper)
- Téléchargement programmé
- Upload cloud direct (Drive, Dropbox)
- API développeurs
- Sans publicité

## Stack technique

| Brique | Technologie |
|--------|-------------|
| Frontend | Next.js 15 (App Router) + React 19 + TailwindCSS 3 |
| Backend | API Routes Next.js + `yt-dlp` + FFmpeg |
| Auth | Supabase (UI personnalisée) |
| Paiement | Stripe (subscriptions) |
| Icônes | lucide-react |

## Démarrage rapide

```bash
npm install
cp .env.example .env.local  # remplir les clés
npm run dev
```

Ouvrir http://localhost:3000

## Config Supabase + Stripe

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Remplir `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans `.env.local`
3. Créer un compte Stripe et remplir les clés `STRIPE_SECRET_KEY` etc.

## Routes API

### `POST /api/info`
Récupère les infos d'une vidéo (titre, miniature, formats, qualités, sous-titres).

```bash
curl -X POST http://localhost:3000/api/info \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=..."}'
```

### `GET /api/download`
Télécharge directement le fichier.

```bash
# Meilleure qualité vidéo MP4
curl -L "http://localhost:3000/api/download?url=VIDEO_URL"

# Qualité spécifique
curl -L "http://localhost:3000/api/download?url=VIDEO_URL&formatId=137"

# Audio seul (MP3)
curl -L "http://localhost:3000/api/download?url=VIDEO_URL&audioOnly=true"
```

## Note légale

Vidversal est un outil à usage personnel. Téléchargez uniquement du contenu dont vous avez le droit de récupérer, et respectez les droits d'auteur. Ne contournez pas les systèmes de protection (DRM).

---

Projet créé dans le cadre du développement du site de téléchargement universel **Vidversal**.