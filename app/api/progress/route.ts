import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import cuid from 'cuid'

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
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server xətası' }, { status: 500 })
  }
}
