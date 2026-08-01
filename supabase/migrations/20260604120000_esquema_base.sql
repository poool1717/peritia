-- Esquema base de PERIT.IA (tablas, RLS, triggers e índices).
--
-- Este esquema se creó a mano desde el panel de Supabase el 4 de junio de 2026
-- y hasta ahora no existía en el repositorio: la única migración versionada era
-- la del bucket de Storage. Se recupera aquí tal y como está en el proyecto de
-- producción (yrulaaxdusvmzohugmnc) para poder levantar un proyecto idéntico
-- desde cero — que es lo que necesita el entorno de test.
--
-- Es idempotente a propósito (if not exists / drop ... if exists): aplicarlo
-- sobre el proyecto de producción no cambia nada, solo lo deja registrado.

-- ─── Tablas ─────────────────────────────────────────────────────────────────

create table if not exists public.perfiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  nombre     text,
  dni        text,
  telefono   text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.informes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  num_referencia text,
  compania       text,
  asegurado      text,
  estado         text default 'borrador',   -- borrador | completado | exportado
  encargo        jsonb default '{}'::jsonb,
  s1             jsonb default '{}'::jsonb,
  s2             jsonb default '{}'::jsonb,
  s3             jsonb default '{}'::jsonb,
  s4             jsonb default '{}'::jsonb,
  anexos         jsonb default '{}'::jsonb,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ─── Índices ────────────────────────────────────────────────────────────────

create index if not exists idx_informes_user_id      on public.informes (user_id);
create index if not exists idx_informes_updated_at   on public.informes (updated_at desc);
create index if not exists idx_informes_user_updated on public.informes (user_id, updated_at desc);

-- ─── RLS: cada perito solo ve y toca lo suyo ────────────────────────────────

alter table public.perfiles  enable row level security;
alter table public.informes  enable row level security;

drop policy if exists "perfiles_own" on public.perfiles;
create policy "perfiles_own"
on public.perfiles for all
to authenticated
using (id = auth.uid());

drop policy if exists "informes_own" on public.informes;
create policy "informes_own"
on public.informes for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ─── Triggers ───────────────────────────────────────────────────────────────

-- updated_at se refresca solo en cada UPDATE.
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists perfiles_updated_at on public.perfiles;
create trigger perfiles_updated_at
before update on public.perfiles
for each row execute function public.handle_updated_at();

drop trigger if exists informes_updated_at on public.informes;
create trigger informes_updated_at
before update on public.informes
for each row execute function public.handle_updated_at();

-- Al registrarse un usuario se le crea su fila en perfiles automáticamente.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.perfiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
