import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { BookOpen, Lock, ArrowRight, BarChart3, Loader2, Trophy } from 'lucide-react'
import { DIMENSIONS, type DimensionKey } from '@/lib/assessment-questions'

type SkillSection = {
  skillKey: string
  skillLabel: string
  skillIcon: string
  dim: (typeof DIMENSIONS)[DimensionKey]
  programId: string | null
  programStatus: string | null
  completed: number
  total: number
  pct: number
}

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

  // Fetch SkillPrograms for the user
  const { data: programs } = await supabase
    .from('SkillProgram')
    .select('id, skillKey, status')
    .eq('userId', user!.id)

  const programBySkill: Record<string, { id: string; status: string }> = {}
  for (const p of programs ?? []) {
    programBySkill[p.skillKey] = { id: p.id, status: p.status }
  }

  const sections: SkillSection[] = []

  for (const skill of skills) {
    const dim = DIMENSIONS[skill.skillKey as DimensionKey]
    if (!dim) continue

    const prog = programBySkill[skill.skillKey] ?? null

    let completedCount = 0
    let totalCount = 0

    if (prog && prog.status === 'ready') {
      const { count: tc } = await supabase
        .from('SkillLesson')
        .select('*', { count: 'exact', head: true })
        .eq('programId', prog.id)
      totalCount = tc ?? 0

      if (totalCount > 0) {
        const { data: lessonRows } = await supabase
          .from('SkillLesson')
          .select('id')
          .eq('programId', prog.id)
        const ids = (lessonRows ?? []).map((l: any) => l.id)
        if (ids.length > 0) {
          const { count: cc } = await supabase
            .from('SkillLessonProgress')
            .select('*', { count: 'exact', head: true })
            .eq('userId', user!.id)
            .eq('isCompleted', true)
            .in('lessonId', ids)
          completedCount = cc ?? 0
        }
      }
    }

    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    sections.push({
      skillKey:      skill.skillKey,
      skillLabel:    skill.skillLabel,
      skillIcon:     skill.skillIcon,
      dim,
      programId:     prog?.id ?? null,
      programStatus: prog?.status ?? null,
      completed:     completedCount,
      total:         totalCount,
      pct,
    })
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Dərslər</h1>
          <p className="text-gray-500 mt-1">Aktiv bacarıqlarınıza uyğun proqramlar</p>
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
            <p className="font-bold text-violet-900 text-sm">Pro Plana Keç — Bütün Bacarıqları Aç</p>
            <p className="text-violet-700 text-xs mt-0.5">Sertifikat + AI tərəfindən hazırlanmış proqram + həftəlik yeni məzmun</p>
          </div>
          <Link
            href="/upgrade"
            className="bg-violet-600 text-white font-bold text-sm px-5 py-2 rounded-xl hover:bg-violet-700 transition shrink-0"
          >
            14.9 ₼/il
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {sections.map(section => (
          <div key={section.skillKey} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div
              className="px-6 py-5 flex items-center gap-4"
              style={{ backgroundColor: section.dim.bgColor, borderBottom: `1px solid ${section.dim.borderColor}` }}
            >
              <span className="text-3xl">{section.skillIcon}</span>
              <div className="flex-1 min-w-0">
                <h2 className="font-extrabold text-gray-900">{section.skillLabel}</h2>

                {section.programStatus === 'generating' && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Loader2 size={12} className="animate-spin" /> Proqram hazırlanır...
                  </p>
                )}
                {section.programStatus === 'error' && (
                  <p className="text-xs text-red-500 mt-1">Xəta baş verdi — yenidən cəhd edin</p>
                )}
                {section.programStatus === 'ready' && (
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden max-w-[160px]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${section.pct}%`, backgroundColor: section.dim.color }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">
                      {section.completed}/{section.total} dərs · {section.pct}%
                    </span>
                  </div>
                )}
                {!section.programId && (
                  <p className="text-xs text-gray-400 mt-1">Proqram hələ başladılmayıb</p>
                )}
              </div>

              {section.programId && section.programStatus === 'ready' && (
                <Link
                  href={`/program/${section.programId}`}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition shrink-0"
                  style={{ backgroundColor: section.dim.color, color: '#fff' }}
                >
                  {section.pct === 100 ? <><Trophy size={13} /> Bitir</> : section.completed > 0 ? 'Davam et →' : 'Başla →'}
                </Link>
              )}
              {section.programId && section.programStatus === 'generating' && (
                <span className="text-xs text-gray-400 shrink-0">Gözləyin...</span>
              )}
              {!section.programId && (
                <span className="text-xs text-gray-300 shrink-0">
                  <BookOpen size={16} />
                </span>
              )}
            </div>

            {/* Progress details row when ready */}
            {section.programStatus === 'ready' && section.programId && (
              <div className="px-6 py-3 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {section.total} dərs · AI tərəfindən hazırlanmış proqram
                </p>
                <Link
                  href={`/program/${section.programId}`}
                  className="text-xs text-violet-600 hover:underline font-semibold"
                >
                  Proqrama Bax →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
