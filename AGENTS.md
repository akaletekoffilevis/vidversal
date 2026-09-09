# vidversal

Téléchargeur vidéo universel : collez un lien (YouTube, TikTok, Instagram, X, Facebook, Twitch, Vimeo...) et téléchargez la vidéo dans la qualité / le format / la langue de votre choix.

## Stack
- **Frontend** : Next.js (App Router) + React 19 + TailwindCSS 3
- **Backend** : API Routes Next.js + `yt-dlp` (binaire Python + FFmpeg)
- **Auth** : **Auth.js (NextAuth v5 beta)** — Neon Adapter + JWT. Providers : Credentials (email/mdp + hash scrypt) et Google. Vérification d'email obligatoire avant premier login.
- **Base de données** : **Neon (Postgres)** — tables Auth.js : User, Account, Session, VerificationToken (+ `email_verified`, `role`). Schéma : `supabase-schema-neon.sql`.
- **Paiement** : Stripe (subscriptions) — non branché pour l'instant.
- **Icônes** : lucide-react

## Commandes
- `npm run dev` — serveur de dev (utiliser `next dev -p 3012` ici)
- `npm run build` — build de production (très lent ici)
- `npm run start` — serveur de production
- `npm run lint` — ESLint
- `npx tsc --noEmit` — vérification TypeScript (à faire après chaque changement)
- `node scripts/migrate.mjs` — applique le schéma Neon (idempotent)

## Structure
- `src/app/` — pages et routes API (App Router)
- `src/app/api/auth/[...nextauth]/route.ts` — handler NextAuth
- `src/lib/auth.ts` — config NextAuth : adapter Neon, credentials (scrypt), `ADMIN_EMAILS`, classe `EmailNotVerified` (code `email_not_verified`)
- `src/lib/email.ts` — envoi d'email SMTP Gmail (nodemailer), `mailEnabled`
- `src/app/api/auth/signup/route.ts` — inscription + envoi email de vérification (`sendVerificationEmail`)
- `src/app/api/auth/verify-email/route.ts` — valide le token, passe `email_verified` à true, redirige `/login?verified=1`
- `src/app/api/auth/resend-verification/route.ts` — renvoie l'email de vérification
- `src/app/login/page.tsx` / `signup/page.tsx` — UI connexion/inscription (NextAuth, pas Supabase)
- `src/components/` — Header, DownloadForm, Features, Footer, VideoPreview, admin/*
- `src/lib/settings.ts` — settings admin persistés en localStorage
- `src/app/admin/` — panneau d'admin (cookie `vidversal_admin` + `ADMIN_PASSWORD`)
- `src/lib/i18n.tsx` — i18n FR/EN : provider + hook `useI18n` (`t(path, vars)`, `locale`, `setLocale`, `loc`). Choix mémorisé dans `localStorage` (`vidversal-lang`), défaut = langue du navigateur, repli FR côté SSR (pas de routes /fr /en). Dictionnaires : `src/lib/messages/fr.ts` et `en.ts` (structure miroir ~`typeof messagesFr`).
- Pages (info) : composants clients partagés dans `src/components/info/InfoPages.tsx` (About/Contact/Faq/SectionPage). Le marqueur `CONTACTLINK` dans les dictionnaires injecte le lien « page de contact ». Ne jamais afficher d'email de contact (uniquement le formulaire).

## Environnement
Copier `.env.example` → `.env.local` (`.env.local` est gitignoré) :
```
DATABASE_URL=            # Neon pooled (proxy) — Auth.js
DATABASE_URL_UNPOOLED=   # URL directe pour les scripts de migration
AUTH_SECRET=             # npx auth secret
AUTH_TRUST_HOST=true
ADMIN_EMAILS=            # emails admins, séparés par des virgules
AUTH_GOOGLE_ID=          # vide = bouton Google masqué
AUTH_GOOGLE_SECRET=
NEXT_PUBLIC_GOOGLE_ENABLED=false
EMAIL_USER=              # Gmail
EMAIL_PASSWORD=          # mot de passe d'application Gmail (jamais committer)
EMAIL_FROM=Vidversal <...>
ADMIN_PASSWORD=          # page /admin
NEXT_PUBLIC_DOWNLOAD_API_URL=
NEXT_PUBLIC_ENABLE_DOWNLOAD=true
```
⚠️ **Ne jamais commitier ni répéter** les valeurs de `.env.local` (mot de passe Gmail, URL Neon, etc.).

## Note légale
Consentement à télécharger uniquement pour usage personnel, vidéos publiques. Ne pas contourner les DRM. Mention légale dans le footer et la page /legal.

## Notes dev actuelles
- Réseau très lent : npm install ≈ 8 min, en `nohup`/arrière-plan ; timeouts bash longs ; Neon instable (réessayer).
- Ne pas réintroduire `next/font` (polices système uniquement).
- `next build` très lent ici : itérer avec `next dev`.
- Le worker de téléchargement (yt-dlp + ffmpeg) n'est pas encore déployé : à héberger gratuitement (Oracle Cloud ARM / Railway / Render / Fly.io) et coller son URL dans `/admin → Général → URL du worker`.