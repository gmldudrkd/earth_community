import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageSwitcher from '../components/LanguageSwitcher'

const recipeImages = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
  'https://images.unsplash.com/photo-1543339308-d595c3a9b926?w=600&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
]

export default function RecipeList() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const r = t.recipeList
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category'))
  const [activeFilters, setActiveFilters] = useState([])
  const categories = t.home.categoryList

  return (
    <>
      {/* Header */}
      <header className="flex items-center bg-white p-6 pb-2 justify-between shrink-0 sticky top-0 z-10">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.appName}
          </h1>
          <p className="text-slate-500 text-sm">{r.subtitle}</p>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Search Bar + Add Button */}
        <div className="flex items-center gap-3 px-6 py-4">
          <div className="flex flex-1 items-center rounded-lg bg-slate-100 px-4 py-3 border border-slate-200">
            <span className="material-symbols-outlined text-slate-400">search</span>
            <input
              className="w-full border-none bg-transparent focus:ring-0 text-slate-900 placeholder:text-slate-400 ml-2 text-base outline-none"
              placeholder={r.searchPlaceholder}
            />
          </div>
          <button
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 transition-colors active:scale-95"
            aria-label="Search"
          >
            <span className="material-symbols-outlined text-xl">search</span>
          </button>
          <button
            onClick={() => navigate('/recipes/new')}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-dark transition-colors active:scale-95"
            aria-label="Add recipe"
          >
            <span className="material-symbols-outlined text-xl">add</span>
          </button>
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 px-6 pt-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.label
            return (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(isActive ? null : cat.label)}
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
        <div className="flex gap-2 px-6 py-2 overflow-x-auto scrollbar-hide">
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
        <div className="p-6 space-y-5 pb-4">
          {r.recipes.map((recipe, i) => (
            <Link
              key={i}
              to={`/recipes/${i + 1}`}
              className="block recipe-card-shadow rounded-2xl overflow-hidden bg-white border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div
                className="h-48 w-full bg-cover bg-center relative"
                style={{ backgroundImage: `url('${recipeImages[i]}')` }}
              >
                {/* Vegan Badge on Image */}
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
                      ? (t.nav.recipe === '레시피' ? '완전 식물성' : '100% Plant')
                      : (t.nav.recipe === '레시피' ? '달걀/유제품 포함' : 'Egg/Dairy')}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-slate-900 mb-3">{recipe.title}</h3>
                <div className="flex items-center gap-3">
                  {/* Cooking Time */}
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="material-symbols-outlined text-base">schedule</span>
                    <span className="text-xs font-medium">{recipe.time}</span>
                  </div>
                  {/* Difficulty */}
                  <div className="flex items-center gap-0.5">
                    <div className="flex items-center gap-0.5 text-primary">
                      {Array.from({ length: recipe.difficulty }).map((_, j) => (
                        <span key={j} className="material-symbols-outlined text-base">potted_plant</span>
                      ))}
                      {Array.from({ length: 5 - recipe.difficulty }).map((_, j) => (
                        <span key={j} className="material-symbols-outlined text-base text-slate-200">potted_plant</span>
                      ))}
                    </div>
                    <span className="text-xs font-medium text-slate-500 ml-1">{r.difficultyLabels[recipe.difficulty]}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
