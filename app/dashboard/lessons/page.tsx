import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { BookOpen, Lock, ChevronRight } from 'lucide-react'

const CATEGORY_ICONS: Record<string, string> = {
  'Kommunikasiya Bacarıqları': '🗣️',
  'Liderlik və Komanda': '👥',
  'Düşüncə Sistemi': '🧠',
  'Danışıqlar və Təsir': '🤝',
  'Şəxsi Effektivlik': '⚡',
  'Karyera İnkişafı': '🚀',
}

const CATEGORY_COLORS: Record<string, { from: string; to: string; bg: string }> = {
  'Kommunikasiya Bacarıqları': { from: 'from-blue-500',   to: 'to-cyan-400',    bg: 'bg-blue-50' },
  'Liderlik və Komanda':       { from: 'from-violet-500', to: 'to-purple-400',  bg: 'bg-violet-50' },
  'Düşüncə Sistemi':           { from: 'from-amber-500',  to: 'to-orange-400',  bg: 'bg-amber-50' },
  'Danışıqlar və Təsir':       { from: 'from-green-500',  to: 'to-emerald-400', bg: 'bg-green-50' },
  'Şəxsi Effektivlik':         { from: 'from-pink-500',   to: 'to-rose-400',    bg: 'bg-pink-50' },
  'Karyera İnkişafı':          { from: 'from-indigo-500', to: 'to-blue-400',    bg: 'bg-indigo-50' },
}

export default async function DashboardLessonsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('User')
    .select('subscriptionPlan')
    .eq('id', user!.id)
    .single()

  const plan = profile?.subscriptionPlan || 'FREE'
  const isPro = plan === 'PRO' || plan === 'TEAM'

  const { data: lessons } = await supabase
    .from('Lesson')
    .select('id, title, category, difficulty, duration, "isFree", description')
    .eq('"isPublished"', true)
    .order('"createdAt"', { ascending: true })

  const lessonIds = (lessons ?? []).map((l: any) => l.id)
  let progressMap: Record<string, boolean> = {}

  if (lessonIds.length > 0) {
    const { data: progress } = await supabase
      .from('LessonProgress')
      .select('lessonId, "isCompleted"')
      .eq('"userId"', user!.id)
      .in('lessonId', lessonIds)

    for (const p of progress ?? []) {
      progressMap[p.lessonId] = p.isCompleted
    }
  }

  // Group by category
  const grouped: Record<string, any[]> = {}
  for (const lesson of lessons ?? []) {
    if (!grouped[lesson.category]) grouped[lesson.category] = []
    grouped[lesson.category].push(lesson)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Öyrənmə Yolları</h1>
        <p className="text-gray-500 mt-1">
          {isPro ? 'Bütün dərslərə tam girişiniz var' : '3 pulsuz dərsə girişiniz var'}
        </p>
      </div>

      {!isPro && (
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 mb-8 flex items-center gap-4">
          <Lock size={24} className="text-violet-500 shrink-0" />
          <div>
            <p className="font-bold text-violet-900">Pro Plana Keç — Bütün Dərsləri Aç</p>
            <p className="text-violet-700 text-sm">AI tərəfindən yaradılan dərslər + sertifikat + həftəlik yeni məzmun</p>
          </div>
          <Link
            href="/register?plan=pro"
            className="ml-auto bg-violet-600 text-white font-bold text-sm px-5 py-2 rounded-xl hover:bg-violet-700 transition shrink-0"
          >
            14.9 ₼/ay
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(grouped).map(([category, catLessons]) => {
          const completed = catLessons.filter(l => progressMap[l.id] === true).length
          const total = catLessons.length
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0
          const colors = CATEGORY_COLORS[category] ?? { from: 'from-violet-500', to: 'to-blue-400', bg: 'bg-violet-50' }
          const icon = CATEGORY_ICONS[category] || '📚'
          const slug = encodeURIComponent(category)

          return (
            <Link
              key={category}
              href={`/learn/${slug}`}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-violet-200 transition"
            >
              {/* Top gradient bar */}
              <div className={`h-2 bg-gradient-to-r ${colors.from} ${colors.to}`} />

              <div className="p-6">
                {/* Icon + title */}
                <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center text-3xl mb-4`}>
                  {icon}
                </div>
                <h3 className="font-extrabold text-gray-900 text-lg mb-1 group-hover:text-violet-700 transition leading-tight">
                  {category}
                </h3>
                <p className="text-gray-400 text-sm mb-5">{total} dərs</p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>{completed}/{total} tamamlandı</span>
                    <span className="font-bold text-violet-600">{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${colors.from} ${colors.to} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {pct === 100 ? (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      🏆 Tamamlandı
                    </span>
                  ) : pct > 0 ? (
                    <span className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
                      Davam edir...
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                      Başlanmayıb
                    </span>
                  )}
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-violet-500 transition" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {(!lessons || lessons.length === 0) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <BookOpen size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400">Hələ dərs yoxdur. AI motor tezliklə yeni dərslər yaradacaq.</p>
        </div>
      )}
    </div>
  )
}
