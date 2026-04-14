import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'İcazəsiz' }, { status: 401 })

    const { data: profile } = await supabase.from('User').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Yalnız adminlər' }, { status: 403 })

    const { data: lesson, error } = await supabase
      .from('Lesson')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !lesson) return NextResponse.json({ error: 'Dərs tapılmadı' }, { status: 404 })

    // Fetch feedback for this lesson
    const { data: feedback } = await supabase
      .from('Feedback')
      .select('id, content, type, sentiment, createdAt, User(name, email)')
      .eq('lessonId', id)
      .order('createdAt', { ascending: false })

    return NextResponse.json({ lesson, feedback: feedback ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'İcazəsiz' }, { status: 401 })

    const { data: profile } = await supabase.from('User').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Yalnız adminlər' }, { status: 403 })

    const body = await req.json()
    const allowed = ['title', 'description', 'category', 'difficulty', 'format', 'duration', 'isFree', 'isPublished', 'tags']
    const updates: Record<string, any> = { updatedAt: new Date().toISOString() }
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    const { data, error } = await supabase
      .from('Lesson')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
