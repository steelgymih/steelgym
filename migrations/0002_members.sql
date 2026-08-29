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
