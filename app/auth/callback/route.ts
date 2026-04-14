import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code     = searchParams.get('code')
  const returnTo = searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Upsert user profile — handles both new Google users and existing ones
      const name =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        data.user.email?.split('@')[0] ||
        'İstifadəçi'

      await supabase.from('User').upsert({
        id:                 data.user.id,
        email:              data.user.email ?? '',
        name,
        role:               'STUDENT',
        subscriptionPlan:   'FREE',
        subscriptionStatus: 'ACTIVE',
        createdAt:          new Date().toISOString(),
      }, { onConflict: 'id', ignoreDuplicates: true })

      return NextResponse.redirect(`${origin}${returnTo}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`)
}
