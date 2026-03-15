-- =============================================
-- Migration: Allow 'all' category in recipes
-- Created: 2026-03-15
-- Description: '전체' 카테고리로 등록된 레시피가 모든 카테고리 필터에 노출되도록 허용
-- =============================================

alter table recipes drop constraint if exists recipes_category_check;
alter table recipes add constraint recipes_category_check
  check (category in ('all', 'breakfast', 'lunch', 'dinner', 'snack'));
