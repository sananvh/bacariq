import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Brain } from 'lucide-react'
import SkillLessonViewer from '@/components/SkillLessonViewer'

interface PageProps {
  params: Promise<{ id: string; lessonId: string }>
}

export default async function SkillLessonPage({ params }: PageProps) {
  const { id: programId, lessonId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lesson } = await supabase
    .from('SkillLesson')
    .select('*')
    .eq('id', lessonId)
    .eq('programId', programId)
    .single()

  if (!lesson) notFound()

  const { data: program } = await supabase
    .from('SkillProgram')
    .select('id, skillKey, programTitle, skillLabel')
    .eq('id', programId)
    .eq('userId', user.id)
    .single()

  if (!program) notFound()

  // Get progress for this lesson
  const { data: progress } = await supabase
    .from('SkillLessonProgress')
    .select('isCompleted')
    .eq('userId', user.id)
    .eq('lessonId', lessonId)
    .maybeSingle()

  // Get next lesson
  const { data: nextLesson } = await supabase
    .from('SkillLesson')
    .select('id, title')
    .eq('programId', programId)
    .eq('order', lesson.order + 1)
    .maybeSingle()

  // Get total and completed count for progress bar
  const { count: totalCount } = await supabase
    .from('SkillLesson')
    .select('*', { count: 'exact', head: true })
    .eq('programId', programId)

  const lessonIds = await supabase
    .from('SkillLesson')
    .select('id')
    .eq('programId', programId)

  const allIds = (lessonIds.data ?? []).map((l: any) => l.id)
  let completedCount = 0
  if (allIds.length > 0) {
    const { count } = await supabase
      .from('SkillLessonProgress')
      .select('*', { count: 'exact', head: true })
      .eq('userId', user.id)
      .eq('isCompleted', true)
      .in('lessonId', allIds)
    completedCount = count ?? 0
  }

  const pct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-4">
          <Link href={`/program/${programId}`} className="text-gray-400 hover:text-gray-700 transition">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 truncate">{program.skillLabel} · Dərs {lesson.order}/{totalCount}</p>
            <p className="font-bold text-gray-900 text-sm truncate">{lesson.title}</p>
          </div>
          {/* Progress bar */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-400">{pct}%</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-6 h-6 bg-gradient-to-br from-violet-600 to-blue-600 rounded-md flex items-center justify-center">
              <Brain size={12} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-gray-500 leading-relaxed mb-8">{lesson.description}</p>
        )}

        <SkillLessonViewer
          lessonId={lessonId}
          programId={programId}
          content={lesson.content}
          isCompleted={progress?.isCompleted ?? false}
          nextLesson={nextLesson ?? null}
          allDone={completedCount + (progress?.isCompleted ? 0 : 1) >= (totalCount ?? 0)}
        />
      </div>
    </div>
  )
}
