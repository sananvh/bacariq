import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  // Verify session
  const authSupabase = await createServerSupabaseClient()
  const { data: { user } } = await authSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Use service client for all DB ops
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: profile } = await db.from('User').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: programs } = await db
    .from('SkillProgram')
    .select('id, skillKey, status, programTitle')
    .eq('userId', user.id)
    .order('createdAt', { ascending: true })

  const result = []
  for (const prog of programs ?? []) {
    const { count } = await db
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
