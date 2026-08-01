-- 2NC Store Operations v1.0 production pilot
-- Run once in Supabase SQL Editor. Row Level Security is mandatory.

create table if not exists public.store_access (
  store_id text not null,
  email text not null,
  role text not null default 'manager' check (role in ('owner', 'manager')),
  can_view_payroll boolean not null default false,
  can_view_communications boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (store_id, email)
);

create table if not exists public.store_states (
  store_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_private_states (
  store_id text not null,
  section text not null check (section in ('payroll', 'communications')),
  payload jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  primary key (store_id, section)
);

create table if not exists public.store_backups (
  id bigint generated always as identity primary key,
  store_id text not null,
  payload jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create or replace function public.current_user_email()
returns text language sql stable security definer set search_path = public as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.has_store_access(requested_store text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.store_access a
    where a.store_id = requested_store
      and lower(a.email) = public.current_user_email()
      and a.active
  );
$$;

create or replace function public.is_store_owner(requested_store text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.store_access a
    where a.store_id = requested_store
      and lower(a.email) = public.current_user_email()
      and a.role = 'owner'
      and a.active
  );
$$;

create or replace function public.can_access_store_section(requested_store text, requested_section text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.store_access a
    where a.store_id = requested_store
      and lower(a.email) = public.current_user_email()
      and a.active
      and (
        a.role = 'owner'
        or (requested_section = 'payroll' and a.can_view_payroll)
        or (requested_section = 'communications' and a.can_view_communications)
      )
  );
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists store_access_touch on public.store_access;
create trigger store_access_touch before update on public.store_access
for each row execute function public.touch_updated_at();

drop trigger if exists store_states_touch on public.store_states;
create trigger store_states_touch before update on public.store_states
for each row execute function public.touch_updated_at();

drop trigger if exists store_private_states_touch on public.store_private_states;
create trigger store_private_states_touch before update on public.store_private_states
for each row execute function public.touch_updated_at();

alter table public.store_access enable row level security;
alter table public.store_states enable row level security;
alter table public.store_private_states enable row level security;
alter table public.store_backups enable row level security;

drop policy if exists "users read permitted access" on public.store_access;
create policy "users read permitted access" on public.store_access for select to authenticated
using (lower(email) = public.current_user_email() or public.is_store_owner(store_id));

drop policy if exists "owners create access" on public.store_access;
create policy "owners create access" on public.store_access for insert to authenticated
with check (public.is_store_owner(store_id) and role = 'manager');

drop policy if exists "owners update access" on public.store_access;
create policy "owners update access" on public.store_access for update to authenticated
using (public.is_store_owner(store_id) and role = 'manager')
with check (public.is_store_owner(store_id) and role = 'manager');

drop policy if exists "owners delete access" on public.store_access;
create policy "owners delete access" on public.store_access for delete to authenticated
using (public.is_store_owner(store_id) and role = 'manager');

drop policy if exists "members read store state" on public.store_states;
create policy "members read store state" on public.store_states for select to authenticated
using (public.has_store_access(store_id));

drop policy if exists "members create store state" on public.store_states;
create policy "members create store state" on public.store_states for insert to authenticated
with check (updated_by = auth.uid() and public.has_store_access(store_id));

drop policy if exists "members update store state" on public.store_states;
create policy "members update store state" on public.store_states for update to authenticated
using (public.has_store_access(store_id))
with check (updated_by = auth.uid() and public.has_store_access(store_id));

drop policy if exists "permitted users read private state" on public.store_private_states;
create policy "permitted users read private state" on public.store_private_states for select to authenticated
using (public.can_access_store_section(store_id, section));

drop policy if exists "permitted users create private state" on public.store_private_states;
create policy "permitted users create private state" on public.store_private_states for insert to authenticated
with check (updated_by = auth.uid() and public.can_access_store_section(store_id, section));

drop policy if exists "permitted users update private state" on public.store_private_states;
create policy "permitted users update private state" on public.store_private_states for update to authenticated
using (public.can_access_store_section(store_id, section))
with check (updated_by = auth.uid() and public.can_access_store_section(store_id, section));

drop policy if exists "owners read backups" on public.store_backups;
drop policy if exists "members read backups" on public.store_backups;
create policy "owners read backups" on public.store_backups for select to authenticated
using (public.is_store_owner(store_id));

drop policy if exists "owners create backups" on public.store_backups;
drop policy if exists "members create backups" on public.store_backups;
create policy "owners create backups" on public.store_backups for insert to authenticated
with check (created_by = auth.uid() and public.is_store_owner(store_id));

-- Final one-time step: replace the email below with Jon's email and run it.
-- After that, managers are added and managed inside the dashboard—no more SQL.
insert into public.store_access
  (store_id, email, role, can_view_payroll, can_view_communications, active)
values
  ('2102', lower('YOUR_EMAIL_HERE'), 'owner', true, true, true)
on conflict (store_id, email) do update set
  role = 'owner', can_view_payroll = true, can_view_communications = true, active = true;
