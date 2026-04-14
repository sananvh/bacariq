import { createServerSupabaseClient } from '@/lib/supabase-server'
import { BookOpen, CheckCircle, Clock, Zap, BarChart3, ArrowRight, Plus, Lock } from 'lucide-react'
import Link from 'next/link'
import { DIMENSIONS, type DimensionKey } from '@/lib/assessment-questions'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: profile },
    { data: userSkills },
    { data: latestAssessment },
    { data: aiRec },
  ] = await Promise.all([
    supabase.from('User').select('name, subscriptionPlan').eq('id', user!.id).single(),
    supabase.from('UserSkill').select('*').eq('userId', user!.id).order('addedAt', { ascending: true }),
    supabase.from('AssessmentResult').select('id, scores, topStrength').eq('userId', user!.id).order('createdAt', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('AIRecommendation').select('*').eq('userId', user!.id).order('createdAt', { ascending: false }).limit(1).maybeSingle(),
  ])

  const name = profile?.name || user?.email?.split('@')[0] || 'İstifadəçi'
  const isPaid = profile?.subscriptionPlan === 'PRO' || profile?.subscriptionPlan === 'TEAM'
  const skills = userSkills ?? []

  // Stats
  const { count: completedCount } = await supabase
    .from('LessonProgress')
    .select('*', { count: 'exact', head: true })
    .eq('userId', user!.id)
    .eq('isCompleted', true)

  const { data: totalTime } = await supabase
    .from('LessonProgress')
    .select('watchedSeconds')
    .eq('userId', user!.id)

  const totalHours = ((totalTime ?? []).reduce((s: number, p: any) => s + (p.watchedSeconds ?? 0), 0) / 3600).toFixed(1)

  // For each active skill, fetch 2 recommended lessons from that category
  type SkillWithLessons = {
    skillKey: string
    skillLabel: string
    skillIcon: string
    lessons: any[]
    completedInCategory: number
  }

  const skillsWithLessons: SkillWithLessons[] = []
  for (const skill of skills) {
    const dim = DIMENSIONS[skill.skillKey as DimensionKey]
    if (!dim) continue
    const { data: lessons } = await supabase
      .from('Lesson')
      .select('id, title, category, difficulty, duration')
      .eq('category', dim.lessonCategory)
      .eq('isPublished', true)
      .limit(3)

    // Count completions in this category
    const lessonIds = (lessons ?? []).map((l: any) => l.id)
    let completedInCategory = 0
    if (lessonIds.length > 0) {
      const { count } = await supabase
        .from('LessonProgress')
        .select('*', { count: 'exact', head: true })
        .eq('userId', user!.id)
        .eq('isCompleted', true)
        .in('lessonId', lessonIds)
      completedInCategory = count ?? 0
    }

    skillsWithLessons.push({
      skillKey: skill.skillKey,
      skillLabel: skill.skillLabel,
      skillIcon: skill.skillIcon,
      lessons: lessons ?? [],
      completedInCategory,
    })
  }

  const difficultyLabel: Record<string, string> = {
    beginner: 'Başlanğıc',
    intermediate: 'Orta',
    advanced: 'İrəliləmiş',
  }

  const stats = [
    { label: 'Tamamlanan Dərslər', value: completedCount ?? 0, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { label: 'Aktiv Bacarıqlar', value: skills.length, icon: BarChart3, color: 'bg-violet-50 text-violet-600' },
    { label: 'Öyrənmə Saatları', value: totalHours, icon: Clock, color: 'bg-blue-50 text-blue-600' },
  ]

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Xoş gəldin, {name}!</h1>
        <p className="text-gray-500 mt-1">Bacarıq inkişaf paneliniz</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{s.value}</div>
            <div className="text-gray-500 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* No skills yet → assessment CTA */}
      {skills.length === 0 && (
        <div className="bg-gradient-to-br from-violet-600 to-blue-600 rounded-3xl p-8 text-white mb-10 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-2xl font-extrabold mb-2">İnkişaf etdirmək istədiyiniz bacarığı seçin</h2>
          <p className="text-violet-200 mb-6 max-w-md mx-auto">
            Əvvəlcə 5 dəqiqəlik Bacarıq Profil Testini keçin. AI profilinizi analiz edib
            sizə uyğun bacarıqları tövsiyə edəcək.
          </p>
          <Link
            href={latestAssessment ? `/assessment/results/${latestAssessment.id}` : '/assessment/test'}
            className="inline-flex items-center gap-2 bg-white text-violet-700 font-extrabold px-8 py-3 rounded-2xl hover:bg-violet-50 transition"
          >
            <BarChart3 size={18} />
            {latestAssessment ? 'Nəticəyə Bax və Bacarıq Seç' : 'Bacarıq Testini Keç'}
            <ArrowRight size={18} />
          </Link>
        </div>
      )}

      {/* Active skills with lessons */}
      {skillsWithLessons.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-gray-900">Aktiv Bacarıqlarım</h2>
            <Link
              href={latestAssessment ? `/assessment/results/${latestAssessment.id}` : '/assessment/test'}
              className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 font-semibold transition"
            >
              <Plus size={16} /> Bacarıq əlavə et
            </Link>
          </div>

          <div className="space-y-6">
            {skillsWithLessons.map(skill => {
              const dim = DIMENSIONS[skill.skillKey as DimensionKey]
              const totalInCat = skill.lessons.length
              const pct = totalInCat > 0 ? Math.round((skill.completedInCategory / totalInCat) * 100) : 0

              return (
                <div
                  key={skill.skillKey}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Skill header */}
                  <div
                    className="px-6 py-4 flex items-center gap-3"
                    style={{ backgroundColor: dim?.bgColor, borderBottom: `1px solid ${dim?.borderColor}` }}
                  >
                    <span className="text-2xl">{skill.skillIcon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-gray-900">{skill.skillLabel}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden max-w-[140px]">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: dim?.color }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-600">
                          {skill.completedInCategory}/{totalInCat} dərs
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/learn/${encodeURIComponent(dim?.lessonCategory ?? '')}`}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl transition shrink-0"
                      style={{ backgroundColor: dim?.color, color: '#fff' }}
                    >
                      Hamısı →
                    </Link>
                  </div>

                  {/* Lessons */}
                  {skill.lessons.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-gray-400 text-sm">Bu kateqoriyada hələ dərs yoxdur.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-50">
                      {skill.lessons.map((lesson: any) => (
                        <li key={lesson.id}>
                          <Link
                            href={`/lessons/${lesson.id}`}
                            className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition"
                          >
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: dim?.bgColor }}>
                              <BookOpen size={16} style={{ color: dim?.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 text-sm truncate">{lesson.title}</p>
                              <p className="text-gray-400 text-xs mt-0.5">
                                {difficultyLabel[lesson.difficulty] ?? lesson.difficulty} ·{' '}
                                {Math.round((lesson.duration ?? 900) / 60)} dəq
                              </p>
                            </div>
                            <ArrowRight size={16} className="text-gray-300 shrink-0" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add more skills — paid gate */}
          {!isPaid && skills.length >= 1 && (
            <div className="mt-4 flex items-center gap-3 bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-5">
              <Lock size={18} className="text-gray-300 shrink-0" />
              <div className="flex-1">
                <p className="text-gray-600 text-sm font-semibold">Daha çox bacarıq seçmək üçün Pro plan lazımdır</p>
                <p className="text-gray-400 text-xs">Sınırsız bacarıq + 4 həftəlik AI inkişaf planı</p>
              </div>
              <Link
                href="/upgrade"
                className="shrink-0 bg-violet-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-violet-700 transition"
              >
                Yüksəlt
              </Link>
            </div>
          )}
        </div>
      )}

      {/* AI Recommendation */}
      {aiRec && (
        <div className="bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={18} />
            <span className="font-bold text-sm uppercase tracking-wide">AI Tövsiyəsi</span>
          </div>
          <h3 className="font-extrabold text-lg mb-2">{aiRec.lessonTitle}</h3>
          <p className="text-violet-200 text-sm mb-4 leading-relaxed">{aiRec.reasoning}</p>
          <Link
            href={`/lessons/${aiRec.lessonId}`}
            className="inline-block bg-white text-violet-700 font-bold text-sm px-5 py-2 rounded-xl hover:bg-violet-50 transition"
          >
            Dərsə Başla →
          </Link>
        </div>
      )}

      {/* Assessment result link */}
      {latestAssessment && skills.length > 0 && (
        <Link
          href={`/assessment/results/${latestAssessment.id}`}
          className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:border-violet-200 hover:shadow-sm transition"
        >
          <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
            <BarChart3 size={18} className="text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">Bacarıq Profiliniz</p>
            <p className="text-gray-400 text-xs mt-0.5">Radar xəritəsi · Güclü tərəflər · İnkişaf analizi</p>
          </div>
          <ArrowRight size={16} className="text-gray-300 shrink-0" />
        </Link>
      )}
    </div>
  )
}
