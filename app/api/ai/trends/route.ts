import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getSkillTrends } from '@/lib/ai'
import cuid from 'cuid'

export const maxDuration = 60

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'İcazəsiz' }, { status: 401 })

    const { data: profile } = await supabase.from('User').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Yalnız adminlər' }, { status: 403 })

    const trends = await getSkillTrends()
    if (!trends) return NextResponse.json({ error: 'Trend analizi alına bilmədi' }, { status: 500 })

    // Save trend report
    await supabase.from('AITrendReport').insert({
      id: cuid(),
      reportData: trends,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json(trends)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server xətası' }, { status: 500 })
  }
}
