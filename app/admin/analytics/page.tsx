import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Users, BookOpen, CheckCircle, MessageSquare, TrendingUp, Crown } from 'lucide-react'

export default async function AdminAnalyticsPage() {
  const supabase = await createServerSupabaseClient()

  const [
    { count: totalUsers },
    { count: proUsers },
    { count: teamUsers },
    { count: totalLessons },
    { count: publishedLessons },
    { count: completions },
    { count: totalFeedback },
    { count: positiveFeedback },
    { count: negativeFeedback },
  ] = await Promise.all([
    supabase.from('User').select('*', { count: 'exact', head: true }),
    supabase.from('User').select('*', { count: 'exact', head: true }).eq('subscriptionPlan', 'PRO'),
    supabase.from('User').select('*', { count: 'exact', head: true }).eq('subscriptionPlan', 'TEAM'),
    supabase.from('Lesson').select('*', { count: 'exact', head: true }),
    supabase.from('Lesson').select('*', { count: 'exact', head: true }).eq('isPublished', true),
    supabase.from('LessonProgress').select('*', { count: 'exact', head: true }).eq('isCompleted', true),
    supabase.from('Feedback').select('*', { count: 'exact', head: true }),
    supabase.from('Feedback').select('*', { count: 'exact', head: true }).eq('sentiment', 'positive'),
    supabase.from('Feedback').select('*', { count: 'exact', head: true }).eq('sentiment', 'negative'),
  ])

  // Most completed lessons
  const { data: topLessons } = await supabase
    .from('LessonProgress')
    .select('lessonId, Lesson(title, category)')
    .eq('isCompleted', true)
    .limit(200)

  const lessonCompletionMap: Record<string, { title: string; category: string; count: number }> = {}
  for (const p of topLessons ?? []) {
    const l = (p as any).Lesson
    if (!l) continue
    if (!lessonCompletionMap[p.lessonId]) {
      lessonCompletionMap[p.lessonId] = { title: l.title, category: l.category, count: 0 }
    }
    lessonCompletionMap[p.lessonId].count++
  }
  const rankedLessons = Object.values(lessonCompletionMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Recent registrations
  const { data: recentUsers } = await supabase
    .from('User')
    .select('name, email, subscriptionPlan, createdAt')
    .order('createdAt', { ascending: false })
    .limit(10)

  const freeUsers  = (totalUsers ?? 0) - (proUsers ?? 0) - (teamUsers ?? 0)
  const paidUsers  = (proUsers ?? 0) + (teamUsers ?? 0)
  const convRate   = totalUsers ? ((paidUsers / (totalUsers || 1)) * 100).toFixed(1) : '0'
  const neutralFb  = (totalFeedback ?? 0) - (positiveFeedback ?? 0) - (negativeFeedback ?? 0)
  const satisfactionRate = totalFeedback
    ? (((positiveFeedback ?? 0) / (totalFeedback || 1)) * 100).toFixed(1)
    : '0'

  const PLAN_BADGE: Record<string, string> = {
    FREE: 'bg-gray-700 text-gray-300',
    PRO:  'bg-violet-700 text-violet-200',
    TEAM: 'bg-blue-700 text-blue-200',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Analitika</h1>
        <p className="text-gray-400 mt-1">Platforma fəaliyyətinin ətraflı göstəriciləri</p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Ümumi İstifadəçi', value: totalUsers ?? 0, icon: Users, color: 'text-blue-400 bg-blue-900/40' },
          { label: 'Ödənişli Üzv', value: paidUsers, icon: Crown, color: 'text-violet-400 bg-violet-900/40', sub: `${convRate}% çevrilmə` },
          { label: 'Tamamlanan Dərslər', value: completions ?? 0, icon: CheckCircle, color: 'text-green-400 bg-green-900/40' },
          { label: 'Geri Bildirimlər', value: totalFeedback ?? 0, icon: MessageSquare, color: 'text-orange-400 bg-orange-900/40', sub: `${satisfactionRate}% müsbət` },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div className="text-3xl font-extrabold text-white">{s.value}</div>
            <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            {s.sub && <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Subscription breakdown */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-white font-bold mb-5 flex items-center gap-2">
            <Crown size={18} className="text-violet-400" /> Abunəlik Bölgüsü
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Pulsuz', count: freeUsers, color: 'bg-gray-600', total: totalUsers ?? 1 },
              { label: 'Pro', count: proUsers ?? 0, color: 'bg-violet-600', total: totalUsers ?? 1 },
              { label: 'Komanda', count: teamUsers ?? 0, color: 'bg-blue-600', total: totalUsers ?? 1 },
            ].map(row => {
              const pct = totalUsers ? Math.round((row.count / (totalUsers || 1)) * 100) : 0
              return (
                <div key={row.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{row.label}</span>
                    <span className="text-gray-400">{row.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full">
                    <div className={`h-2 rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Feedback sentiment */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-white font-bold mb-5 flex items-center gap-2">
            <MessageSquare size={18} className="text-orange-400" /> Geri Bildirim Sentiment
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Müsbət', count: positiveFeedback ?? 0, color: 'bg-green-500', emoji: '👍' },
              { label: 'Neytral', count: neutralFb, color: 'bg-gray-500', emoji: '😐' },
              { label: 'Mənfi', count: negativeFeedback ?? 0, color: 'bg-red-500', emoji: '👎' },
            ].map(row => {
              const pct = totalFeedback ? Math.round((row.count / (totalFeedback || 1)) * 100) : 0
              return (
                <div key={row.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{row.emoji} {row.label}</span>
                    <span className="text-gray-400">{row.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full">
                    <div className={`h-2 rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Lesson stats */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-white font-bold mb-5 flex items-center gap-2">
            <BookOpen size={18} className="text-green-400" /> Dərs Statistikası
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Ümumi Dərslər', value: totalLessons ?? 0 },
              { label: 'Dərc Edilmiş', value: publishedLessons ?? 0 },
              { label: 'Qaralama', value: (totalLessons ?? 0) - (publishedLessons ?? 0) },
              { label: 'Ümumi Tamamlama', value: completions ?? 0 },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                <span className="text-gray-400 text-sm">{row.label}</span>
                <span className="text-white font-bold">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top completed lessons */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-white font-bold mb-5 flex items-center gap-2">
            <TrendingUp size={18} className="text-violet-400" /> Ən Çox Tamamlanan Dərslər
          </h2>
          {rankedLessons.length === 0 ? (
            <p className="text-gray-500 text-sm">Hələ tamamlama yoxdur.</p>
          ) : (
            <ul className="space-y-3">
              {rankedLessons.map((l, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-gray-800 text-gray-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-200 text-sm font-medium truncate">{l.title}</p>
                    <p className="text-gray-500 text-xs">{l.category}</p>
                  </div>
                  <span className="text-violet-400 font-bold text-sm shrink-0">{l.count}×</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent registrations */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-white font-bold mb-5 flex items-center gap-2">
            <Users size={18} className="text-blue-400" /> Son Qeydiyyatlar
          </h2>
          {!recentUsers || recentUsers.length === 0 ? (
            <p className="text-gray-500 text-sm">İstifadəçi yoxdur.</p>
          ) : (
            <ul className="space-y-3">
              {recentUsers.map((u: any, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-800 text-violet-200 text-xs font-bold flex items-center justify-center shrink-0">
                    {(u.name || u.email || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-200 text-sm font-medium truncate">{u.name || u.email}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('az-AZ')}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${PLAN_BADGE[u.subscriptionPlan] ?? PLAN_BADGE.FREE}`}>
                    {u.subscriptionPlan === 'FREE' ? 'Pulsuz' : u.subscriptionPlan === 'TEAM' ? 'Komanda' : 'Pro'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
