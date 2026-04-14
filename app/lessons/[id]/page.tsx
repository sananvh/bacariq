import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import LessonViewer from '@/components/LessonViewer'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LessonPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lesson } = await supabase
    .from('Lesson')
    .select('*')
    .eq('id', id)
    .single()

  if (!lesson) notFound()

  const { data: profile } = await supabase
    .from('User')
    .select('subscriptionPlan')
    .eq('id', user.id)
    .single()

  const isPro = profile?.subscriptionPlan === 'PRO' || profile?.subscriptionPlan === 'TEAM'
  const canAccess = isPro || lesson.isFree

  if (!canAccess) redirect(`/learn/${encodeURIComponent(lesson.category)}`)

  // Get progress
  const { data: progress } = await supabase
    .from('LessonProgress')
    .select('*')
    .eq('userId', user.id)
    .eq('lessonId', id)
    .maybeSingle()

  // Get existing certificate for this lesson
  const { data: existingCert } = await supabase
    .from('Certificate')
    .select('id')
    .eq('userId', user.id)
    .eq('lessonId', id)
    .maybeSingle()

  // Get next lesson in same category
  const { data: nextLesson } = await supabase
    .from('Lesson')
    .select('id, title')
    .eq('category', lesson.category)
    .eq('isPublished', true)
    .order('createdAt', { ascending: true })
    .limit(100)

  const lessonList = nextLesson ?? []
  const currentIdx = lessonList.findIndex((l: any) => l.id === id)
  const next = lessonList[currentIdx + 1] ?? null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-4">
          <Link
            href={`/learn/${encodeURIComponent(lesson.category)}`}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 truncate">{lesson.category}</p>
            <p className="font-bold text-gray-900 text-sm truncate">{lesson.title}</p>
          </div>
          {progress?.isCompleted && (
            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
              ✓ Tamamlandı
            </span>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Lesson header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-gray-500 leading-relaxed">{lesson.description}</p>
          )}
        </div>

        {/* Lesson viewer (client component) */}
        <LessonViewer
          lessonId={id}
          content={lesson.content}
          format={lesson.format}
          initialProgress={progress?.watchedSeconds ?? 0}
          isCompleted={progress?.isCompleted ?? false}
          nextLesson={next}
          category={lesson.category}
          userId={user.id}
          existingCertId={existingCert?.id ?? null}
        />
      </div>
    </div>
  )
}
