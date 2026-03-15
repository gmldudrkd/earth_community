-- =============================================
-- Migration: Initial recipes table & functions
-- Created: 2026-03-15
-- Description: recipes 테이블, RLS 정책, RPC 함수, 인덱스 생성
-- =============================================

-- 1. recipes 테이블
create table if not exists recipes (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  image_url text,
  category text not null default 'lunch'
    check (category in ('breakfast', 'lunch', 'dinner', 'snack')),
  prep_time text,
  prep_time_minutes integer,
  servings text,
  vegan boolean default true,
  difficulty smallint default 1 check (difficulty between 1 and 5),
  ingredients jsonb not null default '[]',
  steps jsonb not null default '[]',
  password text not null,
  view_count integer default 0,
  like_count integer default 0,
  created_at timestamptz default now()
);

-- 2. 인덱스
create index if not exists idx_recipes_ingredients
  on recipes using gin (ingredients);

create index if not exists idx_recipes_title
  on recipes using gin (to_tsvector('simple', title));

-- 3. RLS
alter table recipes enable row level security;

create policy "Anyone can read recipes"
  on recipes for select
  using (true);

create policy "Anyone can insert recipes"
  on recipes for insert
  with check (true);

create policy "Anyone can update counts"
  on recipes for update
  using (true);

-- 4. RPC: 레시피 검색 (제목 + 설명 + 재료)
create or replace function search_recipes(search_term text)
returns setof recipes
language plpgsql
security definer
as $$
begin
  return query
  select *
  from recipes
  where
    title ilike '%' || search_term || '%'
    or description ilike '%' || search_term || '%'
    or exists (
      select 1
      from jsonb_array_elements(ingredients) as ing
      where ing->>'name' ilike '%' || search_term || '%'
    )
  order by view_count desc;
end;
$$;

-- 5. RPC: 조회수 증가
create or replace function increment_view_count(recipe_id bigint)
returns void
language plpgsql
security definer
as $$
begin
  update recipes
  set view_count = view_count + 1
  where id = recipe_id;
end;
$$;

-- 6. RPC: 좋아요 토글
create or replace function toggle_like(recipe_id bigint, should_like boolean)
returns integer
language plpgsql
security definer
as $$
declare
  new_count integer;
begin
  if should_like then
    update recipes set like_count = like_count + 1 where id = recipe_id;
  else
    update recipes set like_count = greatest(like_count - 1, 0) where id = recipe_id;
  end if;
  select like_count into new_count from recipes where id = recipe_id;
  return new_count;
end;
$$;

-- 7. RPC: 비밀번호 검증 후 삭제
create or replace function delete_recipe_with_password(recipe_id bigint, input_password text)
returns boolean
language plpgsql
security definer
as $$
begin
  delete from recipes
  where id = recipe_id and password = input_password;
  return found;
end;
$$;
