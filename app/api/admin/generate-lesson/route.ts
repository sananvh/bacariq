import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateSingleLessonContent } from '@/lib/ai'
import cuid from 'cuid'

export const maxDuration = 300

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(req: NextRequest) {
  try {
    const authSupabase = await createServerSupabaseClient()
    const { data: { user } } = await authSupabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { programId, lesson, skillLabel, category, totalLessons } = await req.json()

    const supabase = db()

    const content = await generateSingleLessonContent({
      title: lesson.title,
      description: lesson.description ?? '',
      category,
      difficulty: lesson.difficulty ?? 'beginner',
      order: lesson.order,
      totalLessons,
      skillLabel,
    })

    if (!content) {
      // Insert lesson without content rather than failing hard
      await supabase.from('SkillLesson').insert({
        id: cuid(),
        programId,
        order: lesson.order,
        title: lesson.title,
        description: lesson.description ?? '',
        difficulty: lesson.difficulty ?? 'beginner',
        durationSeconds: lesson.durationSeconds ?? 900,
        content: null,
      })
      return NextResponse.json({ ok: true, order: lesson.order, warning: 'content empty' })
    }

    await supabase.from('SkillLesson').insert({
      id: cuid(),
      programId,
      order: lesson.order,
      title: lesson.title,
      description: lesson.description ?? '',
      difficulty: lesson.difficulty ?? 'beginner',
      durationSeconds: lesson.durationSeconds ?? 900,
      content,
    })

    return NextResponse.json({ ok: true, order: lesson.order })
  } catch (err: any) {
    console.error('generate-lesson error:', err)
    let msg = err?.message ?? 'Server error'
    try {
      const jsonStart = msg.indexOf('{')
      if (jsonStart !== -1) {
        const parsed = JSON.parse(msg.slice(jsonStart))
        msg = parsed?.error?.message ?? msg
      }
    } catch {}
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
