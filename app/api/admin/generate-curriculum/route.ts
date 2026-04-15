import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { DIMENSIONS, type DimensionKey } from '@/lib/assessment-questions'
import { generateCurriculumOutline, generateSingleLessonContent } from '@/lib/ai'
import cuid from 'cuid'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('User').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { skillKey } = await req.json() as { skillKey: DimensionKey }
  if (!DIMENSIONS[skillKey]) return NextResponse.json({ error: 'Invalid skillKey' }, { status: 400 })

  const dim = DIMENSIONS[skillKey]

  // Check if a program already exists for this admin user + skill
  const { data: existing } = await supabase
    .from('SkillProgram')
    .select('id, status')
    .eq('userId', user.id)
    .eq('skillKey', skillKey)
    .maybeSingle()

  if (existing?.status === 'generating') {
    return NextResponse.json({ error: 'Already generating' }, { status: 409 })
  }

  // Delete old program+lessons if error/ready (regenerate)
  if (existing) {
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    await serviceClient.from('SkillLesson').delete().eq('programId', existing.id)
    await serviceClient.from('SkillProgram').delete().eq('id', existing.id)
  }

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

  // Fire generation in background
  generateInBackground(programId, skillKey, dim.fullLabel, dim.lessonCategory)

  return NextResponse.json({ ok: true, programId })
}

async function generateInBackground(
  programId: string,
  skillKey: string,
  skillLabel: string,
  category: string,
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  try {
    // Phase 1: outline
    const outline = await generateCurriculumOutline(skillKey, skillLabel, category)
    if (!outline) throw new Error('No outline returned')

    await supabase.from('SkillProgram').update({
      programTitle: outline.programTitle,
      programDescription: outline.programDescription,
      totalDurationWeeks: outline.totalDurationWeeks ?? 4,
      examQuestions: outline.finalExamQuestions ?? [],
    }).eq('id', programId)

    // Phase 2: one lesson at a time
    const metas = (outline.lessons ?? []).slice(0, 12)
    for (const meta of metas) {
      const content = await generateSingleLessonContent({
        title: meta.title,
        description: meta.description ?? '',
        category,
        difficulty: meta.difficulty ?? 'beginner',
        order: meta.order,
        totalLessons: metas.length,
        skillLabel,
      })

      await supabase.from('SkillLesson').insert({
        id: cuid(),
        programId,
        order: meta.order,
        title: meta.title,
        description: meta.description ?? '',
        difficulty: meta.difficulty ?? 'beginner',
        durationSeconds: meta.durationSeconds ?? 900,
        content: content ?? null,
      })

      console.log(`✓ ${skillLabel} — dərs ${meta.order}/${metas.length} tamamlandı`)
    }

    await supabase.from('SkillProgram').update({ status: 'ready' }).eq('id', programId)
    console.log(`✅ ${skillLabel} proqramı hazırdır`)
  } catch (err) {
    console.error('Generation error:', err)
    await supabase.from('SkillProgram').update({ status: 'error' }).eq('id', programId)
  }
}
