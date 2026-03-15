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

  // DB 레시피가 없으면 번역 파일의 하드코딩 데이터 표시
  const displayRecipes = recipes.length > 0
    ? recipes.slice(0, 6)
    : h.recipes.map((r, i) => ({ ...r, id: i + 1, _static: true }))

  return (
    <>
      {/* Header */}
      <header className="flex items-center bg-white p-6 pb-2 justify-between shrink-0">
        <Logo size="sm" showSubtitle />
        <LanguageSwitcher />
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-4">
        {/* Hero */}
        <section className="px-6 py-8">
          <h1 className="text-slate-900 text-4xl font-bold leading-tight tracking-tight">
            {h.hero.before}
            <span className="text-primary">{h.hero.highlight}</span>
            {h.hero.after}
          </h1>
        </section>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="px-6 mb-8">
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
          <div className="flex items-center justify-between px-6 mb-4">
            <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-tight">
              {h.curatedPicks}
            </h2>
            <Link
              to="/recipes"
              className="text-primary text-sm font-semibold hover:opacity-80 transition-opacity"
            >
              {h.seeAll}
            </Link>
          </div>

          <div className="flex overflow-x-auto gap-4 scrollbar-hide px-6">
            {displayRecipes.map((recipe, i) => {
              const id = recipe.id || i + 1
              const isStatic = recipe._static
              const title = recipe.title
              const imageUrl = recipe.image_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]
              const difficultyLabels = t.recipeList.difficultyLabels

              return (
                <Link
                  key={id}
                  to={`/recipes/${id}`}
                  className="flex-none w-[280px] group block"
                >
                  <div className="w-full aspect-[4/5] bg-neutral-light rounded-[2rem] overflow-hidden mb-3 relative">
                    <img
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={imageUrl}
                    />
                    {/* Like Button */}
                    <button
                      onClick={(e) => !isStatic && handleLike(e, id)}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 hover:bg-white transition-colors"
                    >
                      <span className={`material-symbols-outlined text-xl ${
                        likedMap[id] ? 'text-red-500 icon-filled' : 'text-slate-400'
                      }`}>
                        favorite
                      </span>
                    </button>
                    {/* Like Count */}
                    {!isStatic && recipe.like_count > 0 && (
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
                      <p className="text-slate-500 text-sm font-medium">
                        {isStatic ? `${recipe.time}` : recipe.prep_time || ''}
                      </p>
                      {/* Difficulty */}
                      {!isStatic && recipe.difficulty && (
                        <span className="text-slate-400 text-xs ml-1">
                          {difficultyLabels[recipe.difficulty]}
                        </span>
                      )}
                      {!isStatic && (
                        <span className="text-slate-400 text-xs flex items-center gap-0.5 ml-auto">
                          <span className="material-symbols-outlined text-xs">visibility</span>
                          {recipe.view_count}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Categories */}
        <section className="px-6 pb-8">
          <h2 className="text-slate-900 text-xl font-bold mb-4">{h.categories}</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/recipes"
              className="bg-slate-100 p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-slate-200 transition-colors col-span-2"
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
        <section className="px-6 py-12 bg-[#f6f8f7]">
          <h4 className="text-center text-xl font-bold mb-8">{h.starterGuide}</h4>
          <div className="flex flex-col gap-8 relative">
            <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-primary/20" />
            {h.starterSteps.map((step, i) => (
              <div key={i} className="flex gap-6 items-start relative z-10">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="pt-2">
                  <h5 className="font-bold text-slate-900">{step.title}</h5>
                  <p className="text-[#658671] text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
