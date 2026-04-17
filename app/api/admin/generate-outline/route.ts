import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DIMENSIONS, type DimensionKey } from '@/lib/assessment-questions'
import { generateCurriculumOutline } from '@/lib/ai'
import cuid from 'cuid'

export const maxDuration = 300

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(req: NextRequest) {
  try {
    const authSupabase = await createServerSupabaseClient()
    const { data: { user } } = await authSupabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = db()
    const { data: profile } = await supabase.from('User').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set in environment variables' }, { status: 500 })
    }

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

    // Generate outline
    const outline = await generateCurriculumOutline(skillKey, dim.fullLabel, dim.lessonCategory)
    if (!outline) {
      await supabase.from('SkillProgram').update({ status: 'error' }).eq('id', programId)
      return NextResponse.json({ error: 'AI outline generation returned empty — try again' }, { status: 500 })
    }

    const lessons = (outline.lessons ?? []).slice(0, 12)
    if (lessons.length === 0) {
      await supabase.from('SkillProgram').update({ status: 'error' }).eq('id', programId)
      return NextResponse.json({ error: 'AI returned 0 lessons in outline' }, { status: 500 })
    }

    // Save outline metadata
    await supabase.from('SkillProgram').update({
      programTitle: outline.programTitle ?? `${dim.fullLabel} Proqramı`,
      programDescription: outline.programDescription ?? '',
      totalDurationWeeks: outline.totalDurationWeeks ?? 4,
      examQuestions: outline.finalExamQuestions ?? [],
    }).eq('id', programId)

    return NextResponse.json({ ok: true, programId, lessons })
  } catch (err: any) {
    console.error('generate-outline error:', err)
    // Extract clean message from Anthropic SDK errors (which embed JSON in the message string)
    let msg = err?.message ?? 'Server error'
    try {
      // Anthropic SDK throws errors like: "400 {\"type\":\"error\",...}"
      const jsonStart = msg.indexOf('{')
      if (jsonStart !== -1) {
        const parsed = JSON.parse(msg.slice(jsonStart))
        msg = parsed?.error?.message ?? msg
      }
    } catch {}
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
