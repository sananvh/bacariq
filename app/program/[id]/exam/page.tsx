import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Brain } from 'lucide-react'
import SkillExamClient from './SkillExamClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SkillExamPage({ params }: PageProps) {
  const { id: programId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: program } = await supabase
    .from('SkillProgram')
    .select('id, programTitle, skillKey, skillLabel, examQuestions')
    .eq('id', programId)
    .eq('userId', user.id)
    .single()

  if (!program) notFound()

  // Check if all lessons are completed
  const { data: lessons } = await supabase
    .from('SkillLesson')
    .select('id')
    .eq('programId', programId)

  const allIds = (lessons ?? []).map((l: any) => l.id)
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

  if (completedCount < allIds.length) {
    redirect(`/program/${programId}`)
  }

  // Check for existing exam result
  const { data: existingResult } = await supabase
    .from('SkillExamResult')
    .select('id, score, passed, answers')
    .eq('userId', user.id)
    .eq('programId', programId)
    .maybeSingle()

  // Get user name
  const { data: userProfile } = await supabase
    .from('User')
    .select('name')
    .eq('id', user.id)
    .single()

  const questions = program.examQuestions ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-4">
          <Link href={`/program/${programId}`} className="text-gray-400 hover:text-gray-700 transition">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 truncate">{program.skillLabel}</p>
            <p className="font-bold text-gray-900 text-sm truncate">Yekun İmtahan</p>
          </div>
          <div className="w-6 h-6 bg-gradient-to-br from-violet-600 to-blue-600 rounded-md flex items-center justify-center">
            <Brain size={12} className="text-white" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <SkillExamClient
          programId={programId}
          programTitle={program.programTitle}
          skillLabel={program.skillLabel}
          questions={questions}
          existingResult={existingResult ?? null}
          userName={userProfile?.name ?? ''}
        />
      </div>
    </div>
  )
}
