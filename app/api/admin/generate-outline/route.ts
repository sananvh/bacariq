import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DIMENSIONS, type DimensionKey } from '@/lib/assessment-questions'
import { generateCurriculumOutline } from '@/lib/ai'
import cuid from 'cuid'

export const maxDuration = 120

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(req: NextRequest) {
  const authSupabase = await createServerSupabaseClient()
  const { data: { user } } = await authSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = db()
  const { data: profile } = await supabase.from('User').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { skillKey } = await req.json() as { skillKey: DimensionKey }
  if (!DIMENSIONS[skillKey]) return NextResponse.json({ error: 'Invalid skillKey' }, { status: 400 })

  const dim = DIMENSIONS[skillKey]

  // Delete existing program if any
  const { data: existing } = await supabase
    .from('SkillProgram').select('id').eq('userId', user.id).eq('skillKey', skillKey).maybeSingle()
  if (existing) {
    await supabase.from('SkillLesson').delete().eq('programId', existing.id)
    await supabase.from('SkillProgram').delete().eq('id', existing.id)
  }

  // Create placeholder
  const programId = cuid()
  await supabase.from('SkillProgram').insert({
    id: programId,
    userId: user.id,
    skillKey,
    skillLabel: dim.fullLabel,
    skillIcon: dim.icon,
    category: dim.lessonCategory,
    programTitle: `${dim.fullLabel} Proqramı`,
    programDescription: 'Hazırlanır...',
    status: 'generating',
  })

  // Generate outline (titles only — fast)
  const outline = await generateCurriculumOutline(skillKey, dim.fullLabel, dim.lessonCategory)
  if (!outline) {
    await supabase.from('SkillProgram').update({ status: 'error' }).eq('id', programId)
    return NextResponse.json({ error: 'AI outline generation failed' }, { status: 500 })
  }

  // Save outline metadata to program
  await supabase.from('SkillProgram').update({
    programTitle: outline.programTitle,
    programDescription: outline.programDescription,
    totalDurationWeeks: outline.totalDurationWeeks ?? 4,
    examQuestions: outline.finalExamQuestions ?? [],
  }).eq('id', programId)

  return NextResponse.json({
    ok: true,
    programId,
    lessons: (outline.lessons ?? []).slice(0, 12),
  })
}
