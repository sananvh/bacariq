import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateAssessmentPlan } from '@/lib/ai'
import { computeScores, getTopDimensions, type DimensionKey } from '@/lib/assessment-questions'
import cuid from 'cuid'

// POST /api/assessment — save results and generate AI plan
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Giriş tələb olunur' }, { status: 401 })

    const { answers } = await req.json() as { answers: Record<number, DimensionKey> }
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Yanlış məlumat' }, { status: 400 })
    }

    const scores = computeScores(answers)
    const { top, bottom } = getTopDimensions(scores)

    // Fetch user name for AI plan
    const { data: profile } = await supabase
      .from('User')
      .select('name, email, subscriptionPlan')
      .eq('id', user.id)
      .single()

    const userName = profile?.name || profile?.email?.split('@')[0] || 'İstifadəçi'
    const isPaid = profile?.subscriptionPlan === 'PRO' || profile?.subscriptionPlan === 'TEAM'

    // Generate AI plan (only for paid users to keep it fast for free)
    let aiPlan = null
    if (isPaid) {
      aiPlan = await generateAssessmentPlan(scores as Record<string, number>, userName)
    }

    const id = cuid()
    const { error } = await supabase.from('AssessmentResult').insert({
      id,
      userId: user.id,
      scores,
      topStrength: top[0],
      topWeakness: bottom[0],
      aiPlan,
    })

    if (error) {
      console.error('Assessment insert error:', error)
      return NextResponse.json({ error: 'Saxlama xətası' }, { status: 500 })
    }

    return NextResponse.json({ id, scores, topStrength: top[0], topWeakness: bottom[0], aiPlan })
  } catch (err) {
    console.error('Assessment error:', err)
    return NextResponse.json({ error: 'Server xətası' }, { status: 500 })
  }
}

// GET /api/assessment — fetch latest assessment for current user
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Giriş tələb olunur' }, { status: 401 })

    const { data } = await supabase
      .from('AssessmentResult')
      .select('*')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle()

    return NextResponse.json({ result: data })
  } catch (err) {
    console.error('Assessment GET error:', err)
    return NextResponse.json({ error: 'Server xətası' }, { status: 500 })
  }
}

// PATCH /api/assessment — generate AI plan for a paid user who just upgraded
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Giriş tələb olunur' }, { status: 401 })

    const { id } = await req.json()

    const { data: result } = await supabase
      .from('AssessmentResult')
      .select('*')
      .eq('id', id)
      .eq('userId', user.id)
      .single()

    if (!result) return NextResponse.json({ error: 'Tapılmadı' }, { status: 404 })
    if (result.aiPlan) return NextResponse.json({ aiPlan: result.aiPlan })

    const { data: profile } = await supabase
      .from('User')
      .select('name, email')
      .eq('id', user.id)
      .single()

    const userName = profile?.name || profile?.email?.split('@')[0] || 'İstifadəçi'
    const aiPlan = await generateAssessmentPlan(result.scores, userName)

    await supabase
      .from('AssessmentResult')
      .update({ aiPlan })
      .eq('id', id)

    return NextResponse.json({ aiPlan })
  } catch (err) {
    console.error('Assessment PATCH error:', err)
    return NextResponse.json({ error: 'Server xətası' }, { status: 500 })
  }
}
