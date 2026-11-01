-- Çiftlik İmparatorluğu · Supabase şeması
-- Supabase panelinde SQL Editor'e yapıştırıp çalıştır. Ardından Project URL ve anon key'i src/js/000-config.js'e yaz.
-- Tablolara doğrudan erişim kapalıdır (RLS); istemci yalnızca aşağıdaki RPC fonksiyonlarını çağırabilir.

create extension if not exists pgcrypto;

create table if not exists public.saves (
  id uuid primary key,
  secret_hash text not null,
  data jsonb not null,
  level int,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table if not exists public.events (
  id bigserial primary key,
  player uuid not null,
  name text not null,
  props jsonb,
  level int,
  platform text,
  client_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists events_name_time on public.events (name, created_at);
create table if not exists public.errors (
  id bigserial primary key,
  player uuid,
  error jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.saves enable row level security;
alter table public.events enable row level security;
alter table public.errors enable row level security;

-- Kaydet: ilk kayıtta gizli anahtarın özeti saklanır, sonraki kayıtlarda doğrulanır.
create or replace function public.save_game(p_id uuid, p_secret text, p_data jsonb, p_level int)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare h text := encode(digest(p_secret, 'sha256'), 'hex'); cur text;
begin
  if length(p_secret) < 32 or pg_column_size(p_data) > 2000000 then raise exception 'invalid'; end if;
  select secret_hash into cur from saves where id = p_id;
  if cur is null then
    insert into saves(id, secret_hash, data, level) values (p_id, h, p_data, p_level);
  elsif cur = h then
    update saves set data = p_data, level = p_level, updated_at = now() where id = p_id;
  else raise exception 'forbidden'; end if;
  return now();
end $$;

create or replace function public.load_game(p_id uuid, p_secret text)
returns table(data jsonb, updated_at timestamptz) language sql security definer set search_path = public as $$
  select s.data, s.updated_at from saves s where s.id = p_id and s.secret_hash = encode(digest(p_secret, 'sha256'), 'hex');
$$;

create or replace function public.server_now() returns timestamptz language sql stable as $$ select now() $$;

create or replace function public.log_events(p_id uuid, p_events jsonb)
returns void language sql security definer set search_path = public as $$
  insert into events(player, name, props, level, platform, client_at)
  select p_id, left(e->>'n', 64), e->'p', (e->>'lv')::int, left(e->>'pl', 16), to_timestamp((e->>'t')::bigint / 1000.0)
  from jsonb_array_elements(p_events) e
  limit 100;
$$;

create or replace function public.log_error(p_id uuid, p_error jsonb)
returns void language sql security definer set search_path = public as $$
  insert into errors(player, error) values (p_id, p_error);
$$;

revoke all on function public.save_game, public.load_game, public.log_events, public.log_error from public;
grant execute on function public.save_game, public.load_game, public.server_now, public.log_events, public.log_error to anon;

-- Örnek analitik sorguları
-- Günlük aktif oyuncu:   select date(created_at), count(distinct player) from events where name='session_start' group by 1 order by 1;
-- İlk hedef hunisi:      select (props->>'i')::int hedef, count(distinct player) from events where name='goal' group by 1 order by 1;
-- En sık hatalar:        select error->>'m', count(*) from errors group by 1 order by 2 desc limit 20;
