import Logo from './Logo'
import LanguageSwitcher from './LanguageSwitcher'

export default function TopNav() {
  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-3 bg-white/80 backdrop-blur-lg border-b border-neutral-light shrink-0">
      <LanguageSwitcher />
      <Logo size="sm" showSubtitle />
      <div className="w-[88px]" /> {/* spacer to center logo */}
    </header>
  )
}
