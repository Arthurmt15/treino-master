-- Schema Supabase do app de treino (Postgres + RLS).
-- Ordem: tabelas -> indices -> RLS -> policies.
-- A API de exercicios (GIF) fica fora: guardamos so exercise_id.

-- Perfil ligado ao auth.users (1:1, criado por trigger/app).
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text, -- nome exibido (editavel no perfil)
  email text, -- copia p/ facilitar busca/suporte
  weight_kg numeric, -- peso atual (espelha weight_logs)
  height_cm int, -- altura p/ IMC futuro
  goal text default 'Hipertrofia', -- objetivo selecionado
  weekly_target int default 5, -- meta semanal de treinos
  updated_at timestamptz default now()
);

-- Fichas nomeadas (A/B/C) ou rascunho ativo do usuario.
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null, -- ex: 'A - Peito'
  day text, -- 'SEG' ou null (ficha livre)
  created_at timestamptz default now()
);

-- Itens configuraveis: referencia a ExerciseDB + carga.
create table if not exists workout_items (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id) on delete cascade,
  exercise_id text not null, -- id da ExerciseDB (ex: 'EIeI8Vf')
  name text not null, -- nome EN (v1) p/ exibir offline
  gif_url text, -- demo animada (URL publica, sem download)
  sets int not null default 3, -- series
  reps text not null default '10-12', -- '10' | '10-12' | '30s'
  weight_kg numeric not null default 0, -- 0 = peso corporal
  rest_sec int not null default 60, -- descanso entre series
  position int not null default 0, -- ordem na ficha
  notes text -- observacao opcional (ex: 'pegada aberta')
);

-- Historico de execucoes (alimenta /historico e stats).
create table if not exists workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  workout_id uuid references workouts(id) on delete set null,
  title text, -- nome exibido do treino concluido
  exercises int, -- quantidade de exercicios na sessao
  finished_at timestamptz default now(),
  duration_min int, -- duracao real da sessao
  notes text
);

-- Migracao idempotente (bancos ja criados antes destas colunas).
alter table workout_logs add column if not exists title text;
alter table workout_logs add column if not exists exercises int;

-- Evolucao de peso (alimenta grafico em /evolucao).
create table if not exists weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  weighed_on date not null default current_date,
  weight_kg numeric not null,
  unique (user_id, weighed_on) -- 1 registro por dia por usuario (upsert)
);

-- Migracao idempotente: garante a chave unica (user_id, weighed_on).
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'weight_logs_user_day_key'
  ) then
    alter table weight_logs add constraint weight_logs_user_day_key unique (user_id, weighed_on);
  end if;
end $$;

-- RLS: ativa em todas (sem policy = ninguem acessa).
alter table profiles enable row level security;
alter table workouts enable row level security;
alter table workout_items enable row level security;
alter table workout_logs enable row level security;
alter table weight_logs enable row level security;

-- Dono le/escreve o proprio perfil.
create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Dono gerencia as proprias fichas.
create policy "own workouts" on workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Item segue o dono da ficha (via join em workouts).
create policy "own items" on workout_items for all using (
  exists (select 1 from workouts w where w.id = workout_items.workout_id and w.user_id = auth.uid())
) with check (
  exists (select 1 from workouts w where w.id = workout_items.workout_id and w.user_id = auth.uid())
);

-- Historico e peso: somente o dono.
create policy "own logs" on workout_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own weight" on weight_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Cria o perfil automaticamente ao cadastrar um usuario (evita FK quebrada).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: garante perfil para quem ja entrou antes do trigger.
insert into profiles (id, email, name)
select id, email, coalesce(raw_user_meta_data->>'full_name', email) from auth.users
on conflict (id) do nothing;
