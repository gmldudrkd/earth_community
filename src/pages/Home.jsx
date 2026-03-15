import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import Logo from '../components/Logo'
import { fetchRecipes, toggleLike, isRecipeLiked } from '../lib/recipes'

const categoryIcons = ['breakfast_dining', 'lunch_dining', 'dinner_dining', 'bakery_dining']
const categoryKeys = ['breakfast', 'lunch', 'dinner', 'snack']

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
  'https://images.unsplash.com/photo-1543339308-d595c3a9b926?w=600&q=80',
]

export default function Home() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const h = t.home
  const [recipes, setRecipes] = useState([])
  const [likedMap, setLikedMap] = useState({})
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchRecipes({ orderBy: 'view_count', ascending: false })
      .then((data) => {
        setRecipes(data || [])
        const map = {}
        data?.forEach((r) => { map[r.id] = isRecipeLiked(r.id) })
        setLikedMap(map)
      })
      .catch(() => {})
  }, [])

  const handleLike = async (e, recipeId) => {
    e.preventDefault()
    e.stopPropagation()
    const { liked, newCount } = await toggleLike(recipeId)
    setLikedMap((prev) => ({ ...prev, [recipeId]: liked }))
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, like_count: newCount } : r))
    )
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/recipes?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const displayRecipes = recipes.slice(0, 6)

  return (
    <>
      {/* Header - mobile only (desktop uses TopNav) */}
      <header className="flex items-center bg-white p-6 pb-2 justify-between shrink-0 lg:hidden">
        <Logo size="sm" showSubtitle />
        <LanguageSwitcher />
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <section className="px-6 py-8 lg:py-16 lg:px-8">
            <h1 className="text-slate-900 text-4xl lg:text-6xl font-bold leading-tight tracking-tight lg:max-w-2xl">
              {h.hero.before}
              <span className="text-primary">{h.hero.highlight}</span>
              {h.hero.after}
            </h1>
          </section>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="px-6 mb-8 lg:px-8 lg:max-w-xl">
            <div className="flex items-center bg-neutral-light rounded-2xl px-4 py-3 text-slate-500">
              <span className="material-symbols-outlined mr-2">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={h.search}
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
            </div>
          </form>

          {/* Curated Picks - 조회수 높은 순 */}
          <section className="mb-8">
            <div className="flex items-center justify-between px-6 lg:px-8 mb-4">
              <h2 className="text-slate-900 text-xl lg:text-2xl font-bold leading-tight tracking-tight">
                {h.curatedPicks}
              </h2>
              <Link
                to="/recipes"
                className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity"
              >
                {h.seeAll}
              </Link>
            </div>

            {displayRecipes.length === 0 ? (
              <div className="text-center py-12 text-slate-400 px-6">
                <span className="material-symbols-outlined text-4xl mb-2 block">restaurant</span>
                <p className="text-sm">{t.nav.recipe === 'Recipe' ? 'No recipes yet. Be the first to share!' : '아직 레시피가 없어요. 첫 번째 레시피를 등록해보세요!'}</p>
                <Link to="/recipes/new" className="inline-flex items-center gap-1 mt-3 text-primary font-semibold text-sm hover:opacity-80">
                  <span className="material-symbols-outlined text-base">add</span>
                  {t.nav.recipe === 'Recipe' ? 'Add Recipe' : '레시피 등록'}
                </Link>
              </div>
            ) : (
              <>
                {/* Mobile: horizontal scroll / Desktop: grid */}
                <div className="flex overflow-x-auto gap-4 scrollbar-hide px-6 lg:hidden">
                  {displayRecipes.map((recipe, i) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      index={i}
                      likedMap={likedMap}
                      handleLike={handleLike}
                      t={t}
                      className="flex-none w-[280px]"
                    />
                  ))}
                </div>
                <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-6 px-8">
                  {displayRecipes.map((recipe, i) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      index={i}
                      likedMap={likedMap}
                      handleLike={handleLike}
                      t={t}
                    />
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Categories */}
          <section className="px-6 lg:px-8 pb-8">
            <h2 className="text-slate-900 text-xl lg:text-2xl font-bold mb-4">{h.categories}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Link
                to="/recipes"
                className="bg-slate-100 p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-slate-200 transition-colors col-span-2 md:col-span-3 lg:col-span-1"
              >
                <span className="material-symbols-outlined text-slate-600">apps</span>
                <span className="font-bold text-slate-800">{t.nav.recipe === 'Recipe' ? 'All' : '전체'}</span>
              </Link>
              {h.categoryList.map((cat, i) => (
                <Link
                  to={`/recipes?category=${categoryKeys[i]}`}
                  key={cat.label}
                  className="bg-primary/10 p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-primary/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary">
                    {categoryIcons[i]}
                  </span>
                  <span className="font-bold text-slate-800">{cat.label}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Quick Starter Guide */}
          <section className="px-6 lg:px-8 py-12 bg-[#f6f8f7]">
            <h4 className="text-center text-xl lg:text-2xl font-bold mb-8">{h.starterGuide}</h4>
            <div className="flex flex-col lg:flex-row lg:justify-center gap-8 relative max-w-4xl mx-auto">
              <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-primary/20 lg:hidden" />
              {h.starterSteps.map((step, i) => (
                <div key={i} className="flex lg:flex-col lg:items-center lg:text-center gap-6 items-start relative z-10 lg:flex-1">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="pt-2 lg:pt-0">
                    <h5 className="font-bold text-slate-900">{step.title}</h5>
                    <p className="text-[#658671] text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

function RecipeCard({ recipe, index, likedMap, handleLike, t, className = '' }) {
  const id = recipe.id
  const title = recipe.title
  const imageUrl = recipe.image_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
  const difficultyLabels = t.recipeList.difficultyLabels

  return (
    <Link
      to={`/recipes/${id}`}
      className={`group block ${className}`}
    >
      <div className="w-full aspect-[4/5] bg-neutral-light rounded-[2rem] overflow-hidden mb-3 relative">
        <img
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={imageUrl}
        />
        <button
          onClick={(e) => handleLike(e, id)}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 hover:bg-white transition-colors"
        >
          <span className={`material-symbols-outlined text-xl ${
            likedMap[id] ? 'text-red-500 icon-filled' : 'text-slate-400'
          }`}>
            favorite
          </span>
        </button>
        {recipe.like_count > 0 && (
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-full px-2.5 py-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-red-500 text-sm icon-filled">favorite</span>
            <span className="text-xs font-bold text-slate-700">{recipe.like_count}</span>
          </div>
        )}
      </div>
      <div className="px-1">
        <p className="text-slate-900 text-lg font-bold">{title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="material-symbols-outlined text-sm text-primary">schedule</span>
          <p className="text-slate-500 text-sm font-medium">{recipe.prep_time || ''}</p>
          {recipe.difficulty && (
            <span className="text-slate-400 text-xs ml-1">
              {difficultyLabels[recipe.difficulty]}
            </span>
          )}
          <span className="text-slate-400 text-xs flex items-center gap-0.5 ml-auto">
            <span className="material-symbols-outlined text-xs">visibility</span>
            {recipe.view_count}
          </span>
        </div>
      </div>
    </Link>
  )
}
