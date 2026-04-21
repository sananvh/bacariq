import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import cuid from 'cuid'
import { calculateStreakStats, getTodayDate } from '@/lib/streak'

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: streak } = await supabase
      .from('UserStreak')
      .select('*')
      .eq('userId', user.id)
      .maybeSingle()

    if (!streak) {
      // Create initial streak record
      const { data: newStreak, error } = await supabase
        .from('UserStreak')
        .insert({
          id: cuid(),
          userId: user.id,
          completedDates: [],
          currentStreak: 0,
          longestStreak: 0,
          lastCompletedDate: null,
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(newStreak)
    }

    return NextResponse.json(streak)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const today = getTodayDate()

    // Get or create streak record
    let { data: streak } = await supabase
      .from('UserStreak')
      .select('*')
      .eq('userId', user.id)
      .maybeSingle()

    if (!streak) {
      const { data: newStreak } = await supabase
        .from('UserStreak')
        .insert({
          id: cuid(),
          userId: user.id,
          completedDates: [today],
          currentStreak: 1,
          longestStreak: 1,
          lastCompletedDate: today,
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single()

      return NextResponse.json(newStreak)
    }

    // Update existing streak
    const completedDates = Array.isArray(streak.completedDates)
      ? streak.completedDates
      : []

    // Check if today is already completed
    if (completedDates.includes(today)) {
      return NextResponse.json(streak)
    }

    // Add today to completed dates
    const updatedDates = [...completedDates, today]
    const stats = calculateStreakStats(updatedDates)

    const { data: updatedStreak, error } = await supabase
      .from('UserStreak')
      .update({
        completedDates: updatedDates,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        lastCompletedDate: today,
        updatedAt: new Date().toISOString(),
      })
      .eq('userId', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(updatedStreak)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
