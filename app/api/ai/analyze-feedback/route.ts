import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { analyzeFeedback } from '@/lib/ai'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'İcazəsiz' }, { status: 401 })

    const { data: profile } = await supabase.from('User').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Yalnız adminlər' }, { status: 403 })

    const { lessonId, days = 30 } = await req.json()

    const since = new Date()
    since.setDate(since.getDate() - days)

    let query = supabase
      .from('Feedback')
      .select('content, type, sentiment')
      .gte('createdAt', since.toISOString())

    if (lessonId) query = query.eq('lessonId', lessonId)

    const { data: feedbacks } = await query

    if (!feedbacks || feedbacks.length === 0) {
      return NextResponse.json({ message: 'Bu dövr üçün geri bildirim yoxdur', count: 0 })
    }

    const analysis = await analyzeFeedback(feedbacks)
    if (!analysis) return NextResponse.json({ error: 'Analiz alına bilmədi' }, { status: 500 })

    return NextResponse.json(analysis)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server xətası' }, { status: 500 })
  }
}
