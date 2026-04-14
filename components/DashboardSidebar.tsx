'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Brain, LayoutDashboard, BookOpen, PlayCircle, User, LogOut, Crown, Shield, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const NAV = [
  { href: '/dashboard', label: 'İcmal', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/lessons', label: 'Dərslər', icon: BookOpen },
  { href: '/dashboard/continue', label: 'Davam edirəm', icon: PlayCircle },
  { href: '/assessment', label: 'Bacarıq Testi', icon: BarChart3 },
  { href: '/dashboard/profile', label: 'Profil', icon: User },
]

const PLAN_BADGE: Record<string, { label: string; color: string }> = {
  FREE:  { label: 'Pulsuz', color: 'bg-gray-100 text-gray-600' },
  PRO:   { label: 'Pro', color: 'bg-violet-100 text-violet-700' },
  TEAM:  { label: 'Komanda', color: 'bg-blue-100 text-blue-700' },
}

export default function DashboardSidebar({ profile }: { profile: any }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const plan = profile?.subscriptionPlan || 'FREE'
  const badge = PLAN_BADGE[plan] ?? PLAN_BADGE.FREE
  const initials = (profile?.name || profile?.email || 'U').slice(0, 2).toUpperCase()

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Brain size={17} className="text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">
            Bacar<span className="text-violet-600">IQ</span>
          </span>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{profile?.name || 'İstifadəçi'}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
              {badge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              isActive(item.href, item.exact)
                ? 'bg-violet-50 text-violet-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}

        {profile?.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-orange-600 hover:bg-orange-50 transition"
          >
            <Shield size={18} /> Admin Panel
          </Link>
        )}
      </nav>

      {/* Upgrade CTA (free users) */}
      {plan === 'FREE' && (
        <div className="mx-3 mb-3 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl p-4 text-white">
          <Crown size={18} className="mb-2" />
          <p className="text-xs font-bold mb-1">Pro Plana Keç</p>
          <p className="text-xs text-violet-200 mb-3">Bütün dərslərə + AI tövsiyəsinə giriş</p>
          <Link
            href="/upgrade"
            className="block text-center bg-white text-violet-700 text-xs font-extrabold py-1.5 rounded-lg hover:bg-violet-50 transition"
          >
            14.9 ₼/il
          </Link>
        </div>
      )}

      {/* Legal links */}
      <div className="px-5 pb-2 flex gap-3 text-xs text-gray-400">
        <Link href="/privacy" className="hover:text-gray-600">Məxfilik</Link>
        <Link href="/terms" className="hover:text-gray-600">Şərtlər</Link>
      </div>

      {/* Logout */}
      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition w-full"
        >
          <LogOut size={18} /> Çıxış
        </button>
      </div>
    </aside>
  )
}
