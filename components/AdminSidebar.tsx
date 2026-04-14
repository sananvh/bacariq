'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Brain, LayoutDashboard, BookOpen, Users, BarChart3, Zap, Settings, LogOut, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const NAV = [
  { href: '/admin', label: 'İcmal', icon: LayoutDashboard, exact: true },
  { href: '/admin/lessons', label: 'Dərslər', icon: BookOpen },
  { href: '/admin/users', label: 'İstifadəçilər', icon: Users },
  { href: '/admin/ai', label: 'AI Motor', icon: Zap },
  { href: '/admin/analytics', label: 'Analitika', icon: BarChart3 },
  { href: '/admin/trends', label: 'Trendlər', icon: TrendingUp },
  { href: '/admin/settings', label: 'Parametrlər', icon: Settings },
]

export default function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Brain size={17} className="text-white" />
          </div>
          <span className="font-extrabold text-white text-lg">
            Bacar<span className="text-violet-400">IQ</span>
          </span>
        </Link>
        <p className="text-gray-500 text-xs mt-2">Admin Panel</p>
      </div>

      <div className="px-3 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {name?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
          <div>
            <p className="text-white text-sm font-semibold truncate">{name}</p>
            <p className="text-gray-500 text-xs">Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              isActive(item.href, item.exact)
                ? 'bg-violet-600/20 text-violet-400'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <item.icon size={17} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-900/30 hover:text-red-400 transition w-full"
        >
          <LogOut size={17} /> Çıxış
        </button>
      </div>
    </aside>
  )
}
