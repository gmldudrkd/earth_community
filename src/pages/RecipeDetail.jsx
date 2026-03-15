import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { fetchRecipeWithIngredients, incrementViewCount, toggleLike, isRecipeLiked } from '../lib/recipes'

const CATEGORY_LABELS = {
  all: { ko: '전체', en: 'All' },
  breakfast: { ko: '아침', en: 'Breakfast' },
  lunch: { ko: '점심', en: 'Lunch' },
  dinner: { ko: '저녁', en: 'Dinner' },
  snack: { ko: '간식', en: 'Snack' },
}

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, lang } = useLanguage()
  const isKo = lang === 'ko'
  const fallback = t.recipeDetail

  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    const recipeId = Number(id)

    fetchRecipeWithIngredients(recipeId)
      .then((data) => {
        setRecipe(data)
        setLikeCount(data.like_count || 0)
        setLiked(isRecipeLiked(recipeId))
        incrementViewCount(recipeId)
      })
      .catch(() => {
        setRecipe(null)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleLike = async () => {
    const recipeId = Number(id)
    const { liked: newLiked, newCount } = await toggleLike(recipeId)
    setLiked(newLiked)
    setLikeCount(newCount)
  }

  // DB 데이터 또는 fallback
  const r = recipe
    ? {
        title: recipe.title,
        description: recipe.description,
        time: recipe.prep_time,
        difficulty: recipe.difficulty,
        difficultyLabels: fallback.difficultyLabels,
        ingredients: fallback.ingredients,
        servings: recipe.servings || fallback.servings,
        instructions: fallback.instructions,
        tipLabel: fallback.tipLabel,
        ingredientList: recipe.recipe_ingredients?.length > 0
          ? recipe.recipe_ingredients
          : recipe.ingredients || [],
        steps: recipe.steps || [],
      }
    : fallback

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const stepImages = [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
    null,
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80',
    null,
  ]

  return (
    <>
      {/* Top Navigation */}
      <div className="flex items-center bg-white/80 backdrop-blur-md p-4 justify-between shrink-0 sticky top-0 z-20">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-900 p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-slate-900 text-lg font-bold leading-tight flex-1 text-center">
          {t.appName}
        </h2>
        <button
          onClick={handleLike}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors relative"
        >
          <span className={`material-symbols-outlined ${liked ? 'text-red-500 icon-filled' : 'text-slate-900'}`}>
            favorite
          </span>
          {likeCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {likeCount}
            </span>
          )}
        </button>
      </div>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-4">
        {/* Hero Image */}
        <div className="px-4 py-2">
          <div
            className="bg-cover bg-center overflow-hidden rounded-2xl aspect-[4/3] shadow-sm"
            style={{
              backgroundImage: `url("${
                recipe?.image_url || 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80'
              }")`,
            }}
          />
        </div>

        {/* Title & Info */}
        <div className="px-6 pt-6 pb-2">
          <h1 className="text-slate-900 text-3xl font-bold leading-tight mb-2">{r.title}</h1>
          {r.description && (
            <p className="text-slate-500 text-sm mb-4">{r.description}</p>
          )}

          {/* Category & Vegan Badge */}
          {recipe && (
            <div className="flex items-center gap-2 mb-4">
              {recipe.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  {CATEGORY_LABELS[recipe.category]?.[isKo ? 'ko' : 'en'] || recipe.category}
                </span>
              )}
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                recipe.vegan
                  ? 'bg-primary/10 text-primary'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                <span className="material-symbols-outlined text-sm">
                  {recipe.vegan ? 'spa' : 'egg_alt'}
                </span>
                {recipe.vegan
                  ? (isKo ? '완전 식물성' : '100% Plant')
                  : (isKo ? '달걀/유제품 포함' : 'Egg/Dairy')}
              </span>
            </div>
          )}

          {/* View & Like Count */}
          {recipe && (
            <div className="flex items-center gap-4 mb-4 text-slate-400 text-sm">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base">visibility</span>
                {recipe.view_count || 0}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base text-red-400 icon-filled">favorite</span>
                {likeCount}
              </span>
              {recipe.created_at && (
                <span className="flex items-center gap-1 ml-auto text-xs">
                  <span className="material-symbols-outlined text-base">calendar_today</span>
                  {new Date(recipe.created_at).toLocaleDateString(isKo ? 'ko-KR' : 'en-US')}
                </span>
              )}
            </div>
          )}

          {/* Quick Info Bar */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="material-symbols-outlined text-base">schedule</span>
              <span className="text-sm font-medium">{r.time}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="material-symbols-outlined text-base">group</span>
              <span className="text-sm font-medium">{r.servings}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <div className="flex items-center gap-0.5 text-primary">
                {Array.from({ length: r.difficulty || 1 }).map((_, j) => (
                  <span key={j} className="material-symbols-outlined text-base">potted_plant</span>
                ))}
                {Array.from({ length: 5 - (r.difficulty || 1) }).map((_, j) => (
                  <span key={j} className="material-symbols-outlined text-base text-slate-200">potted_plant</span>
                ))}
              </div>
              <span className="text-sm font-medium text-slate-500 ml-1">
                {r.difficultyLabels[r.difficulty || 1]}
              </span>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="px-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">{r.ingredients}</h3>
            <span className="text-sm text-primary font-semibold">{r.servings}</span>
          </div>
          <ul className="space-y-3">
            {r.ingredientList.map((ing, idx) => {
              const dotColor = {
                SAFE_PLANT: 'bg-primary',
                EGG: 'bg-amber-500',
                DAIRY: 'bg-blue-500',
                ANIMAL: 'bg-red-500',
                REVIEW: 'bg-slate-400',
              }[ing.category] || 'bg-primary'
              const displayName = ing.ingredient_name || ing.name
              const displayAmount = ing.amount
              return (
              <li key={displayName || idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                  <span className="text-slate-700">{displayName}</span>
                </div>
                <span className="text-slate-500 font-medium">{displayAmount}</span>
              </li>
              )
            })}
          </ul>
        </div>

        {/* Instructions */}
        <div className="px-6 mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">{r.instructions}</h3>
          <div className="space-y-8">
            {r.steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-slate-700 leading-relaxed mb-3">
                    {typeof step === 'string' ? step : step.text}
                  </p>
                  {!recipe && stepImages[i] && (
                    <div
                      className="w-full h-32 rounded-xl bg-cover bg-center"
                      style={{ backgroundImage: `url("${stepImages[i]}")` }}
                    />
                  )}
                  {step.image_url && (
                    <div
                      className="w-full h-32 rounded-xl bg-cover bg-center"
                      style={{ backgroundImage: `url("${step.image_url}")` }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
