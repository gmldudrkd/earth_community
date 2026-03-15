-- =============================================
-- One Light Meal - Supabase Database Schema
-- =============================================

-- 1. recipes 테이블
create table if not exists recipes (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  image_url text,
  category text not null default 'all'
    check (category in ('all', 'breakfast', 'lunch', 'dinner', 'snack')),
  prep_time text,                              -- 표시용 (예: "15분", "15 min")
  prep_time_minutes integer,                   -- 필터링용 숫자 (분 단위)
  servings text,
  vegan boolean default true,
  difficulty smallint default 1 check (difficulty between 1 and 5),
  ingredients jsonb not null default '[]',      -- [{name, amount}]
  steps jsonb not null default '[]',            -- [string or {text, image_url}]
  password text not null,                       -- 6자리 숫자 비밀번호
  view_count integer default 0,
  like_count integer default 0,
  created_at timestamptz default now()
);

-- 2. 재료 검색을 위한 GIN 인덱스
create index if not exists idx_recipes_ingredients
  on recipes using gin (ingredients);

-- 전문 검색을 위한 인덱스
create index if not exists idx_recipes_title
  on recipes using gin (to_tsvector('simple', title));

-- 3. RLS (Row Level Security) 설정
alter table recipes enable row level security;

-- 누구나 읽기 가능
create policy "Anyone can read recipes"
  on recipes for select
  using (true);

-- 누구나 새 레시피 등록 가능
create policy "Anyone can insert recipes"
  on recipes for insert
  with check (true);

-- 업데이트는 view_count, like_count만 허용 (비밀번호 검증은 RPC로)
create policy "Anyone can update counts"
  on recipes for update
  using (true);

-- 4. 레시피 검색 RPC (제목 + 재료 이름 검색)
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

-- 5. 조회수 증가 RPC
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

-- 6. 좋아요 토글 RPC
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

-- =============================================
-- ingredients_master 테이블
-- =============================================
create table if not exists ingredients_master (
  id bigint generated always as identity primary key,
  name text not null,
  alias text,
  category text not null
    check (category in ('SAFE_PLANT', 'EGG', 'DAIRY', 'ANIMAL', 'REVIEW')),
  created_at timestamptz default now()
);

create unique index if not exists idx_ingredients_master_name
  on ingredients_master (name);

create index if not exists idx_ingredients_master_category
  on ingredients_master (category);

alter table ingredients_master enable row level security;

create policy "Anyone can read ingredients_master"
  on ingredients_master for select
  using (true);

create policy "Anyone can insert ingredients_master"
  on ingredients_master for insert
  with check (true);

-- =============================================
-- recipe_ingredients 중간 테이블
-- =============================================
create table if not exists recipe_ingredients (
  id bigint generated always as identity primary key,
  recipe_id bigint not null references recipes(id) on delete cascade,
  ingredient_id bigint references ingredients_master(id) on delete set null,
  ingredient_name text not null,
  amount text,
  category text not null default 'SAFE_PLANT'
    check (category in ('SAFE_PLANT', 'EGG', 'DAIRY', 'ANIMAL', 'REVIEW')),
  created_at timestamptz default now()
);

create index if not exists idx_recipe_ingredients_recipe_id
  on recipe_ingredients (recipe_id);

create index if not exists idx_recipe_ingredients_ingredient_id
  on recipe_ingredients (ingredient_id);

create index if not exists idx_recipe_ingredients_category
  on recipe_ingredients (category);

create index if not exists idx_recipe_ingredients_name
  on recipe_ingredients using gin (to_tsvector('simple', ingredient_name));

alter table recipe_ingredients enable row level security;

create policy "Anyone can read recipe_ingredients"
  on recipe_ingredients for select
  using (true);

create policy "Anyone can insert recipe_ingredients"
  on recipe_ingredients for insert
  with check (true);

create policy "Anyone can delete recipe_ingredients"
  on recipe_ingredients for delete
  using (true);

-- 7. 비밀번호 검증 후 삭제 RPC
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
