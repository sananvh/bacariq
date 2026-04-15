import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getSkillTrends } from '@/lib/ai'
import cuid from 'cuid'

export const maxDuration = 300

export async function GET() {
  try {
    // Verify session
    const authSupabase = await createServerSupabaseClient()
    const { data: { user } } = await authSupabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'İcazəsiz' }, { status: 401 })

    // Use service client for DB ops
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data: profile } = await db.from('User').select('role').eq('id', user.id).single()
    if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Yalnız adminlər' }, { status: 403 })

    const trends = await getSkillTrends()
    if (!trends) return NextResponse.json({ error: 'AI cavab vermədi' }, { status: 500 })

    // Save trend report
    await db.from('AITrendReport').insert({
      id: cuid(),
      reportData: trends,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json(trends)
  } catch (err: any) {
    console.error('Trends error:', err)
    return NextResponse.json({ error: err.message || 'Server xətası' }, { status: 500 })
  }
}
