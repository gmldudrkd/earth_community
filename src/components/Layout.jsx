import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="relative flex h-screen w-full flex-col max-w-md mx-auto bg-white shadow-xl overflow-hidden border-x border-neutral-light">
      <Outlet />
      <BottomNav />
    </div>
  )
}
