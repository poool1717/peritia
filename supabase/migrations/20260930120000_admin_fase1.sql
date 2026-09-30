-- ════════════════════════════════════════════════════════════════════════════
-- Panel de administración — Fase 1
--
-- · admins     → quién puede entrar al panel (solo se edita desde Supabase).
-- · cuentas    → datos de negocio de cada perito que gestiona el admin
--                (plan, cuota mensual, bloqueo, notas). El perito no la ve.
-- · uso_ia     → una fila por llamada a la IA con su coste, para el panel.
-- · cobros     → cobros registrados a mano (transferencia, Bizum…) hasta
--                que llegue Stripe en la Fase 2.
--
-- Privacidad: el admin NO obtiene acceso de lectura a public.informes. Solo
-- ve metadatos (referencia, compañía, garantía, estado, fechas) a través de
-- funciones admin_* que devuelven únicamente esas columnas.
--
-- Idempotente: se puede ejecutar más de una vez sin error.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Administradores ─────────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- Sin políticas: nadie puede leer ni escribir esta tabla desde la app.

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ── Cuentas (datos de negocio por perito, solo admin) ───────────────────────
create table if not exists public.cuentas (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  plan         text not null default 'Sin plan',
  cuota_mensual numeric(10,2) not null default 0 check (cuota_mensual >= 0),
  bloqueado    boolean not null default false,
  notas        text not null default '',
  updated_at   timestamptz not null default now()
);
alter table public.cuentas enable row level security;
drop policy if exists "cuentas_admin_all" on public.cuentas;
create policy "cuentas_admin_all" on public.cuentas
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Lo único que un perito puede saber de su propia cuenta: si es admin y si
-- está bloqueado. La app y el proxy de IA lo consultan con esta función.
create or replace function public.mi_cuenta()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'es_admin',  exists (select 1 from public.admins where user_id = auth.uid()),
    'bloqueado', coalesce((select bloqueado from public.cuentas where user_id = auth.uid()), false)
  );
$$;
revoke all on function public.mi_cuenta() from public, anon;
grant execute on function public.mi_cuenta() to authenticated;

-- ── Uso de IA ───────────────────────────────────────────────────────────────
create table if not exists public.uso_ia (
  id            bigserial primary key,
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  seccion       text not null default 'otros',
  modelo        text,
  input_tokens  integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  coste_usd     numeric(12,6) not null default 0 check (coste_usd >= 0)
);
create index if not exists uso_ia_created_at_idx on public.uso_ia (created_at);
create index if not exists uso_ia_user_idx on public.uso_ia (user_id, created_at);
alter table public.uso_ia enable row level security;
-- El proxy inserta con el token del perito: solo filas a su propio nombre.
drop policy if exists "uso_ia_insert_own" on public.uso_ia;
create policy "uso_ia_insert_own" on public.uso_ia
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "uso_ia_admin_select" on public.uso_ia;
create policy "uso_ia_admin_select" on public.uso_ia
  for select to authenticated using (public.is_admin());

-- ── Cobros manuales ─────────────────────────────────────────────────────────
create table if not exists public.cobros (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete set null,
  fecha      date not null default current_date,
  concepto   text not null,
  importe    numeric(10,2) not null check (importe >= 0),
  metodo     text not null default 'Transferencia',
  estado     text not null default 'pagado' check (estado in ('pagado','pendiente')),
  created_at timestamptz not null default now()
);
create index if not exists cobros_fecha_idx on public.cobros (fecha);
alter table public.cobros enable row level security;
drop policy if exists "cobros_admin_all" on public.cobros;
create policy "cobros_admin_all" on public.cobros
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── Lecturas del panel (solo admin, solo metadatos) ─────────────────────────

-- Un perito por fila con su actividad, lo pagado y lo que cuesta en IA.
create or replace function public.admin_peritos()
returns table (
  user_id uuid, email text, nombre text, alta timestamptz, ultimo_acceso timestamptz,
  plan text, cuota_mensual numeric, bloqueado boolean, notas text,
  informes_total bigint, informes_mes bigint, ultimo_informe timestamptz,
  pagado_total numeric, coste_ia_mes_usd numeric, coste_ia_total_usd numeric
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Solo administradores' using errcode = '42501'; end if;
  return query
  select u.id, u.email::text, coalesce(p.nombre, '')::text, u.created_at, u.last_sign_in_at,
         coalesce(c.plan, 'Sin plan'), coalesce(c.cuota_mensual, 0), coalesce(c.bloqueado, false), coalesce(c.notas, ''),
         (select count(*) from public.informes i where i.user_id = u.id),
         (select count(*) from public.informes i where i.user_id = u.id and i.created_at >= date_trunc('month', now())),
         (select max(i.updated_at) from public.informes i where i.user_id = u.id),
         coalesce((select sum(importe) from public.cobros b where b.user_id = u.id and b.estado = 'pagado'), 0),
         coalesce((select sum(coste_usd) from public.uso_ia a where a.user_id = u.id and a.created_at >= date_trunc('month', now())), 0),
         coalesce((select sum(coste_usd) from public.uso_ia a where a.user_id = u.id), 0)
  from auth.users u
  left join public.perfiles p on p.id = u.id
  left join public.cuentas  c on c.user_id = u.id
  order by u.created_at desc;
end $$;

-- Últimos informes de todos los peritos, sin su contenido.
create or replace function public.admin_informes(p_limite integer default 200)
returns table (
  id uuid, num_referencia text, compania text, garantia text, estado text,
  created_at timestamptz, updated_at timestamptz, user_id uuid, perito text
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Solo administradores' using errcode = '42501'; end if;
  return query
  select i.id, coalesce(i.num_referencia, ''), coalesce(i.compania, ''),
         coalesce(i.encargo->>'garantia', '')::text, coalesce(i.estado, 'borrador'),
         i.created_at, i.updated_at, i.user_id,
         coalesce(nullif(p.nombre, ''), u.email)::text
  from public.informes i
  left join auth.users u on u.id = i.user_id
  left join public.perfiles p on p.id = i.user_id
  order by i.created_at desc
  limit greatest(1, least(p_limite, 1000));
end $$;

-- Resumen mes a mes: ingresos, coste de IA, informes y altas.
create or replace function public.admin_mensual(p_meses integer default 6)
returns table (mes date, ingresos numeric, coste_ia_usd numeric, informes bigint, altas bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Solo administradores' using errcode = '42501'; end if;
  return query
  with m as (
    select generate_series(
      date_trunc('month', now()) - make_interval(months => greatest(1, least(p_meses, 24)) - 1),
      date_trunc('month', now()), interval '1 month')::date as mes
  )
  select m.mes,
    coalesce((select sum(importe) from public.cobros b where b.estado = 'pagado' and date_trunc('month', b.fecha)::date = m.mes), 0),
    coalesce((select sum(coste_usd) from public.uso_ia a where date_trunc('month', a.created_at)::date = m.mes), 0),
    (select count(*) from public.informes i where date_trunc('month', i.created_at)::date = m.mes),
    (select count(*) from auth.users u where date_trunc('month', u.created_at)::date = m.mes)
  from m order by m.mes;
end $$;

-- Coste de IA por sección de la app en un periodo.
create or replace function public.admin_uso_secciones(p_desde timestamptz default date_trunc('month', now()))
returns table (seccion text, llamadas bigint, coste_usd numeric)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Solo administradores' using errcode = '42501'; end if;
  return query
  select a.seccion, count(*), sum(a.coste_usd)
  from public.uso_ia a where a.created_at >= p_desde
  group by a.seccion order by 3 desc;
end $$;

revoke all on function public.admin_peritos() from public, anon;
revoke all on function public.admin_informes(integer) from public, anon;
revoke all on function public.admin_mensual(integer) from public, anon;
revoke all on function public.admin_uso_secciones(timestamptz) from public, anon;
grant execute on function public.admin_peritos() to authenticated;
grant execute on function public.admin_informes(integer) to authenticated;
grant execute on function public.admin_mensual(integer) to authenticated;
grant execute on function public.admin_uso_secciones(timestamptz) to authenticated;

-- ── Primer administrador: la cuenta de Pol ──────────────────────────────────
insert into public.admins (user_id)
select id from auth.users where lower(email) = 'poool.1717@gmail.com'
on conflict (user_id) do nothing;
