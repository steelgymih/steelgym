alter table members add column if not exists pass_hash text;
alter table members add column if not exists pass_v integer default 0;
alter table members add column if not exists prefs jsonb;
alter table members add column if not exists strength jsonb;
alter table members add column if not exists sucursal text;
alter table members add column if not exists tape jsonb;
