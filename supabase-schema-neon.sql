-- Schéma Auth.js pour Neon (lancer dans le SQL Editor de Neon)
-- Crée les tables gérées par l'adaptateur @auth/neon-adapter.

create table if not exists "User" (
  id text primary key,
  name text,
  email text not null,
  emailVerified timestamp with time zone,
  image text
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
alter table "User" add column if not exists role text not null default 'user';
create index if not exists "User_email_key" on "User" (email);