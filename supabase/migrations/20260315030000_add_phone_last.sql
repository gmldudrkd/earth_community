-- =============================================
-- Migration: Add phone_last column to recipes
-- Created: 2026-03-15
-- Description: 레시피 작성자 휴대폰 끝번호 저장 (수정/삭제 시 비밀번호와 함께 본인 확인용)
-- =============================================

-- 1. phone_last 컬럼 추가 (4자리 숫자)
alter table recipes add column if not exists phone_last text not null default '';

-- 2. delete_recipe_with_password 함수 업데이트 (phone_last 검증 추가)
create or replace function delete_recipe_with_password(recipe_id bigint, input_password text, input_phone_last text default '')
returns boolean
language plpgsql
security definer
as $$
begin
  delete from recipes
  where id = recipe_id
    and password = input_password
    and phone_last = input_phone_last;
  return found;
end;
$$;
