import { createServerSupabaseClient } from '@/lib/supabase-server'
import { BookOpen, Users, BarChart3, Zap } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()

  const [
    { count: lessonCount },
    { count: userCount },
    { count: feedbackCount },
    { count: completedCount },
  ] = await Promise.all([
    supabase.from('Lesson').select('*', { count: 'exact', head: true }),
    supabase.from('User').select('*', { count: 'exact', head: true }),
    supabase.from('Feedback').select('*', { count: 'exact', head: true }),
    supabase.from('LessonProgress').select('*', { count: 'exact', head: true }).eq('isCompleted', true),
  ])

  const { data: recentFeedback } = await supabase
    .from('Feedback')
    .select('content, sentiment, createdAt, Lesson(title)')
    .order('createdAt', { ascending: false })
    .limit(5)

  const { data: latestTrend } = await supabase
    .from('AITrendReport')
    .select('reportData, createdAt')
    .order('createdAt', { ascending: false })
    .limit(1)
    .maybeSingle()

  const stats = [
    { label: 'Ümumi Dərslər', value: lessonCount ?? 0, icon: BookOpen, color: 'text-violet-600 bg-violet-50' },
    { label: 'İstifadəçilər', value: userCount ?? 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Geri Bildirimlər', value: feedbackCount ?? 0, icon: BarChart3, color: 'text-green-600 bg-green-50' },
    { label: 'Tamamlanan', value: completedCount ?? 0, icon: Zap, color: 'text-orange-600 bg-orange-50' },
  ]

  const sentimentColor: Record<string, string> = {
    positive: 'bg-green-100 text-green-700',
    neutral:  'bg-gray-100 text-gray-600',
    negative: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Admin İdarə Paneli</h1>
        <p className="text-gray-400 mt-1">BacarIQ platformasının ümumi görünüşü</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map(s => (
          <div key={s.label} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div className="text-3xl font-extrabold text-white">{s.value}</div>
            <div className="text-gray-400 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick actions */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-white font-bold mb-5">Sürətli Əməliyyatlar</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/ai"
              className="flex items-center gap-3 p-4 bg-violet-600/10 border border-violet-600/30 rounded-xl hover:bg-violet-600/20 transition"
            >
              <Zap size={18} className="text-violet-400" />
              <span className="text-violet-300 font-medium text-sm">AI Dərs Yarat</span>
            </Link>
            <Link
              href="/admin/trends"
              className="flex items-center gap-3 p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl hover:bg-blue-600/20 transition"
            >
              <BarChart3 size={18} className="text-blue-400" />
              <span className="text-blue-300 font-medium text-sm">Trend Analizi</span>
            </Link>
            <Link
              href="/admin/lessons"
              className="flex items-center gap-3 p-4 bg-green-600/10 border border-green-600/30 rounded-xl hover:bg-green-600/20 transition"
            >
              <BookOpen size={18} className="text-green-400" />
              <span className="text-green-300 font-medium text-sm">Dərsləri İdarə Et</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-4 bg-orange-600/10 border border-orange-600/30 rounded-xl hover:bg-orange-600/20 transition"
            >
              <Users size={18} className="text-orange-400" />
              <span className="text-orange-300 font-medium text-sm">İstifadəçilər</span>
            </Link>
          </div>
        </div>

        {/* Recent feedback */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold">Son Geri Bildirimlər</h2>
            <Link href="/admin/analytics" className="text-violet-400 text-sm hover:underline">Hamısı →</Link>
          </div>
          {!recentFeedback || recentFeedback.length === 0 ? (
            <p className="text-gray-500 text-sm">Hələ geri bildirim yoxdur.</p>
          ) : (
            <ul className="space-y-3">
              {recentFeedback.map((f: any, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${sentimentColor[f.sentiment] || sentimentColor.neutral}`}>
                    {f.sentiment === 'positive' ? '👍' : f.sentiment === 'negative' ? '👎' : '😐'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-gray-300 text-sm line-clamp-2">{f.content}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{f.Lesson?.title}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Latest AI trend */}
        {latestTrend && (
          <div className="bg-gradient-to-br from-violet-900/40 to-blue-900/40 rounded-2xl border border-violet-700/30 p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-violet-400" />
              <h2 className="text-white font-bold">Son AI Trend Hesabatı</h2>
              <span className="text-gray-500 text-xs ml-auto">
                {new Date(latestTrend.createdAt).toLocaleDateString('az-AZ')}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(latestTrend.reportData?.topSkills ?? []).slice(0, 4).map((skill: any, i: number) => (
                <div key={i} className="bg-gray-900/50 rounded-xl p-3">
                  <p className="text-white font-semibold text-sm">{skill.skill}</p>
                  <p className="text-gray-400 text-xs mt-1">{skill.category}</p>
                  <span className={`text-xs font-bold ${skill.demandLevel === 'yüksək' ? 'text-green-400' : 'text-yellow-400'}`}>
                    ↑ {skill.demandLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
