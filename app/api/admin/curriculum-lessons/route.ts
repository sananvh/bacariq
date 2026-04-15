import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const authSupabase = await createServerSupabaseClient()
  const { data: { user } } = await authSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const programId = req.nextUrl.searchParams.get('programId')
  if (!programId) return NextResponse.json({ error: 'programId required' }, { status: 400 })

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: lessons } = await db
    .from('SkillLesson')
    .select('id, order, title, description, difficulty, durationSeconds, adminApproved, adminComment')
    .eq('programId', programId)
    .order('order', { ascending: true })

  return NextResponse.json({ lessons: lessons ?? [] })
}
