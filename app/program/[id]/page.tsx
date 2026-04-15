import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Lock, Clock, ArrowRight, Trophy, Loader2, Brain } from 'lucide-react'
import { DIMENSIONS, type DimensionKey } from '@/lib/assessment-questions'

interface PageProps {
  params: Promise<{ id: string }>
}

const difficultyLabel: Record<string, string> = {
  beginner: 'Başlanğıc',
  intermediate: 'Orta',
  advanced: 'İrəliləmiş',
}
const difficultyColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
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

  // Get progress
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
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0
  const allDone = total > 0 && completedCount === total

  // Check exam result
  const { data: examResult } = await supabase
    .from('SkillExamResult')
    .select('id, score, passed')
    .eq('userId', user.id)
    .eq('programId', id)
    .maybeSingle()

  const dim = DIMENSIONS[program.skillKey as DimensionKey]

  // Find first incomplete lesson for "continue" button
  const nextLesson = lessonList.find((l: any) => !progressMap[l.id])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard/lessons" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
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

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Program header */}
        <div
          className="rounded-3xl p-8 mb-8 text-white"
          style={{ background: `linear-gradient(135deg, ${dim?.color ?? '#7c3aed'}, #3b82f6)` }}
        >
          <div className="text-4xl mb-3">{program.skillIcon ?? dim?.icon}</div>
          <h1 className="text-2xl font-extrabold mb-2">{program.programTitle}</h1>
          <p className="text-white/80 text-sm mb-6 leading-relaxed">{program.programDescription}</p>

          {/* Progress */}
          <div className="bg-white/20 rounded-2xl p-4">
            <div className="flex justify-between text-sm font-semibold mb-2">
              <span>{completedCount}/{total} dərs tamamlandı</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* Generating state */}
        {program.status === 'generating' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center mb-6">
            <Loader2 size={40} className="text-violet-500 animate-spin mx-auto mb-4" />
            <h2 className="font-extrabold text-gray-900 text-lg mb-2">Proqram hazırlanır...</h2>
            <p className="text-gray-400 text-sm">AI sizin üçün 12 dərslik fərdi proqram yaradır. Bu 1-2 dəqiqə çəkə bilər.</p>
            <p className="text-gray-400 text-xs mt-3">Səhifəni yeniləyin</p>
          </div>
        )}

        {program.status === 'error' && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center mb-6">
            <p className="text-red-700 font-semibold">Proqram yaradılarkən xəta baş verdi.</p>
            <p className="text-red-500 text-sm mt-1">Zəhmət olmasa bir az gözləyib yenidən cəhd edin.</p>
          </div>
        )}

        {/* Continue / Start button */}
        {program.status === 'ready' && !allDone && nextLesson && (
          <Link
            href={`/program/${id}/lesson/${nextLesson.id}`}
            className="flex items-center justify-center gap-2 bg-violet-600 text-white font-extrabold py-4 rounded-2xl hover:bg-violet-700 transition mb-8 text-lg"
          >
            {completedCount === 0 ? 'Proqrama Başla' : 'Davam Et'} <ArrowRight size={20} />
          </Link>
        )}

        {/* All done — show exam CTA */}
        {allDone && !examResult && (
          <Link
            href={`/program/${id}/exam`}
            className="flex items-center justify-center gap-3 bg-amber-400 text-amber-900 font-extrabold py-4 rounded-2xl hover:bg-amber-500 transition mb-8 text-lg"
          >
            <Trophy size={22} /> Yekun İmtahana Gir
          </Link>
        )}

        {/* Exam passed */}
        {examResult?.passed && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8 flex items-center gap-4">
            <Trophy size={28} className="text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="font-extrabold text-green-800">Təbriklər! İmtahanı keçdiniz — {examResult.score}%</p>
              <p className="text-green-600 text-sm">Sertifikatınız hazırdır</p>
            </div>
            <Link
              href={`/certificate/skill/${id}`}
              className="bg-amber-400 text-amber-900 font-bold text-sm px-4 py-2 rounded-xl hover:bg-amber-500 transition shrink-0"
            >
              Sertifikat →
            </Link>
          </div>
        )}

        {/* Exam failed */}
        {examResult && !examResult.passed && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-8 flex items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-red-800">İmtahan: {examResult.score}% — Keçid balı 70%</p>
              <p className="text-red-600 text-sm">Dərsləri təkrarlayın və yenidən cəhd edin</p>
            </div>
            <Link
              href={`/program/${id}/exam`}
              className="bg-red-600 text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-red-700 transition shrink-0"
            >
              Yenidən cəhd et
            </Link>
          </div>
        )}

        {/* Lesson list */}
        {program.status === 'ready' && lessonList.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-extrabold text-gray-900">Dərslər ({total})</h2>
            </div>
            <ul className="divide-y divide-gray-50">
              {lessonList.map((lesson: any, idx: number) => {
                const isDone = progressMap[lesson.id] === true
                const isNext = lesson.id === nextLesson?.id
                const isLocked = !isDone && nextLesson && lessonList.indexOf(lesson) > lessonList.indexOf(nextLesson)

                return (
                  <li key={lesson.id}>
                    {isDone || isNext || !isLocked ? (
                      <Link
                        href={`/program/${id}/lesson/${lesson.id}`}
                        className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition ${isNext ? 'bg-violet-50' : ''}`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm
                          ${isDone ? 'bg-green-100 text-green-600' : isNext ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {isDone ? <CheckCircle size={18} /> : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm truncate ${isDone ? 'text-gray-500' : 'text-gray-900'}`}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColor[lesson.difficulty] ?? 'bg-gray-100 text-gray-500'}`}>
                              {difficultyLabel[lesson.difficulty] ?? lesson.difficulty}
                            </span>
                            <span className="text-gray-400 text-xs flex items-center gap-1">
                              <Clock size={11} /> {Math.round((lesson.durationSeconds ?? 720) / 60)} dəq
                            </span>
                          </div>
                        </div>
                        {isDone
                          ? <CheckCircle size={16} className="text-green-500 shrink-0" />
                          : isNext
                          ? <ArrowRight size={16} className="text-violet-500 shrink-0" />
                          : <ArrowRight size={16} className="text-gray-300 shrink-0" />}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-4 px-6 py-4 opacity-40">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gray-100 text-gray-400 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate text-gray-500">{lesson.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColor[lesson.difficulty] ?? 'bg-gray-100 text-gray-500'}`}>
                              {difficultyLabel[lesson.difficulty] ?? lesson.difficulty}
                            </span>
                          </div>
                        </div>
                        <Lock size={14} className="text-gray-300 shrink-0" />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
