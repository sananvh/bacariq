import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import cuid from 'cuid'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş tələb olunur' }, { status: 401 })

  const { lessonId, programId } = await req.json() as { lessonId: string; programId: string }

  if (!lessonId || !programId) {
    return NextResponse.json({ error: 'lessonId and programId required' }, { status: 400 })
  }

  // Verify this lesson belongs to a program owned by this user
  const { data: program } = await supabase
    .from('SkillProgram')
    .select('id')
    .eq('id', programId)
    .eq('userId', user.id)
    .maybeSingle()

  if (!program) {
    return NextResponse.json({ error: 'Proqram tapılmadı' }, { status: 404 })
  }

  const { error } = await supabase
    .from('SkillLessonProgress')
    .upsert({
      id: cuid(),
      userId: user.id,
      lessonId,
      programId,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    }, { onConflict: 'userId,lessonId', ignoreDuplicates: false })

  if (error) {
    console.error('SkillLessonProgress upsert error:', error)
    return NextResponse.json({ error: 'Saxlama xətası' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
