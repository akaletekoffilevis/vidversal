-- Schéma Auth.js pour Neon (lancer dans le SQL Editor de Neon)
-- Crée les tables gérées par l'adaptateur @auth/neon-adapter.

create table if not exists "User" (
  id text primary key,
  name text,
  email text not null,
  emailVerified timestamp with time zone,
  image text,
  email_verified boolean not null default false
);

create table if not exists "Account" (
  id text primary key,
  userId text not null references "User" (id) on delete cascade,
  type text not null,
  provider text not null,
  providerAccountId text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  password_hash text,
  unique (provider, providerAccountId)
);

create table if not exists "Session" (
  id text primary key,
  sessionToken text not null unique,
  userId text not null references "User" (id) on delete cascade,
  expires timestamp with time zone not null
);

create table if not exists "VerificationToken" (
  identifier text not null,
  token text not null,
  expires timestamp with time zone not null,
  unique (identifier, token)
);

-- Prépare le rôle admin (met à jour l'email à l'inscription)
alter table "User" add column if not exists email_verified boolean not null default false;
alter table "User" add column if not exists role text not null default 'user';
create index if not exists "User_email_key" on "User" (email);

-- Nettoie les lignes de connexion orphelines créées par un ancien bug (userId aléatoire)
delete from "Account" where provider = 'credentials' and userid not in (select id from "User");

-- ============================================================
-- Extension du compte : plans, favoris, historique, journal, plans admin
-- (idempotent — ajouté pour les fonctionnalités premium)
-- ============================================================
alter table "User" add column if not exists tier text not null default free;
alter table "User" add column if not exists banned boolean not null default false;
alter table "User" add column if not exists avatar_emoji text;
alter table "User" add column if not exists lang text;
alter table "User" add column if not exists theme text not null default system;
alter table "User" add column if not exists created_at timestamptz not null default now();

create table if not exists "downloads" (
  id bigserial primary key,
  "userId" text not null references "User" (id) on delete cascade,
  url text,
  title text,
  platform text,
  format text,
  quality text,
  size_bytes bigint,
  status text not null default completed,  created_at timestamptz not null default now()
);
create index if not exists idx_downloads_user on "downloads" ("userId", created_at desc);

create table if not exists "favorites" (
  id bigserial primary key,
  "userId" text not null references "User" (id) on delete cascade,
  url text not null,
  title text,
  platform text,
  created_at timestamptz not null default now(),
  unique ("userId", url)
);

create table if not exists "activity_log" (
  id bigserial primary key,
  actor text,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);
create index if not exists idx_activity_created on "activity_log" (created_at desc);

create table if not exists "admin_settings" (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

