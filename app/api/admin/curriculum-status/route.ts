import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('User').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: programs } = await supabase
    .from('SkillProgram')
    .select('id, skillKey, status, programTitle')
    .eq('userId', user.id)
    .order('createdAt', { ascending: true })

  const result = []
  for (const prog of programs ?? []) {
    const { count } = await supabase
      .from('SkillLesson')
      .select('*', { count: 'exact', head: true })
      .eq('programId', prog.id)

    result.push({
      id: prog.id,
      skillKey: prog.skillKey,
      status: prog.status,
      programTitle: prog.programTitle,
      lessonCount: count ?? 0,
    })
  }

  return NextResponse.json({ programs: result })
}
