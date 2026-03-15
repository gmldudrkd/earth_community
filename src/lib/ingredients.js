import { supabase } from './supabase'

const noDb = !supabase

// 재료 마스터 데이터 조회 (ANIMAL 제외)
export async function fetchIngredientsMaster() {
  if (noDb) return []

  const { data, error } = await supabase
    .from('ingredients_master')
    .select('id, name, alias, category')
    .neq('category', 'ANIMAL')
    .order('name')

  if (error) throw error
  return data
}

// 직접 입력한 재료를 마스터 테이블에 저장
export async function addCustomIngredient(name, category) {
  if (noDb) return null

  const { data, error } = await supabase
    .from('ingredients_master')
    .upsert({ name, category }, { onConflict: 'name' })
    .select()
    .single()

  if (error) throw error
  return data
}

// 선택된 재료들의 카테고리 기반으로 vegan 여부 판별
export function determineVeganStatus(selectedIngredients, masterMap) {
  if (!selectedIngredients || selectedIngredients.length === 0) return true

  for (const ing of selectedIngredients) {
    const name = typeof ing === 'string' ? ing : ing.name
    const master = masterMap[name]
    const category = master?.category || ing.category

    if (category === 'EGG' || category === 'DAIRY' || category === 'ANIMAL' || category === 'REVIEW') {
      return false
    }
  }
  return true
}

// 선택된 재료들에 포함된 비식물성 카테고리 목록 반환
export function getNonPlantCategories(selectedIngredients, masterMap) {
  const categories = new Set()

  for (const ing of selectedIngredients) {
    const name = typeof ing === 'string' ? ing : ing.name
    const master = masterMap[name]
    const category = master?.category || ing.category

    if (category && category !== 'SAFE_PLANT') {
      categories.add(category)
    }
  }
  return [...categories]
}
