import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import Logo from '../components/Logo'
import { fetchRecipes, searchRecipes, toggleLike, isRecipeLiked } from '../lib/recipes'

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
  'https://images.unsplash.com/photo-1543339308-d595c3a9b926?w=600&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
]

const CATEGORY_KEYS = ['breakfast', 'lunch', 'dinner', 'snack']

export default function RecipeList() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const r = t.recipeList
  const [searchParams, setSearchParams] = useSearchParams()

  const [activeCategory, setActiveCategory] = useState(searchParams.get('category'))
  const [activeFilters, setActiveFilters] = useState([])
  const [sortBy, setSortBy] = useState('created_at') // 'created_at' | 'like_count'
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const categories = t.home.categoryList

  const [recipes, setRecipes] = useState([])
  const [likedMap, setLikedMap] = useState({})
  const [loaded, setLoaded] = useState(false)

  // 데이터 로드
  const loadRecipes = async () => {
    try {
      let data
      if (searchQuery.trim()) {
        data = await searchRecipes(searchQuery.trim())
      } else {
        data = await fetchRecipes({
          orderBy: sortBy,
          ascending: false,
          category: activeCategory,
        })
      }
      setRecipes(data || [])
      const map = {}
      data?.forEach((rec) => { map[rec.id] = isRecipeLiked(rec.id) })
      setLikedMap(map)
    } catch {
      // fallback
    } finally {
      setLoaded(true)
    }
  }

  useEffect(() => {
    loadRecipes()
  }, [sortBy, activeCategory])

  // URL search param이 바뀌면 검색어 업데이트
  useEffect(() => {
    const q = searchParams.get('search') || ''
    if (q !== searchQuery) {
      setSearchQuery(q)
    }
    const cat = searchParams.get('category')
    if (cat !== activeCategory) {
      setActiveCategory(cat)
    }
  }, [searchParams])

  // 검색어 변경 시 로드
  useEffect(() => {
    if (loaded) loadRecipes()
  }, [searchQuery])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim())
    } else {
      params.delete('search')
    }
    setSearchParams(params)
  }

  const handleCategoryClick = (catKey) => {
    const newCat = catKey === null ? null : (activeCategory === catKey ? null : catKey)
    setActiveCategory(newCat)
    const params = new URLSearchParams(searchParams)
    if (newCat) {
      params.set('category', newCat)
    } else {
      params.delete('category')
    }
    setSearchParams(params)
  }

  const handleLike = async (e, recipeId) => {
    e.preventDefault()
    e.stopPropagation()
    const { liked, newCount } = await toggleLike(recipeId)
    setLikedMap((prev) => ({ ...prev, [recipeId]: liked }))
    setRecipes((prev) =>
      prev.map((rec) => (rec.id === recipeId ? { ...rec, like_count: newCount } : rec))
    )
  }

  // 클라이언트 필터 적용
  const filteredRecipes = useMemo(() => {
    let list = recipes

    if (activeFilters.includes('vegan')) {
      list = list.filter((rec) => rec.vegan === true)
    }
    if (activeFilters.includes('dairy-ok')) {
      list = list.filter((rec) => rec.vegan === false)
    }
    if (activeFilters.includes('quick')) {
      list = list.filter((rec) => rec.prep_time_minutes != null && rec.prep_time_minutes <= 15)
    }
    if (activeFilters.includes('beginner')) {
      list = list.filter((rec) => rec.difficulty != null && rec.difficulty === 1)
    }

    return list
  }, [recipes, activeFilters])

  return (
    <>
      {/* Header - mobile only */}
      <header className="flex items-center bg-white p-6 pb-2 justify-between shrink-0 sticky top-0 z-10 lg:hidden">
        <Logo size="sm" showSubtitle />
        <LanguageSwitcher />
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
        {/* Search Bar + Add Button */}
        <form onSubmit={handleSearch} className="flex items-center gap-3 px-6 lg:px-8 py-4">
          <div className="flex flex-1 items-center rounded-lg bg-slate-100 px-4 py-3 border border-slate-200">
            <span className="material-symbols-outlined text-slate-400">search</span>
            <input
              className="w-full border-none bg-transparent focus:ring-0 text-slate-900 placeholder:text-slate-400 ml-2 text-base outline-none"
              placeholder={r.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  const params = new URLSearchParams(searchParams)
                  params.delete('search')
                  setSearchParams(params)
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
          <button
            type="submit"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 transition-colors active:scale-95"
            aria-label="Search"
          >
            <span className="material-symbols-outlined text-xl">search</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/recipes/new')}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-dark transition-colors active:scale-95"
            aria-label="Add recipe"
          >
            <span className="material-symbols-outlined text-xl">add</span>
          </button>
        </form>

        {/* Sort Toggle */}
        <div className="flex items-center gap-2 px-6 lg:px-8 pb-2">
          <span className="material-symbols-outlined text-slate-400 text-base">sort</span>
          <button
            onClick={() => setSortBy('created_at')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
              sortBy === 'created_at'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {r.sortByDate}
          </button>
          <button
            onClick={() => setSortBy('like_count')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
              sortBy === 'like_count'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {r.sortByLikes}
          </button>
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 px-6 lg:px-8 pt-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-all ${
              !activeCategory
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            {t.nav.recipe === 'Recipe' ? 'All' : '전체'}
          </button>
          {categories.map((cat, i) => {
            const catKey = CATEGORY_KEYS[i]
            const isActive = activeCategory === catKey
            return (
              <button
                key={catKey}
                onClick={() => handleCategoryClick(catKey)}
                className={`flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 px-6 lg:px-8 py-2 overflow-x-auto scrollbar-hide">
          {r.filters.map((filter) => {
            const isActive = activeFilters.includes(filter.key)
            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilters((prev) =>
                  isActive ? prev.filter((k) => k !== filter.key) : [...prev, filter.key]
                )}
                className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                }`}
              >
                <span className={`material-symbols-outlined text-base ${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {filter.icon}
                </span>
                {filter.label}
              </button>
            )
          })}
        </div>

        {/* Recipe Feed */}
        <div className="p-6 lg:px-8 pb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredRecipes.length === 0 && loaded && (
            <div className="text-center py-12 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
              <p className="text-sm">{r.noResults}</p>
            </div>
          )}
          {filteredRecipes.map((recipe, i) => {
            const imageUrl = recipe.image_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]

            return (
              <Link
                key={recipe.id}
                to={`/recipes/${recipe.id}`}
                className="block recipe-card-shadow rounded-2xl overflow-hidden bg-white border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div
                  className="h-48 w-full bg-cover bg-center relative"
                  style={{ backgroundImage: `url('${imageUrl}')` }}
                >
                  {/* Vegan Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                      recipe.vegan
                        ? 'bg-primary/80 text-white'
                        : 'bg-amber-500/80 text-white'
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {recipe.vegan ? 'spa' : 'egg_alt'}
                      </span>
                      {recipe.vegan
                        ? (t.nav.recipe === 'Recipe' ? '100% Plant' : '완전 식물성')
                        : (t.nav.recipe === 'Recipe' ? 'Egg/Dairy' : '달걀/유제품 포함')}
                    </span>
                  </div>

                  {/* Like Button on Card */}
                  <button
                    onClick={(e) => handleLike(e, recipe.id)}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full p-2 hover:bg-white transition-colors flex items-center gap-1"
                  >
                    <span className={`material-symbols-outlined text-base ${
                      likedMap[recipe.id] ? 'text-red-500 icon-filled' : 'text-slate-400'
                    }`}>
                      favorite
                    </span>
                    {recipe.like_count > 0 && (
                      <span className="text-xs font-bold text-slate-700">{recipe.like_count}</span>
                    )}
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{recipe.title}</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      <span className="text-xs font-medium">{recipe.prep_time}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <div className="flex items-center gap-0.5 text-primary">
                        {Array.from({ length: recipe.difficulty || 1 }).map((_, j) => (
                          <span key={j} className="material-symbols-outlined text-base">potted_plant</span>
                        ))}
                        {Array.from({ length: 5 - (recipe.difficulty || 1) }).map((_, j) => (
                          <span key={j} className="material-symbols-outlined text-base text-slate-200">potted_plant</span>
                        ))}
                      </div>
                      <span className="text-xs font-medium text-slate-500 ml-1">
                        {r.difficultyLabels[recipe.difficulty || 1]}
                      </span>
                    </div>
                    <span className="text-slate-400 text-xs flex items-center gap-0.5 ml-auto">
                      <span className="material-symbols-outlined text-xs">visibility</span>
                      {recipe.view_count || 0}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        </div>
      </main>
    </>
  )
}
