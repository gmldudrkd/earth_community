import { NavLink } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

const tabDefs = [
  { to: '/', icon: 'home', key: 'home' },
  { to: '/recipes', icon: 'cooking', key: 'recipe' },
  { to: '/about', icon: 'info', key: 'about' },
]

export default function BottomNav() {
  const { t } = useLanguage()

  return (
    <nav className="shrink-0 bg-white/80 backdrop-blur-lg border-t border-neutral-light flex justify-around items-center px-4 py-3">
      {tabDefs.map(({ to, icon, key }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-all duration-300 ${
              isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`flex h-12 w-16 items-center justify-center rounded-full transition-colors ${
                  isActive ? 'bg-primary/20' : 'hover:bg-neutral-light'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-2xl ${
                    isActive ? 'icon-filled' : ''
                  }`}
                >
                  {icon}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {t.nav[key]}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-primary rounded-full" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
