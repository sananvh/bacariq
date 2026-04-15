import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import cuid from 'cuid'

export async function POST(req: NextRequest) {
  const authSupabase = await createServerSupabaseClient()
  const { data: { user } } = await authSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: profile } = await db.from('User').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { suggestion } = await req.json()

  // Save as a pending curriculum suggestion
  await db.from('CurriculumSuggestion').upsert({
    id: cuid(),
    skillName: suggestion.skill,
    category: suggestion.category,
    reasoning: suggestion.reasoning,
    suggestedLesson: suggestion.suggestedLesson,
    demandLevel: suggestion.demandLevel,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }, { onConflict: 'skillName', ignoreDuplicates: true })

  return NextResponse.json({ ok: true })
}
