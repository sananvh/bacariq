import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Brain } from 'lucide-react'
import { DIMENSIONS, type DimensionKey } from '@/lib/assessment-questions'
import SkillProgramMap from '@/components/SkillProgramMap'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SkillProgramPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: program } = await supabase
    .from('SkillProgram')
    .select('*')
    .eq('id', id)
    .eq('userId', user.id)
    .single()

  if (!program) notFound()

  const { data: lessons } = await supabase
    .from('SkillLesson')
    .select('id, order, title, description, difficulty, durationSeconds')
    .eq('programId', id)
    .order('order', { ascending: true })

  const lessonList = lessons ?? []
  const lessonIds = lessonList.map((l: any) => l.id)

  const progressMap: Record<string, boolean> = {}
  if (lessonIds.length > 0) {
    const { data: progRows } = await supabase
      .from('SkillLessonProgress')
      .select('lessonId, isCompleted')
      .eq('userId', user.id)
      .in('lessonId', lessonIds)
    for (const p of progRows ?? []) {
      progressMap[p.lessonId] = p.isCompleted
    }
  }

  const completedCount = Object.values(progressMap).filter(Boolean).length
  const total = lessonList.length
  const allDone = total > 0 && completedCount === total

  const { data: examResult } = await supabase
    .from('SkillExamResult')
    .select('score, passed')
    .eq('userId', user.id)
    .eq('programId', id)
    .maybeSingle()

  const dim = DIMENSIONS[program.skillKey as DimensionKey]
  const gradientColor = dim?.color ?? '#7c3aed'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard/lessons" className="text-sm text-gray-500 hover:text-gray-800 transition">
            ← Dərslərə Qayıt
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain size={14} className="text-white" />
            </div>
            <span className="font-extrabold tracking-tight text-sm">Bacar<span className="text-violet-600">IQ</span></span>
          </div>
        </div>
      </div>

      {/* Program hero */}
      <div
        className="py-10 px-6 text-white"
        style={{ background: `linear-gradient(135deg, ${gradientColor}, #3b82f6)` }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-4xl mb-3">{program.skillIcon ?? dim?.icon}</div>
          <h1 className="text-2xl font-extrabold mb-1">{program.programTitle}</h1>
          <p className="text-white/75 text-sm">{program.programDescription}</p>
        </div>
      </div>

      {/* Generating / error state */}
      {program.status === 'generating' && (
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-8 py-6 shadow-sm border border-gray-100">
            <div className="w-6 h-6 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-left">
              <p className="font-extrabold text-gray-900">Proqram hazırlanır...</p>
              <p className="text-gray-400 text-sm">AI 12 dərslik proqram yaradır. 1-2 dəqiqə gözləyin.</p>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-4">Səhifəni yeniləyin</p>
        </div>
      )}

      {program.status === 'error' && (
        <div className="max-w-4xl mx-auto px-6 py-10 text-center">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
            <p className="text-red-700 font-semibold">Proqram yaradılarkən xəta baş verdi.</p>
          </div>
        </div>
      )}

      {/* Journey map */}
      {program.status === 'ready' && (
        <div className="max-w-4xl mx-auto px-6 py-10">
          <SkillProgramMap
            programId={id}
            programTitle={program.programTitle}
            skillLabel={program.skillLabel}
            skillIcon={program.skillIcon ?? dim?.icon ?? '📚'}
            gradientColor={gradientColor}
            lessons={lessonList}
            progressMap={progressMap}
            completedCount={completedCount}
            totalCount={total}
            allDone={allDone}
            examResult={examResult ?? null}
          />
        </div>
      )}
    </div>
  )
}
