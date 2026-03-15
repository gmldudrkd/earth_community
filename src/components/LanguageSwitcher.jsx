import { useLanguage } from '../i18n/LanguageContext'

const languages = [
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
  { code: 'en', flag: '🇺🇸', label: 'EN' },
]

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex items-center bg-neutral-light rounded-full p-0.5 gap-0.5">
      {languages.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
            lang === code
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="text-sm">{flag}</span>
          {label}
        </button>
      ))}
    </div>
  )
}
