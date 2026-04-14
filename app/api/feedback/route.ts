import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import cuid from 'cuid'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'İcazəsiz' }, { status: 401 })

    const { lessonId, type, content, sentiment } = await req.json()
    if (!lessonId || !content) {
      return NextResponse.json({ error: 'Dərs ID və məzmun tələb olunur' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('Feedback')
      .insert({
        id: cuid(),
        userId: user.id,
        lessonId,
        type: type || 'text',
        content,
        sentiment: sentiment || 'neutral',
        createdAt: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server xətası' }, { status: 500 })
  }
}
