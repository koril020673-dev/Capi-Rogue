create table if not exists public.player_accounts (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  display_name text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.player_accounts enable row level security;

drop policy if exists "Allow public game account read" on public.player_accounts;
drop policy if exists "Allow public game account insert" on public.player_accounts;

create policy "Allow public game account read"
on public.player_accounts
for select
to anon
using (true);

create policy "Allow public game account insert"
on public.player_accounts
for insert
to anon
with check (true);

