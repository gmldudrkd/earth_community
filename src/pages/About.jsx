import { useLanguage } from '../i18n/LanguageContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import Logo from '../components/Logo'

const principleIcons = ['eco', 'skillet', 'public']

export default function About() {
  const { t } = useLanguage()
  const a = t.about

  return (
    <>
      {/* Header - mobile only */}
      <header className="flex items-center bg-white p-6 pb-2 shrink-0 sticky top-0 z-10 justify-between lg:hidden">
        <Logo size="sm" showSubtitle />
        <LanguageSwitcher />
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-4">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="px-4 lg:px-8 py-2 lg:py-6">
            <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary/15 via-emerald-50 to-teal-50 p-8 py-12 lg:p-16 lg:py-20">
              <div className="absolute top-4 right-4 opacity-10">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '120px' }}>eco</span>
              </div>
              <p className="text-primary font-bold text-sm tracking-wide mb-3">WHY OMG TABLE?</p>
              <p className="text-slate-800 text-2xl lg:text-4xl font-bold leading-snug lg:max-w-2xl whitespace-pre-line">
                {a.heroText}
              </p>
            </div>
          </div>

          {/* The Why */}
          <section className="px-6 lg:px-8 py-10 text-center">
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3 leading-tight">
              {a.whyTitle}
            </h3>
            <p className="text-[#658671] text-base lg:text-lg font-medium leading-relaxed max-w-md lg:max-w-2xl mx-auto">
              {a.whyDesc}
            </p>
          </section>

          {/* Three Guiding Principles */}
          <section className="px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {a.principles.map((p, i) => (
              <div
                key={p.title}
                className="bg-[#f5f3ef] p-6 rounded-2xl flex lg:flex-col lg:items-center lg:text-center gap-4 items-start border border-primary/5"
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

          {/* Contact / Instagram DM */}
          <section className="px-6 lg:px-8 py-8 bg-white border-t border-slate-100">
            <div className="text-center">
              <p className="text-slate-500 text-sm mb-2">
                {t.nav.recipe === '레시피'
                  ? '레시피 수정/삭제 요청 및 기타 문의'
                  : 'Recipe edit/delete requests & inquiries'}
              </p>
              <a
                href="https://www.instagram.com/greenn_lab/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-bold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                {t.nav.recipe === '레시피' ? 'Instagram DM으로 문의하기' : 'Contact via Instagram DM'}
              </a>
              <p className="text-slate-400 text-xs mt-3">@greenn_lab</p>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
