import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateLesson } from '@/lib/ai'
import cuid from 'cuid'

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'İcazəsiz' }, { status: 401 })

    const { data: profile } = await supabase.from('User').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Yalnız adminlər' }, { status: 403 })

    const body = await req.json()
    const { title, category, format, difficulty, targetMinutes } = body

    if (!title || !category) {
      return NextResponse.json({ error: 'Başlıq və kateqoriya tələb olunur' }, { status: 400 })
    }

    const lesson = await generateLesson({ title, category, format: format || 'both', difficulty: difficulty || 'beginner', targetMinutes })

    if (!lesson) {
      return NextResponse.json({ error: 'AI dərs yarada bilmədi' }, { status: 500 })
    }

    // Save to DB
    const { data: saved, error } = await supabase
      .from('Lesson')
      .insert({
        id: cuid(),
        title: lesson.title,
        description: lesson.description,
        category,
        difficulty: difficulty || 'beginner',
        format: format || 'both',
        duration: (targetMinutes || 15) * 60,
        isFree: false,
        isPublished: false,
        aiGenerated: true,
        content: lesson,
        tags: lesson.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ lesson: saved, aiContent: lesson })
  } catch (err: any) {
    console.error('AI generate error:', err)
    return NextResponse.json({ error: err.message || 'Server xətası' }, { status: 500 })
  }
}
