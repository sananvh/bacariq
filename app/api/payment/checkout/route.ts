import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import crypto from 'crypto'

const EPOINT_PUBLIC_KEY = process.env.EPOINT_PUBLIC_KEY!
const EPOINT_PRIVATE_KEY = process.env.EPOINT_PRIVATE_KEY!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const PLAN_PRICES: Record<string, { amount: string; currency: string; description: string }> = {
  PRO:  { amount: '14.90', currency: 'AZN', description: 'BacarIQ Pro — İllik Abunə' },
  TEAM: { amount: '89.90', currency: 'AZN', description: 'BacarIQ Komanda — İllik Abunə' },
}

function buildEpointRequest(params: Record<string, string>) {
  const jsonStr = JSON.stringify(params)
  const data = Buffer.from(jsonStr).toString('base64')
  const rawSig = EPOINT_PRIVATE_KEY + data + EPOINT_PRIVATE_KEY
  const signature = Buffer.from(
    crypto.createHash('sha1').update(rawSig).digest()
  ).toString('base64')
  return { data, signature }
}

export async function POST(req: NextRequest) {
  try {
    const { plan, lessonId } = await req.json()

    if (!['PRO', 'TEAM'].includes(plan)) {
      return NextResponse.json({ error: 'Yanlış plan' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Giriş tələb olunur' }, { status: 401 })

    const planInfo = PLAN_PRICES[plan]

    // Build order_id encoding plan + user + optional lessonId
    const orderId = `${plan}-${user.id}-${Date.now()}`

    // result_url receives the callback; success_redirect is for browser redirect
    const callbackUrl = `${APP_URL}/api/payment/callback`
    const successUrl  = lessonId
      ? `${APP_URL}/upgrade/success?plan=${plan}&lessonId=${lessonId}`
      : `${APP_URL}/upgrade/success?plan=${plan}`

    const params = {
      public_key:       EPOINT_PUBLIC_KEY,
      amount:           planInfo.amount,
      currency:         planInfo.currency,
      order_id:         orderId,
      description:      planInfo.description,
      result_url:       callbackUrl,
      success_redirect: successUrl,
      cancel_redirect:  `${APP_URL}/upgrade`,
      language:         'az',
    }

    const { data, signature } = buildEpointRequest(params)

    const epointRes = await fetch('https://epoint.az/api/1/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ data, signature }),
    })

    const epointData = await epointRes.json()

    if (epointData.status !== 'success' || !epointData.redirect_url) {
      console.error('Epoint error:', epointData)
      return NextResponse.json(
        { error: epointData.message || 'Ödəniş sistemi xətası' },
        { status: 502 }
      )
    }

    return NextResponse.json({ redirectUrl: epointData.redirect_url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Server xətası' }, { status: 500 })
  }
}
