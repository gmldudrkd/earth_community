import { supabase } from './supabase'

// Supabase 미설정 시 빈 결과 반환
const noDb = !supabase

// 레시피 목록 조회 (필터/정렬 지원)
export async function fetchRecipes({
  orderBy = 'created_at',
  ascending = false,
  category = null,
  vegan = null,
  maxPrepTime = null,
  maxDifficulty = null,
  maxIngredients = null,
} = {}) {
  if (noDb) return []

  let query = supabase
    .from('recipes')
    .select('id, title, description, image_url, prep_time, prep_time_minutes, category, vegan, difficulty, ingredients, view_count, like_count, created_at, servings')

  if (category) {
    query = query.in('category', [category, 'all'])
  }
  if (vegan === true) {
    query = query.eq('vegan', true)
  }
  if (vegan === false) {
    query = query.eq('vegan', false)
  }
  if (maxPrepTime) {
    query = query.lte('prep_time_minutes', maxPrepTime)
  }
  if (maxDifficulty) {
    query = query.lte('difficulty', maxDifficulty)
  }

  query = query.order(orderBy, { ascending })

  const { data, error } = await query
  if (error) throw error

  // maxIngredients 필터는 클라이언트에서 처리 (JSONB 배열 길이)
  if (maxIngredients && data) {
    return data.filter((r) => {
      const count = Array.isArray(r.ingredients) ? r.ingredients.length : 0
      return count <= maxIngredients
    })
  }

  return data
}

// 레시피 검색 (제목 + 재료 이름)
export async function searchRecipes(searchTerm) {
  if (noDb || !searchTerm?.trim()) return []

  const { data, error } = await supabase.rpc('search_recipes', {
    search_term: searchTerm.trim(),
  })

  if (error) throw error
  return data
}

// 레시피 상세 조회
export async function fetchRecipe(id) {
  if (noDb) return null

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// 레시피 등록 (recipe_ingredients 중간 테이블에도 저장)
export async function createRecipe(recipe) {
  if (noDb) throw new Error('Supabase not configured')

  // 1. 레시피 저장
  const { data, error } = await supabase
    .from('recipes')
    .insert(recipe)
    .select()
    .single()

  if (error) throw error

  // 2. recipe_ingredients 중간 테이블에 재료 연관 저장
  const ingredientList = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
  if (ingredientList.length > 0) {
    // ingredients_master에서 이름으로 id 조회
    const names = ingredientList.map((i) => i.name)
    const { data: masterRows } = await supabase
      .from('ingredients_master')
      .select('id, name, category')
      .in('name', names)

    const masterMap = {}
    masterRows?.forEach((m) => { masterMap[m.name] = m })

    const rows = ingredientList.map((ing) => {
      const master = masterMap[ing.name]
      return {
        recipe_id: data.id,
        ingredient_id: master?.id || null,
        ingredient_name: ing.name,
        amount: ing.amount || null,
        category: master?.category || ing.category || 'REVIEW',
      }
    })

    await supabase.from('recipe_ingredients').insert(rows)
  }

  return data
}

// 레시피 상세 조회 시 연관 재료 정보도 함께 가져오기
export async function fetchRecipeWithIngredients(id) {
  if (noDb) return null

  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error

  const { data: recipeIngredients } = await supabase
    .from('recipe_ingredients')
    .select('ingredient_name, amount, category, ingredient_id')
    .eq('recipe_id', id)
    .order('id')

  return { ...recipe, recipe_ingredients: recipeIngredients || [] }
}

// 조회수 증가 (LocalStorage 어뷰징 방지)
const VIEW_COOLDOWN_MS = 30 * 60 * 1000 // 30분

export async function incrementViewCount(recipeId) {
  if (noDb) return

  const storageKey = `view_${recipeId}`
  const lastViewed = localStorage.getItem(storageKey)
  const now = Date.now()

  if (lastViewed && now - Number(lastViewed) < VIEW_COOLDOWN_MS) {
    return // 쿨다운 기간 내 중복 조회 무시
  }

  localStorage.setItem(storageKey, String(now))
  await supabase.rpc('increment_view_count', { recipe_id: recipeId })
}

// 좋아요 토글 (LocalStorage 기반)
export async function toggleLike(recipeId) {
  if (noDb) return { liked: false, newCount: 0 }

  const storageKey = 'liked_recipes'
  const liked = JSON.parse(localStorage.getItem(storageKey) || '[]')
  const isLiked = liked.includes(recipeId)

  const { data } = await supabase.rpc('toggle_like', {
    recipe_id: recipeId,
    should_like: !isLiked,
  })

  if (isLiked) {
    localStorage.setItem(storageKey, JSON.stringify(liked.filter((id) => id !== recipeId)))
  } else {
    localStorage.setItem(storageKey, JSON.stringify([...liked, recipeId]))
  }

  return { liked: !isLiked, newCount: data }
}

// 좋아요 상태 확인
export function isRecipeLiked(recipeId) {
  const liked = JSON.parse(localStorage.getItem('liked_recipes') || '[]')
  return liked.includes(recipeId)
}

// 비밀번호 + 휴대폰 끝번호 검증 후 삭제
export async function deleteRecipe(recipeId, password, phoneLast = '') {
  if (noDb) return false

  const { data } = await supabase.rpc('delete_recipe_with_password', {
    recipe_id: recipeId,
    input_password: password,
    input_phone_last: phoneLast,
  })
  return data // true if deleted
}
