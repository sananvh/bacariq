import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getPersonalizedPath } from '@/lib/ai'
import cuid from 'cuid'

export const maxDuration = 60

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'İcazəsiz' }, { status: 401 })

    const { data: profile } = await supabase
      .from('User')
      .select('subscriptionPlan')
      .eq('id', user.id)
      .single()

    // Fetch completed lessons
    const { data: completedProgress } = await supabase
      .from('LessonProgress')
      .select('Lesson(title, category)')
      .eq('userId', user.id)
      .eq('isCompleted', true)

    const completedLessons = (completedProgress ?? []).map((p: any) => p.Lesson?.title).filter(Boolean)
    const categories = [...new Set((completedProgress ?? []).map((p: any) => p.Lesson?.category).filter(Boolean))] as string[]

    const result = await getPersonalizedPath({
      completedLessons,
      categories: categories.length > 0 ? categories : ['Kommunikasiya', 'Liderlik'],
      level: profile?.subscriptionPlan === 'FREE' ? 'başlanğıc' : 'orta',
    })

    if (!result) return NextResponse.json({ error: 'Tövsiyə yaradıla bilmədi' }, { status: 500 })

    // Try to match recommended lessons to real lesson IDs
    const enriched = await Promise.all(
      (result.nextLessons ?? []).slice(0, 3).map(async (rec: any) => {
        const { data: match } = await supabase
          .from('Lesson')
          .select('id, title')
          .ilike('title', `%${rec.title.split(' ')[0]}%`)
          .eq('isPublished', true)
          .limit(1)
          .maybeSingle()

        return { ...rec, lessonId: match?.id || null }
      })
    )

    // Save first recommendation
    const firstRec = enriched.find(r => r.lessonId)
    if (firstRec) {
      await supabase.from('AIRecommendation').upsert({
        id: cuid(),
        userId: user.id,
        lessonId: firstRec.lessonId,
        lessonTitle: firstRec.title,
        reasoning: firstRec.reasoning,
        createdAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({ ...result, nextLessons: enriched })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server xətası' }, { status: 500 })
  }
}
