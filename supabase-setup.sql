-- Pega TODO esto en Supabase → SQL Editor → Run
-- (si dice "already exists", no pasa nada)

create table if not exists "user" (
  "id" text not null primary key,
  "name" text not null,
  "email" text not null unique,
  "emailVerified" boolean not null,
  "image" text,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz default CURRENT_TIMESTAMP not null
);

create table if not exists "session" (
  "id" text not null primary key,
  "expiresAt" timestamptz not null,
  "token" text not null unique,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz not null,
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references "user" ("id") on delete cascade
);

create table if not exists "account" (
  "id" text not null primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references "user" ("id") on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  "scope" text,
  "password" text,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz not null
);

create table if not exists "verification" (
  "id" text not null primary key,
  "identifier" text not null,
  "value" text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz default CURRENT_TIMESTAMP not null
);

create index if not exists "session_userId_idx" on "session" ("userId");
create index if not exists "account_userId_idx" on "account" ("userId");
create index if not exists "verification_identifier_idx" on "verification" ("identifier");

create table if not exists members (
  user_id text primary key,
  name text not null,
  email text not null unique,
  role text not null default 'member',
  sex text not null default 'hombre',
  age integer not null default 25,
  height integer not null default 170,
  weight numeric not null default 75,
  goal text not null default 'recomp',
  level text not null default 'intermedio',
  device_id text,
  plan_cycle integer not null default 0,
  last_plan_at timestamptz,
  nutrition jsonb,
  routine jsonb,
  created_at timestamptz not null default now()
);

create index if not exists members_role_idx on members (role);

create table if not exists weight_logs (
  id serial primary key,
  user_id text not null,
  kg numeric not null,
  logged_at timestamptz not null default now()
);

create index if not exists weight_logs_user_id_idx on weight_logs (user_id);

alter table members add column if not exists app_months integer not null default 3;
alter table members add column if not exists app_expires_at timestamptz;
alter table members add column if not exists avatar text;
alter table members add column if not exists pass_hash text;
alter table members add column if not exists pass_v integer default 0;
alter table members add column if not exists prefs jsonb;
alter table members add column if not exists strength jsonb;
alter table members add column if not exists sucursal text;
alter table members add column if not exists tape jsonb;
