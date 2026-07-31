-- 2NC Store Operations v1.0 production pilot
-- Run once in Supabase SQL Editor. Row Level Security is mandatory.

create table if not exists public.store_members (
  store_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'manager')),
  created_at timestamptz not null default now(),
  primary key (store_id, user_id)
);

create table if not exists public.store_states (
  store_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_backups (
  id bigint generated always as identity primary key,
  store_id text not null,
  payload jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create or replace function public.touch_store_state()
returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists store_states_touch on public.store_states;
create trigger store_states_touch before update on public.store_states
for each row execute function public.touch_store_state();

alter table public.store_members enable row level security;
alter table public.store_states enable row level security;
alter table public.store_backups enable row level security;

drop policy if exists "members read own membership" on public.store_members;
create policy "members read own membership" on public.store_members for select to authenticated
using (user_id = auth.uid());

drop policy if exists "members read store state" on public.store_states;
create policy "members read store state" on public.store_states for select to authenticated
using (exists (select 1 from public.store_members m where m.store_id = store_states.store_id and m.user_id = auth.uid()));

drop policy if exists "members create store state" on public.store_states;
create policy "members create store state" on public.store_states for insert to authenticated
with check (updated_by = auth.uid() and exists (select 1 from public.store_members m where m.store_id = store_states.store_id and m.user_id = auth.uid()));

drop policy if exists "members update store state" on public.store_states;
create policy "members update store state" on public.store_states for update to authenticated
using (exists (select 1 from public.store_members m where m.store_id = store_states.store_id and m.user_id = auth.uid()))
with check (updated_by = auth.uid());

drop policy if exists "members read backups" on public.store_backups;
create policy "members read backups" on public.store_backups for select to authenticated
using (exists (select 1 from public.store_members m where m.store_id = store_backups.store_id and m.user_id = auth.uid()));

drop policy if exists "members create backups" on public.store_backups;
create policy "members create backups" on public.store_backups for insert to authenticated
with check (created_by = auth.uid() and exists (select 1 from public.store_members m where m.store_id = store_backups.store_id and m.user_id = auth.uid()));

-- After inviting the first user, replace the email below and run this statement:
-- insert into public.store_members (store_id, user_id, role)
-- select '2102', id, 'owner' from auth.users where lower(email) = lower('YOUR_EMAIL_HERE');
