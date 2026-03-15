import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import TopNav from './TopNav'

export default function Layout() {
  return (
    <div className="relative flex h-screen w-full flex-col bg-white">
      {/* Desktop top nav */}
      <TopNav />
      <Outlet />
      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
