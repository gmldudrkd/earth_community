import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageSwitcher from '../components/LanguageSwitcher'

const recipeImages = [
  { image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', icon: 'schedule' },
  { image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80', icon: 'fitness_center' },
  { image: 'https://images.unsplash.com/photo-1543339308-d595c3a9b926?w=600&q=80', icon: 'eco' },
]

const categoryIcons = ['breakfast_dining', 'lunch_dining', 'dinner_dining', 'bakery_dining']

export default function Home() {
  const { t } = useLanguage()
  const h = t.home

  return (
    <>
      {/* Header */}
      <header className="flex items-center bg-white p-6 pb-2 justify-between shrink-0">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-light text-slate-900">
          <span className="material-symbols-outlined text-2xl">menu</span>
        </div>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          {t.appName}
        </h2>
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
        <div className="px-6 mb-8">
          <div className="flex items-center bg-neutral-light rounded-2xl px-4 py-3 text-slate-500 cursor-pointer hover:bg-slate-200/60 transition-colors">
            <span className="material-symbols-outlined mr-2">search</span>
            <span className="text-sm">{h.search}</span>
          </div>
        </div>

        {/* Curated Picks */}
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

          <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide">
            <div className="shrink-0 w-4" />
            {h.recipes.map((recipe, i) => (
              <Link
                key={i}
                to={`/recipes/${i + 1}`}
                className="flex-none w-[280px] snap-start group block"
              >
                <div className="w-full aspect-[4/5] bg-neutral-light rounded-[2rem] overflow-hidden mb-3 relative">
                  <img
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={recipeImages[i].image}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 text-primary hover:bg-white transition-colors">
                    <span className="material-symbols-outlined text-xl">favorite</span>
                  </div>
                </div>
                <div className="px-1">
                  <p className="text-slate-900 text-lg font-bold">{recipe.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-sm text-primary">
                      {recipeImages[i].icon}
                    </span>
                    <p className="text-slate-500 text-sm font-medium">
                      {recipe.time} &bull; {recipe.tag}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            <div className="shrink-0 w-4" />
          </div>
        </section>

        {/* Categories */}
        <section className="px-6 pb-8">
          <h2 className="text-slate-900 text-xl font-bold mb-4">{h.categories}</h2>
          <div className="grid grid-cols-2 gap-4">
            {h.categoryList.map((cat, i) => (
              <Link
                to={`/recipes?category=${encodeURIComponent(cat.label)}`}
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
