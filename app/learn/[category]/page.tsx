import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trophy, Lock, CheckCircle, Play, BookOpen } from 'lucide-react'

interface PageProps {
  params: Promise<{ category: string }>
}

const CATEGORY_COLORS: Record<string, { node: string; nodeDone: string; line: string; bg: string; text: string }> = {
  'Kommunikasiya Bacarıqları': { node: 'bg-blue-200 border-blue-400 text-blue-700',       nodeDone: 'bg-blue-500 border-blue-600 text-white',       line: 'bg-blue-300',   bg: 'bg-blue-50',   text: 'text-blue-700' },
  'Liderlik və Komanda':       { node: 'bg-violet-200 border-violet-400 text-violet-700', nodeDone: 'bg-violet-600 border-violet-700 text-white',   line: 'bg-violet-300', bg: 'bg-violet-50', text: 'text-violet-700' },
  'Düşüncə Sistemi':           { node: 'bg-amber-200 border-amber-400 text-amber-700',   nodeDone: 'bg-amber-500 border-amber-600 text-white',     line: 'bg-amber-300',  bg: 'bg-amber-50',  text: 'text-amber-700' },
  'Danışıqlar və Təsir':       { node: 'bg-green-200 border-green-400 text-green-700',   nodeDone: 'bg-green-500 border-green-600 text-white',     line: 'bg-green-300',  bg: 'bg-green-50',  text: 'text-green-700' },
  'Şəxsi Effektivlik':         { node: 'bg-pink-200 border-pink-400 text-pink-700',      nodeDone: 'bg-pink-500 border-pink-600 text-white',       line: 'bg-pink-300',   bg: 'bg-pink-50',   text: 'text-pink-700' },
  'Karyera İnkişafı':          { node: 'bg-indigo-200 border-indigo-400 text-indigo-700', nodeDone: 'bg-indigo-500 border-indigo-600 text-white', line: 'bg-indigo-300', bg: 'bg-indigo-50', text: 'text-indigo-700' },
}

const DEFAULT_COLOR = { node: 'bg-gray-200 border-gray-400 text-gray-700', nodeDone: 'bg-gray-600 border-gray-700 text-white', line: 'bg-gray-300', bg: 'bg-gray-50', text: 'text-gray-700' }

export default async function LearnCategoryPage({ params }: PageProps) {
  const { category: slug } = await params
  const category = decodeURIComponent(slug)

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('User')
    .select('subscriptionPlan, name')
    .eq('id', user.id)
    .single()

  const isPro = profile?.subscriptionPlan === 'PRO' || profile?.subscriptionPlan === 'TEAM'

  const { data: lessons } = await supabase
    .from('Lesson')
    .select('id, title, description, difficulty, duration, "isFree", "isPublished"')
    .eq('category', category)
    .eq('"isPublished"', true)
    .order('"createdAt"', { ascending: true })

  if (!lessons || lessons.length === 0) notFound()

  const lessonIds = lessons.map((l: any) => l.id)
  const { data: progressRows } = await supabase
    .from('LessonProgress')
    .select('lessonId, "isCompleted", "watchedSeconds"')
    .eq('"userId"', user.id)
    .in('lessonId', lessonIds)

  const progressMap: Record<string, { isCompleted: boolean; watchedSeconds: number }> = {}
  for (const p of progressRows ?? []) {
    progressMap[p.lessonId] = { isCompleted: p.isCompleted, watchedSeconds: p.watchedSeconds }
  }

  const completedCount = lessons.filter((l: any) => progressMap[l.id]?.isCompleted).length
  const totalCount = lessons.length
  const pct = Math.round((completedCount / totalCount) * 100)
  const allDone = completedCount === totalCount

  // Check existing certificate
  const { data: certificate } = await supabase
    .from('Certificate')
    .select('id')
    .eq('"userId"', user.id)
    .eq('category', category)
    .maybeSingle()

  const colors = CATEGORY_COLORS[category] ?? DEFAULT_COLOR

  // Find first incomplete lesson for "continue" button
  const nextLesson = lessons.find((l: any) => !progressMap[l.id]?.isCompleted)

  return (
    <div className={`min-h-screen ${colors.bg}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard/lessons" className="text-gray-400 hover:text-gray-700 transition">
            <ArrowLeft size={22} />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Öyrənmə Yolu</p>
            <h1 className="font-extrabold text-gray-900 truncate">{category}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`font-extrabold text-lg ${colors.text}`}>{pct}%</span>
            <div className="w-24 bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${colors.nodeDone} transition-all`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Certificate card (left side — always visible) */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-10 flex items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${allDone ? 'bg-amber-100' : 'bg-gray-100'}`}>
            <Trophy size={28} className={allDone ? 'text-amber-500' : 'text-gray-300'} />
          </div>
          <div className="flex-1 min-w-0">
            {allDone ? (
              <>
                <p className="font-extrabold text-gray-900">Təbrikolunur! 🎉</p>
                <p className="text-gray-500 text-sm">Bütün dərsləri tamamladınız. Sertifikatınızı alın!</p>
              </>
            ) : (
              <>
                <p className="font-bold text-gray-900">Sertifikatını qazanın</p>
                <p className="text-gray-500 text-sm">
                  {completedCount}/{totalCount} dərs tamamlandı — {totalCount - completedCount} dərs qalır
                </p>
              </>
            )}
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
              <div
                className={`h-1.5 rounded-full ${allDone ? 'bg-amber-400' : colors.nodeDone} transition-all`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          {allDone && (
            <Link
              href={certificate ? `/certificate/${certificate.id}` : `/certificate/generate?category=${encodeURIComponent(category)}`}
              className="shrink-0 bg-amber-400 text-amber-900 font-extrabold text-sm px-4 py-2 rounded-xl hover:bg-amber-500 transition"
            >
              Sertifikat Al
            </Link>
          )}
        </div>

        {/* Visual roadmap */}
        <div className="flex flex-col items-center gap-0">
          {lessons.map((lesson: any, idx: number) => {
            const prog = progressMap[lesson.id]
            const isDone = prog?.isCompleted ?? false
            const isInProgress = !isDone && (prog?.watchedSeconds ?? 0) > 0
            const canAccess = isPro || lesson.isFree
            const isNext = lesson.id === nextLesson?.id
            const mins = Math.round((lesson.duration || 900) / 60)

            // Zigzag positioning
            const isLeft = idx % 4 === 0 || idx % 4 === 3
            const isCenter = idx % 2 === 1

            return (
              <div key={lesson.id} className="w-full flex flex-col items-center">
                {/* Connector line */}
                {idx > 0 && (
                  <div className="flex flex-col items-center py-1">
                    <div className={`w-1 h-8 rounded-full ${isDone ? colors.nodeDone : 'bg-gray-200'}`} />
                  </div>
                )}

                {/* Node row */}
                <div className={`w-full flex ${isCenter ? 'justify-center' : isLeft ? 'justify-start' : 'justify-end'} px-4`}>
                  <div className="relative group">
                    {/* Node button */}
                    <Link
                      href={canAccess ? `/lessons/${lesson.id}` : '/register?plan=pro'}
                      className={`
                        flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all shadow-sm
                        ${isDone
                          ? `${colors.nodeDone} shadow-md scale-[1.02]`
                          : isNext && canAccess
                          ? `${colors.node} border-dashed shadow-lg animate-pulse`
                          : canAccess
                          ? `${colors.node} hover:shadow-md hover:scale-105`
                          : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        }
                        min-w-[240px] max-w-[280px]
                      `}
                    >
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isDone ? 'bg-white/20' : canAccess ? 'bg-white/50' : 'bg-gray-200'
                      }`}>
                        {isDone ? (
                          <CheckCircle size={20} />
                        ) : !canAccess ? (
                          <Lock size={18} />
                        ) : isNext ? (
                          <Play size={20} className="ml-0.5" />
                        ) : (
                          <BookOpen size={18} />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm leading-tight ${isDone ? 'text-white' : ''}`}>
                          {lesson.title}
                        </p>
                        <p className={`text-xs mt-0.5 ${isDone ? 'text-white/70' : 'opacity-60'}`}>
                          {mins} dəq
                          {isInProgress && ' · Davam edir'}
                          {isDone && ' · Tamamlandı'}
                        </p>
                      </div>
                    </Link>

                    {/* Tooltip on hover — description */}
                    {lesson.description && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 shadow-xl">
                        {lesson.description}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Certificate node at the end */}
          <div className="flex flex-col items-center py-1">
            <div className={`w-1 h-8 rounded-full ${allDone ? 'bg-amber-400' : 'bg-gray-200'}`} />
          </div>
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-2 min-w-[240px] max-w-[280px] ${
            allDone
              ? 'bg-amber-400 border-amber-500 text-amber-900 shadow-lg shadow-amber-200'
              : 'bg-gray-100 border-gray-200 text-gray-400'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${allDone ? 'bg-white/30' : 'bg-gray-200'}`}>
              <Trophy size={20} />
            </div>
            <div>
              <p className="font-extrabold text-sm">Sertifikat</p>
              <p className={`text-xs mt-0.5 ${allDone ? 'text-amber-800' : 'opacity-50'}`}>
                {allDone ? 'Sertifikatınız hazırdır!' : 'Bütün dərsləri tamamlayın'}
              </p>
            </div>
            {allDone && (
              <Link
                href={certificate ? `/certificate/${certificate.id}` : `/certificate/generate?category=${encodeURIComponent(category)}`}
                className="ml-auto text-xs font-extrabold underline"
              >
                Al →
              </Link>
            )}
          </div>
        </div>

        {/* Continue button */}
        {nextLesson && (
          <div className="mt-10 text-center">
            <Link
              href={`/lessons/${nextLesson.id}`}
              className={`inline-flex items-center gap-2 font-extrabold px-8 py-4 rounded-2xl text-white shadow-lg transition ${colors.nodeDone} hover:opacity-90`}
            >
              <Play size={18} /> Növbəti Dərsə Davam Et
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
