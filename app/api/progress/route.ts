import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import cuid from 'cuid'
import { calculateStreakStats, getTodayDate } from '@/lib/streak'

async function updateUserStreak(supabase: any, userId: string) {
  const today = getTodayDate()

  // Get or create streak record
  let { data: streak } = await supabase
    .from('UserStreak')
    .select('*')
    .eq('userId', userId)
    .maybeSingle()

  if (!streak) {
    await supabase
      .from('UserStreak')
      .insert({
        id: cuid(),
        userId: userId,
        completedDates: [today],
        currentStreak: 1,
        longestStreak: 1,
        lastCompletedDate: today,
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single()
    return
  }

  // Update existing streak
  const completedDates = Array.isArray(streak.completedDates)
    ? streak.completedDates
    : []

  // Check if today is already completed
  if (completedDates.includes(today)) {
    return
  }

  // Add today to completed dates
  const updatedDates = [...completedDates, today]
  const stats = calculateStreakStats(updatedDates)

  await supabase
    .from('UserStreak')
    .update({
      completedDates: updatedDates,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      lastCompletedDate: today,
      updatedAt: new Date().toISOString(),
    })
    .eq('userId', userId)
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'İcazəsiz' }, { status: 401 })

    const { lessonId, watchedSeconds, isCompleted } = await req.json()
    if (!lessonId) return NextResponse.json({ error: 'Dərs ID tələb olunur' }, { status: 400 })

    const { data: existing } = await supabase
      .from('LessonProgress')
      .select('id')
      .eq('userId', user.id)
      .eq('lessonId', lessonId)
      .single()

    if (existing) {
      const { data, error } = await supabase
        .from('LessonProgress')
        .update({
          watchedSeconds: watchedSeconds ?? 0,
          isCompleted: isCompleted ?? false,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      // Update streak if lesson is marked as completed
      if (isCompleted) {
        await updateUserStreak(supabase, user.id)
      }

      return NextResponse.json(data)
    }

    const { data, error } = await supabase
      .from('LessonProgress')
      .insert({
        id: cuid(),
        userId: user.id,
        lessonId,
        watchedSeconds: watchedSeconds ?? 0,
        isCompleted: isCompleted ?? false,
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Update streak if lesson is marked as completed
    if (isCompleted) {
      await updateUserStreak(supabase, user.id)
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server xətası' }, { status: 500 })
  }
}
