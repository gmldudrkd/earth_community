import { supabase } from './supabase'

const noDb = !supabase
const BUCKET = 'recipe-images'

// 이미지 업로드 → public URL 반환
export async function uploadImage(file, folder = 'main') {
  if (noDb) throw new Error('Supabase not configured')

  const ext = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
  return data.publicUrl
}

// 메인 이미지 업로드
export async function uploadMainImage(file) {
  return uploadImage(file, 'main')
}

// 단계별 이미지 업로드
export async function uploadStepImage(file, stepIndex) {
  return uploadImage(file, `steps/${stepIndex}`)
}
