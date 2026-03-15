import { useLanguage } from '../i18n/LanguageContext'
import LanguageSwitcher from '../components/LanguageSwitcher'

const principleIcons = ['eco', 'skillet', 'public']

export default function About() {
  const { t } = useLanguage()
  const a = t.about

  return (
    <>
      {/* Header */}
      <header className="flex items-center bg-white p-4 shrink-0 sticky top-0 z-10 justify-between">
        <div className="w-10" />
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          {a.header}
        </h2>
        <LanguageSwitcher />
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-4">
        {/* Hero */}
        <div className="px-4 py-2">
          <div className="relative h-96 w-full rounded-2xl overflow-hidden">
            <img
              alt="Cozy kitchen background"
              className="absolute inset-0 w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80"
            />
            <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-8">
              <p className="text-white text-2xl font-bold leading-snug drop-shadow-md">
                {a.heroText}
              </p>
            </div>
          </div>
        </div>

        {/* The Why */}
        <section className="px-6 py-12 text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">
            {a.whyTitle}
          </h3>
          <p className="text-[#658671] text-lg font-medium leading-relaxed max-w-md mx-auto">
            {a.whyDesc}
          </p>
        </section>

        {/* Three Guiding Principles */}
        <section className="px-4 py-8 grid grid-cols-1 gap-4">
          {a.principles.map((p, i) => (
            <div
              key={p.title}
              className="bg-[#f5f3ef] p-6 rounded-2xl flex gap-4 items-start border border-primary/5"
            >
              <div className="bg-primary/20 p-3 rounded-full text-primary shrink-0">
                <span className="material-symbols-outlined">{principleIcons[i]}</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">{p.title}</h4>
                <p className="text-[#658671] text-sm leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </>
  )
}
