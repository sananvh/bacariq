import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import cuid from 'cuid'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş tələb olunur' }, { status: 401 })

  const { programId, answers, score, passed } = await req.json() as {
    programId: string
    answers: number[]
    score: number
    passed: boolean
  }

  if (!programId) return NextResponse.json({ error: 'programId required' }, { status: 400 })

  // Verify program belongs to user
  const { data: program } = await supabase
    .from('SkillProgram')
    .select('id, skillLabel')
    .eq('id', programId)
    .eq('userId', user.id)
    .maybeSingle()

  if (!program) return NextResponse.json({ error: 'Proqram tapılmadı' }, { status: 404 })

  const resultId = cuid()

  const { error } = await supabase
    .from('SkillExamResult')
    .upsert({
      id: resultId,
      userId: user.id,
      programId,
      answers,
      score,
      passed,
      takenAt: new Date().toISOString(),
    }, { onConflict: 'userId,programId', ignoreDuplicates: false })

  if (error) {
    console.error('SkillExamResult upsert error:', error)
    return NextResponse.json({ error: 'Saxlama xətası' }, { status: 500 })
  }

  // If passed, issue a skill certificate
  if (passed) {
    const { data: userProfile } = await supabase
      .from('User')
      .select('name')
      .eq('id', user.id)
      .single()

    await supabase.from('SkillCertificate').upsert({
      id: cuid(),
      userId: user.id,
      programId,
      skillLabel: program.skillLabel,
      userName: userProfile?.name ?? 'İstifadəçi',
      score,
      issuedAt: new Date().toISOString(),
    }, { onConflict: 'userId,programId', ignoreDuplicates: true })
  }

  return NextResponse.json({ ok: true, resultId })
}
