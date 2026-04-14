import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DIMENSIONS, type DimensionKey } from '@/lib/assessment-questions'
import cuid from 'cuid'

const FREE_SKILL_LIMIT = 1

// GET — fetch current user's selected skills
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

// POST — add a skill
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş tələb olunur' }, { status: 401 })

  const { skillKey, assessmentId } = await req.json() as { skillKey: DimensionKey; assessmentId?: string }

  if (!DIMENSIONS[skillKey]) {
    return NextResponse.json({ error: 'Yanlış bacarıq' }, { status: 400 })
  }

  // Check subscription
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
  const { error } = await supabase.from('UserSkill').upsert({
    id: cuid(),
    userId: user.id,
    skillKey,
    skillLabel: dim.fullLabel,
    skillIcon: dim.icon,
    assessmentId: assessmentId ?? null,
    addedAt: new Date().toISOString(),
  }, { onConflict: 'userId,skillKey', ignoreDuplicates: true })

  if (error) {
    console.error('UserSkill insert error:', error)
    return NextResponse.json({ error: 'Saxlama xətası' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// DELETE — remove a skill
export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş tələb olunur' }, { status: 401 })

  const { skillKey } = await req.json() as { skillKey: string }

  await supabase
    .from('UserSkill')
    .delete()
    .eq('userId', user.id)
    .eq('skillKey', skillKey)

  return NextResponse.json({ ok: true })
}
