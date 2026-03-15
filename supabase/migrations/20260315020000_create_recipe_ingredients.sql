-- =============================================
-- Migration: recipe_ingredients 중간 테이블
-- Created: 2026-03-15
-- Description: recipes ↔ ingredients_master 관계 테이블
--   레시피별 재료 연관 저장 → 재료 기반 검색/필터 지원
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

-- 인덱스
create index if not exists idx_recipe_ingredients_recipe_id
  on recipe_ingredients (recipe_id);

create index if not exists idx_recipe_ingredients_ingredient_id
  on recipe_ingredients (ingredient_id);

create index if not exists idx_recipe_ingredients_category
  on recipe_ingredients (category);

create index if not exists idx_recipe_ingredients_name
  on recipe_ingredients using gin (to_tsvector('simple', ingredient_name));

-- RLS
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

-- =============================================
-- 검색 RPC 업데이트: 재료 기반 검색 강화
-- =============================================
create or replace function search_recipes(search_term text)
returns setof recipes
language plpgsql
security definer
as $$
begin
  return query
  select distinct r.*
  from recipes r
  left join recipe_ingredients ri on r.id = ri.recipe_id
  where
    r.title ilike '%' || search_term || '%'
    or r.description ilike '%' || search_term || '%'
    or ri.ingredient_name ilike '%' || search_term || '%'
  order by r.view_count desc;
end;
$$;

-- =============================================
-- 재료 카테고리 기반 필터 RPC
-- 예: 특정 카테고리 재료가 포함된/제외된 레시피 조회
-- =============================================
create or replace function filter_recipes_by_ingredient_category(
  include_categories text[] default null,
  exclude_categories text[] default null
)
returns setof recipes
language plpgsql
security definer
as $$
begin
  return query
  select distinct r.*
  from recipes r
  where
    -- include: 해당 카테고리 재료가 하나라도 포함된 레시피
    (include_categories is null or exists (
      select 1 from recipe_ingredients ri
      where ri.recipe_id = r.id and ri.category = any(include_categories)
    ))
    -- exclude: 해당 카테고리 재료가 없는 레시피
    and (exclude_categories is null or not exists (
      select 1 from recipe_ingredients ri
      where ri.recipe_id = r.id and ri.category = any(exclude_categories)
    ))
  order by r.created_at desc;
end;
$$;
