# vidversal

Téléchargeur vidéo universel : collez un lien (YouTube, TikTok, Instagram, X, Facebook, Twitch, Vimeo...) et téléchargez la vidéo dans la qualité / le format / la langue de votre choix.

## Stack
- **Frontend** : Next.js 15 (App Router) + React 19 + TailwindCSS 3
- **Backend** : API Routes Next.js + `yt-dlp` (binaire Python + FFmpeg)
- **Auth** : Supabase (custom UI, pas d'UI Supabase par défaut)
- **Paiement** : Stripe (subscriptions)
- **Icônes** : lucide-react

## Commandes
- `npm run dev` — serveur de dev sur http://localhost:3000
- `npm run build` — build de production
- `npm run start` — serveur de production
- `npm run lint` — ESLint

## Structure
- `src/app/` — pages et routes API (App Router)
- `src/components/` — composants React (Header, DownloadForm, Features, Footer)
- `src/lib/` — ytdlp.ts (wrapper yt-dlp), types.ts

## Routes API
- `POST /api/info` `{ url }` → infos vidéo (formats, qualités, sous-titres)
- `GET /api/download?url=...&formatId=...&audioOnly=true` → fichier vidéo/audio

## Variables d'env
Copier `.env.example` → `.env.local` :
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Note légale
Consentement à télécharger uniquement pour usage personnel, vidéos publiques. Ne pas contourner les DRM. Afficher une mention légale dans le footer.

## Notes dev actuelles
- `.env.local` n'existe pas pour l'instant : importer les pages login/signup ne crée le client Supabase qu'à la soumission (guard), le build passe sans clés.
- Le middleware Supabase a été retiré (il plantait en edge sans clés). Le recréer quand Supabase sera configuré (voir Igit log / historique git).
- next/font/google ne marche pas hors réseau : on utilise les polices système. Ne pas réintroduire next/font.
- Le build de prod (`next build`) est très lent ici ; utiliser `next dev` pour itérer.

## Réseau lent de l'environnement de dev
npm install est très lent (timeouts fréquents). Ne pas relancer trop de commandes réseau en parallèle.