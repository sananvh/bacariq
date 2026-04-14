import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import cuid from 'cuid'

interface PageProps {
  searchParams: Promise<{ lessonId?: string }>
}

export default async function GenerateCertificatePage({ searchParams }: PageProps) {
  const { lessonId } = await searchParams

  if (!lessonId) redirect('/dashboard/lessons')

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch lesson info
  const { data: lesson } = await supabase
    .from('Lesson')
    .select('id, title, category')
    .eq('id', lessonId)
    .single()

  if (!lesson) redirect('/dashboard/lessons')

  // Check subscription — only PRO/TEAM can get certificates
  const { data: profile } = await supabase
    .from('User')
    .select('subscriptionPlan, name, email')
    .eq('id', user.id)
    .single()

  const isPaid = profile?.subscriptionPlan === 'PRO' || profile?.subscriptionPlan === 'TEAM'
  if (!isPaid) redirect(`/upgrade?reason=certificate&lessonId=${lessonId}`)

  // Check user completed this lesson
  const { data: progress } = await supabase
    .from('LessonProgress')
    .select('isCompleted')
    .eq('userId', user.id)
    .eq('lessonId', lessonId)
    .maybeSingle()

  if (!progress?.isCompleted) redirect(`/lessons/${lessonId}`)

  const userName = profile?.name || profile?.email?.split('@')[0] || 'İstifadəçi'

  // Check if certificate already exists
  const { data: existing } = await supabase
    .from('Certificate')
    .select('id')
    .eq('userId', user.id)
    .eq('lessonId', lessonId)
    .maybeSingle()

  if (existing) redirect(`/certificate/${existing.id}`)

  // Create certificate
  const certId = cuid()
  const { error } = await supabase.from('Certificate').insert({
    id: certId,
    userId: user.id,
    lessonId: lesson.id,
    userName,
    lessonTitle: lesson.title,
    issuedAt: new Date().toISOString(),
  })

  if (error) redirect(`/lessons/${lessonId}`)

  redirect(`/certificate/${certId}`)
}
