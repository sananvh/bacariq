import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DIMENSIONS, type DimensionKey } from '@/lib/assessment-questions'
import { generateSkillCurriculum } from '@/lib/ai'
import cuid from 'cuid'

const FREE_SKILL_LIMIT = 1

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş tələb olunur' }, { status: 401 })

  const { data } = await supabase
    .from('UserSkill')
    .select('*')
    .eq('userId', user.id)
    .order('addedAt', { ascending: true })

  return NextResponse.json({ skills: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş tələb olunur' }, { status: 401 })

  const { skillKey, assessmentId } = await req.json() as { skillKey: DimensionKey; assessmentId?: string }

  if (!DIMENSIONS[skillKey]) {
    return NextResponse.json({ error: 'Yanlış bacarıq' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('User')
    .select('subscriptionPlan')
    .eq('id', user.id)
    .single()

  const isPaid = profile?.subscriptionPlan === 'PRO' || profile?.subscriptionPlan === 'TEAM'

  if (!isPaid) {
    const { count } = await supabase
      .from('UserSkill')
      .select('*', { count: 'exact', head: true })
      .eq('userId', user.id)

    if ((count ?? 0) >= FREE_SKILL_LIMIT) {
      return NextResponse.json({ error: 'LIMIT_REACHED', limit: FREE_SKILL_LIMIT }, { status: 403 })
    }
  }

  const dim = DIMENSIONS[skillKey]

  // Upsert the UserSkill
  const { error: skillError } = await supabase.from('UserSkill').upsert({
    id: cuid(),
    userId: user.id,
    skillKey,
    skillLabel: dim.fullLabel,
    skillIcon: dim.icon,
    assessmentId: assessmentId ?? null,
    addedAt: new Date().toISOString(),
  }, { onConflict: 'userId,skillKey', ignoreDuplicates: true })

  if (skillError) {
    console.error('UserSkill insert error:', skillError)
    return NextResponse.json({ error: 'Saxlama xətası' }, { status: 500 })
  }

  // Check if a SkillProgram already exists for this user+skill
  const { data: existing } = await supabase
    .from('SkillProgram')
    .select('id, status')
    .eq('userId', user.id)
    .eq('skillKey', skillKey)
    .maybeSingle()

  if (!existing) {
    // Create a placeholder program immediately
    const programId = cuid()
    await supabase.from('SkillProgram').insert({
      id: programId,
      userId: user.id,
      skillKey,
      skillLabel: dim.fullLabel,
      category: dim.lessonCategory,
      programTitle: `${dim.fullLabel} Proqramı`,
      programDescription: 'Proqram hazırlanır...',
      status: 'generating',
    })

    // Generate curriculum in background (don't await — respond fast)
    generateCurriculumInBackground(programId, skillKey, dim.fullLabel, dim.lessonCategory)
  }

  return NextResponse.json({ ok: true })
}

async function generateCurriculumInBackground(
  programId: string,
  skillKey: string,
  skillLabel: string,
  category: string,
) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const curriculum = await generateSkillCurriculum(skillKey, skillLabel, category)
    if (!curriculum) throw new Error('AI returned null')

    // Update program
    await supabase.from('SkillProgram').update({
      programTitle: curriculum.programTitle,
      programDescription: curriculum.programDescription,
      totalDurationWeeks: curriculum.totalDurationWeeks ?? 4,
      examQuestions: curriculum.finalExamQuestions ?? [],
      status: 'ready',
    }).eq('id', programId)

    // Insert lessons
    const lessons = (curriculum.lessons ?? []).slice(0, 12)
    for (const lesson of lessons) {
      await supabase.from('SkillLesson').insert({
        id: cuid(),
        programId,
        order: lesson.order,
        title: lesson.title,
        description: lesson.description ?? '',
        difficulty: lesson.difficulty ?? 'beginner',
        durationSeconds: lesson.durationSeconds ?? 720,
        content: lesson.content ?? null,
      })
    }
  } catch (err) {
    console.error('Curriculum generation failed:', err)
    // Mark as error so UI can show retry
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    await supabase.from('SkillProgram').update({ status: 'error' }).eq('id', programId)
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş tələb olunur' }, { status: 401 })

  const { skillKey } = await req.json() as { skillKey: string }

  await supabase.from('UserSkill').delete().eq('userId', user.id).eq('skillKey', skillKey)

  return NextResponse.json({ ok: true })
}
