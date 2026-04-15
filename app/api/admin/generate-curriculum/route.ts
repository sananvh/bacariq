import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DIMENSIONS, type DimensionKey } from '@/lib/assessment-questions'
import { generateCurriculumOutline, generateSingleLessonContent } from '@/lib/ai'
import cuid from 'cuid'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(req: NextRequest) {
  // Verify session
  const authSupabase = await createServerSupabaseClient()
  const { data: { user } } = await authSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Use service client for all DB ops (bypasses any RLS / key issues)
  const db = serviceClient()

  // Check role via service client
  const { data: profile } = await db.from('User').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { skillKey } = await req.json() as { skillKey: DimensionKey }
  if (!DIMENSIONS[skillKey]) return NextResponse.json({ error: 'Invalid skillKey' }, { status: 400 })

  const dim = DIMENSIONS[skillKey]

  // Check if program already exists
  const { data: existing } = await db
    .from('SkillProgram')
    .select('id, status')
    .eq('userId', user.id)
    .eq('skillKey', skillKey)
    .maybeSingle()

  if (existing?.status === 'generating') {
    return NextResponse.json({ error: 'Already generating' }, { status: 409 })
  }

  // Delete old program+lessons to regenerate
  if (existing) {
    await db.from('SkillLesson').delete().eq('programId', existing.id)
    await db.from('SkillProgram').delete().eq('id', existing.id)
  }

  const programId = cuid()
  await db.from('SkillProgram').insert({
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

  // Fire generation in background (don't await)
  generateInBackground(programId, skillKey, dim.fullLabel, dim.lessonCategory)

  return NextResponse.json({ ok: true, programId })
}

async function generateInBackground(
  programId: string,
  skillKey: string,
  skillLabel: string,
  category: string,
) {
  const db = serviceClient()

  try {
    // Phase 1: lightweight outline
    const outline = await generateCurriculumOutline(skillKey, skillLabel, category)
    if (!outline) throw new Error('No outline returned')

    await db.from('SkillProgram').update({
      programTitle: outline.programTitle,
      programDescription: outline.programDescription,
      totalDurationWeeks: outline.totalDurationWeeks ?? 4,
      examQuestions: outline.finalExamQuestions ?? [],
    }).eq('id', programId)

    // Phase 2: full content for each lesson one by one
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

      await db.from('SkillLesson').insert({
        id: cuid(),
        programId,
        order: meta.order,
        title: meta.title,
        description: meta.description ?? '',
        difficulty: meta.difficulty ?? 'beginner',
        durationSeconds: meta.durationSeconds ?? 900,
        content: content ?? null,
      })

      console.log(`✓ ${skillLabel} — dərs ${meta.order}/${metas.length}`)
    }

    await db.from('SkillProgram').update({ status: 'ready' }).eq('id', programId)
    console.log(`✅ ${skillLabel} hazırdır`)
  } catch (err) {
    console.error('Generation error:', err)
    await db.from('SkillProgram').update({ status: 'error' }).eq('id', programId)
  }
}
