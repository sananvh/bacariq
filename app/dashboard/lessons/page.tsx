import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { BookOpen, Lock, ChevronRight, BarChart3, ArrowRight } from 'lucide-react'
import { DIMENSIONS, type DimensionKey } from '@/lib/assessment-questions'

export default async function DashboardLessonsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: userSkills }, { data: latestAssessment }] = await Promise.all([
    supabase.from('User').select('subscriptionPlan').eq('id', user!.id).single(),
    supabase.from('UserSkill').select('skillKey, skillLabel, skillIcon').eq('userId', user!.id).order('addedAt', { ascending: true }),
    supabase.from('AssessmentResult').select('id').eq('userId', user!.id).order('createdAt', { ascending: false }).limit(1).maybeSingle(),
  ])

  const plan  = profile?.subscriptionPlan || 'FREE'
  const isPro = plan === 'PRO' || plan === 'TEAM'
  const skills = userSkills ?? []

  // No skills yet
  if (skills.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Dərslər</h1>
          <p className="text-gray-500 mt-1">Aktiv bacarıqlarınıza uyğun dərslər</p>
        </div>
        <div className="bg-gradient-to-br from-violet-600 to-blue-600 rounded-3xl p-10 text-white text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-2xl font-extrabold mb-2">Əvvəlcə bacarıq seçin</h2>
          <p className="text-violet-200 mb-6 max-w-md mx-auto">
            Sizə uyğun dərsləri görmək üçün Bacarıq Profil Testini keçin və inkişaf etdirmək
            istədiyiniz bacarığı seçin.
          </p>
          <Link
            href={latestAssessment ? `/assessment/results/${latestAssessment.id}` : '/assessment/test'}
            className="inline-flex items-center gap-2 bg-white text-violet-700 font-extrabold px-8 py-3 rounded-2xl hover:bg-violet-50 transition"
          >
            <BarChart3 size={18} />
            {latestAssessment ? 'Nəticəyə Bax' : 'Testi Keç'}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    )
  }

  // Fetch lessons only for active skill categories
  type SkillSection = {
    skillKey: string
    skillLabel: string
    skillIcon: string
    dim: (typeof DIMENSIONS)[DimensionKey]
    lessons: any[]
    completed: number
    pct: number
  }

  const sections: SkillSection[] = []

  for (const skill of skills) {
    const dim = DIMENSIONS[skill.skillKey as DimensionKey]
    if (!dim) continue

    const { data: lessons } = await supabase
      .from('Lesson')
      .select('id, title, category, difficulty, duration, isFree, description')
      .eq('category', dim.lessonCategory)
      .eq('isPublished', true)
      .order('createdAt', { ascending: true })

    const lessonList = lessons ?? []
    const lessonIds = lessonList.map((l: any) => l.id)

    let completedCount = 0
    if (lessonIds.length > 0) {
      const { count } = await supabase
        .from('LessonProgress')
        .select('*', { count: 'exact', head: true })
        .eq('userId', user!.id)
        .eq('isCompleted', true)
        .in('lessonId', lessonIds)
      completedCount = count ?? 0
    }

    const pct = lessonList.length > 0 ? Math.round((completedCount / lessonList.length) * 100) : 0

    sections.push({
      skillKey:   skill.skillKey,
      skillLabel: skill.skillLabel,
      skillIcon:  skill.skillIcon,
      dim,
      lessons:    lessonList,
      completed:  completedCount,
      pct,
    })
  }

  const difficultyLabel: Record<string, string> = {
    beginner:     'Başlanğıc',
    intermediate: 'Orta',
    advanced:     'İrəliləmiş',
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Dərslər</h1>
          <p className="text-gray-500 mt-1">Aktiv bacarıqlarınıza uyğun dərslər</p>
        </div>
        <Link
          href={latestAssessment ? `/assessment/results/${latestAssessment.id}` : '/assessment/test'}
          className="text-sm text-violet-600 hover:text-violet-800 font-semibold transition"
        >
          + Bacarıq əlavə et
        </Link>
      </div>

      {!isPro && (
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 mb-8 flex items-center gap-4">
          <Lock size={20} className="text-violet-500 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-violet-900 text-sm">Pro Plana Keç — Bütün Dərsləri Aç</p>
            <p className="text-violet-700 text-xs mt-0.5">Sertifikat + AI tövsiyəsi + həftəlik yeni məzmun</p>
          </div>
          <Link
            href="/upgrade"
            className="bg-violet-600 text-white font-bold text-sm px-5 py-2 rounded-xl hover:bg-violet-700 transition shrink-0"
          >
            14.9 ₼/il
          </Link>
        </div>
      )}

      <div className="space-y-8">
        {sections.map(section => (
          <div key={section.skillKey} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Skill header */}
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{ backgroundColor: section.dim.bgColor, borderBottom: `1px solid ${section.dim.borderColor}` }}
            >
              <span className="text-2xl">{section.skillIcon}</span>
              <div className="flex-1 min-w-0">
                <h2 className="font-extrabold text-gray-900">{section.skillLabel}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden max-w-[160px]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${section.pct}%`, backgroundColor: section.dim.color }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-600">
                    {section.completed}/{section.lessons.length} tamamlandı · {section.pct}%
                  </span>
                </div>
              </div>
              <Link
                href={`/learn/${encodeURIComponent(section.dim.lessonCategory)}`}
                className="text-xs font-bold px-3 py-1.5 rounded-xl transition shrink-0"
                style={{ backgroundColor: section.dim.color, color: '#fff' }}
              >
                Hamısı →
              </Link>
            </div>

            {/* Lesson list */}
            {section.lessons.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Bu kateqoriyada hələ dərs yoxdur.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {section.lessons.map((lesson: any) => {
                  const locked = !isPro && !lesson.isFree
                  return (
                    <li key={lesson.id}>
                      {locked ? (
                        <div className="flex items-center gap-4 px-6 py-4 opacity-50 cursor-not-allowed">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gray-100">
                            <Lock size={15} className="text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{lesson.title}</p>
                            <p className="text-gray-400 text-xs mt-0.5">
                              {difficultyLabel[lesson.difficulty] ?? lesson.difficulty} · {Math.round((lesson.duration ?? 900) / 60)} dəq · Pro
                            </p>
                          </div>
                          <Lock size={14} className="text-gray-300 shrink-0" />
                        </div>
                      ) : (
                        <Link
                          href={`/lessons/${lesson.id}`}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition"
                        >
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: section.dim.bgColor }}
                          >
                            <BookOpen size={15} style={{ color: section.dim.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{lesson.title}</p>
                            <p className="text-gray-400 text-xs mt-0.5">
                              {difficultyLabel[lesson.difficulty] ?? lesson.difficulty} · {Math.round((lesson.duration ?? 900) / 60)} dəq
                              {lesson.isFree && <span className="ml-1.5 text-green-600 font-semibold">· Pulsuz</span>}
                            </p>
                          </div>
                          <ChevronRight size={16} className="text-gray-300 shrink-0" />
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
