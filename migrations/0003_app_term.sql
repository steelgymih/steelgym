alter table members add column if not exists app_months integer not null default 3;
alter table members add column if not exists app_expires_at timestamptz;
