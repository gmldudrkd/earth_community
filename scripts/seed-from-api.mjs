/**
 * 식품안전나라 API에서 레시피 데이터를 가져와 Supabase에 저장하는 시드 스크립트
 * 사용법: node scripts/seed-from-api.mjs
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gulmvztsskykqydmfndu.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_O-Xq0bAO6gJSSZmQOxAXCw_DckXkiec'
const API_URL = process.argv[2] || 'http://openapi.foodsafetykorea.go.kr/api/d4edf08abb20456e864d/COOKRCP01/xml/1/5/RCP_NM=두부'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// XML 태그에서 값 추출
function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))
  return match ? match[1].trim() : ''
}

// 재료 문자열 파싱 → [{name, amount}]
function parseIngredients(raw) {
  const ingredients = []
  // 줄바꿈으로 섹션 분리 후 쉼표로 재료 분리
  const lines = raw.split('\n').filter((l) => l.trim())
  for (const line of lines) {
    // "새우두부계란찜", "고명" 같은 섹션 헤더는 스킵 (숫자/g/괄호가 없으면 헤더로 판단)
    if (!line.includes('g') && !line.includes('(')) continue

    const parts = line.split(',')
    for (const part of parts) {
      const trimmed = part.trim()
      if (!trimmed) continue

      // "연두부 75g(3/4모)" → name: "연두부", amount: "75g"
      // 패턴: 이름 숫자g(설명) 또는 이름 숫자g
      const match = trimmed.match(/^(.+?)\s+(\d+g)/)
      if (match) {
        ingredients.push({ name: match[1].trim(), amount: match[2] })
      } else {
        // g 단위가 없으면 이름만
        const nameOnly = trimmed.replace(/\(.*?\)/g, '').trim()
        if (nameOnly) {
          ingredients.push({ name: nameOnly, amount: '' })
        }
      }
    }
  }
  return ingredients
}

// MANUAL01~20에서 steps 추출 → [{text, image_url}]
function parseSteps(xml) {
  const steps = []
  for (let i = 1; i <= 20; i++) {
    const num = String(i).padStart(2, '0')
    const text = extractTag(xml, `MANUAL${num}`)
    if (!text) continue

    // 텍스트 끝의 알파벳 한 글자 제거 (예: "...건진다.a" → "...건진다.")
    const cleanText = text.replace(/\s*[a-zA-Z]$/, '').replace(/^\d+\.\s*/, '').trim()
    const imageUrl = extractTag(xml, `MANUAL_IMG${num}`)

    const step = { text: cleanText }
    if (imageUrl) step.image_url = imageUrl
    steps.push(step)
  }
  return steps
}

// 단일 row를 파싱하여 Supabase에 저장
async function saveRow(row, index) {
  const title = extractTag(row, 'RCP_NM')
  const rawIngredients = extractTag(row, 'RCP_PARTS_DTLS')
  const imageUrl = extractTag(row, 'ATT_FILE_NO_MAIN')
  const ingredients = parseIngredients(rawIngredients)
  const steps = parseSteps(row)

  console.log(`\n[${index + 1}] 레시피: ${title}`)
  console.log(`  재료 ${ingredients.length}개, 조리순서 ${steps.length}단계`)

  const recipe = {
    title,
    image_url: imageUrl,
    category: 'all',
    vegan: false,
    difficulty: 2,
    ingredients,
    steps,
    password: '000000',
  }

  // 1. recipes 테이블에 저장
  const { data, error } = await supabase
    .from('recipes')
    .insert(recipe)
    .select()
    .single()

  if (error) {
    console.error(`  ❌ recipes 저장 실패: ${error.message}`)
    return null
  }

  console.log(`  ✅ 저장 완료 ID: ${data.id}`)

  // 2. recipe_ingredients 중간 테이블에 저장
  if (ingredients.length > 0) {
    const names = ingredients.map((i) => i.name)
    const { data: masterRows } = await supabase
      .from('ingredients_master')
      .select('id, name, category')
      .in('name', names)

    const masterMap = {}
    masterRows?.forEach((m) => { masterMap[m.name] = m })

    const rows = ingredients.map((ing) => {
      const master = masterMap[ing.name]
      return {
        recipe_id: data.id,
        ingredient_id: master?.id || null,
        ingredient_name: ing.name,
        amount: ing.amount || null,
        category: master?.category || 'REVIEW',
      }
    })

    const { error: ingError } = await supabase
      .from('recipe_ingredients')
      .insert(rows)

    if (ingError) {
      console.error(`  ❌ recipe_ingredients 실패: ${ingError.message}`)
    } else {
      console.log(`  ✅ recipe_ingredients ${rows.length}개 저장`)
    }
  }

  return data
}

async function main() {
  console.log('식품안전나라 API에서 데이터 조회 중...')

  const res = await fetch(API_URL)
  const xml = await res.text()

  // 모든 <row> 추출
  const rows = [...xml.matchAll(/<row[^>]*>[\s\S]*?<\/row>/g)].map((m) => m[0])
  if (rows.length === 0) {
    console.error('API 응답에서 row를 찾을 수 없습니다.')
    process.exit(1)
  }

  console.log(`총 ${rows.length}개 레시피 발견`)

  let saved = 0
  for (let i = 0; i < rows.length; i++) {
    const result = await saveRow(rows[i], i)
    if (result) saved++
  }

  console.log(`\n완료! ${saved}/${rows.length}개 저장됨`)
}

main().catch(console.error)
