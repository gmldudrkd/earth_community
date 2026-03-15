import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageSwitcher from '../components/LanguageSwitcher'

const recipeImages = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
  'https://images.unsplash.com/photo-1543339308-d595c3a9b926?w=600&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
]

const recipeDifficulty = [2, 1, 1]

const recipeTags = [
  [
    { icon: 'nutrition', label: 'Tofu' },
    { icon: 'eco', label: 'Mushroom' },
    { icon: 'restaurant', label: 'Vegan' },
  ],
  [
    { icon: 'dinner_dining', label: 'Pasta' },
    { icon: 'grass', label: 'Basil' },
    { icon: 'schedule', label: '15 min' },
  ],
  [
    { icon: 'nutrition', label: 'Greens' },
    { icon: 'spa', label: 'Avocado' },
    { icon: 'bolt', label: 'Quick' },
  ],
]

export default function RecipeList() {
  const { t } = useLanguage()
  const r = t.recipeList

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
        {/* Search Bar */}
        <div className="px-6 py-4">
          <div className="flex w-full items-center rounded-lg bg-slate-100 px-4 py-3 border border-slate-200">
            <span className="material-symbols-outlined text-slate-400">search</span>
            <input
              className="w-full border-none bg-transparent focus:ring-0 text-slate-900 placeholder:text-slate-400 ml-2 text-base outline-none"
              placeholder={r.searchPlaceholder}
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-3 px-6 py-2 overflow-x-auto scrollbar-hide">
          {r.filters.map((filter, i) => (
            <button
              key={filter}
              className={`flex h-10 shrink-0 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors ${
                i === 0
                  ? 'bg-primary text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Recipe Feed */}
        <div className="p-6 space-y-6 pb-4">
          {r.recipes.map((recipe, i) => (
            <Link
              key={i}
              to={`/recipes/${i + 1}`}
              className="block recipe-card-shadow rounded-2xl overflow-hidden bg-white border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div
                className="h-48 w-full bg-cover bg-center"
                style={{ backgroundImage: `url('${recipeImages[i]}')` }}
              />
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-slate-900">{recipe.title}</h3>
                  <div className="flex text-primary">
                    {Array.from({ length: recipeDifficulty[i] }).map((_, j) => (
                      <span key={j} className="material-symbols-outlined text-lg">potted_plant</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  {recipeTags[i].map((tag) => (
                    <div key={tag.label} className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
                      <span className="material-symbols-outlined text-sm text-slate-500">{tag.icon}</span>
                      <span className="text-xs font-medium text-slate-600">{tag.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
