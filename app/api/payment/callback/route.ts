import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const EPOINT_PRIVATE_KEY = process.env.EPOINT_PRIVATE_KEY!
const SUPABASE_URL        = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

function verifySignature(data: string, signature: string): boolean {
  const rawSig = EPOINT_PRIVATE_KEY + data + EPOINT_PRIVATE_KEY
  const expected = Buffer.from(
    crypto.createHash('sha1').update(rawSig).digest()
  ).toString('base64')
  return expected === signature
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData()
    const data      = body.get('data') as string
    const signature = body.get('signature') as string

    if (!data || !signature) {
      return NextResponse.json({ status: 'error', message: 'Missing params' }, { status: 400 })
    }

    if (!verifySignature(data, signature)) {
      return NextResponse.json({ status: 'error', message: 'Invalid signature' }, { status: 403 })
    }

    const payload = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'))

    // Only activate on successful payment
    if (payload.status !== 'success') {
      return NextResponse.json({ status: 'ok' })
    }

    // Parse order_id — format: "PLAN-userId-timestamp"
    const [plan, ...userParts] = (payload.order_id as string).split('-')
    // userId is a UUID with hyphens — reassemble everything between first and last segment
    // order_id = `${plan}-${user.id}-${Date.now()}`
    // plan has no hyphens, timestamp has no hyphens, UUID has 4 hyphens
    // Split by first '-' then last '-' to isolate UUID
    const orderId = payload.order_id as string
    const firstDash = orderId.indexOf('-')
    const lastDash  = orderId.lastIndexOf('-')
    const userId    = orderId.slice(firstDash + 1, lastDash)
    const planName  = orderId.slice(0, firstDash) as 'PRO' | 'TEAM'

    if (!['PRO', 'TEAM'].includes(planName) || !userId) {
      return NextResponse.json({ status: 'error', message: 'Bad order_id' }, { status: 400 })
    }

    // Use service role to bypass RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    await supabase
      .from('User')
      .update({
        subscriptionPlan:      planName,
        subscriptionStatus:    'ACTIVE',
        subscriptionExpiresAt: expiresAt.toISOString(),
      })
      .eq('id', userId)

    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error('Payment callback error:', err)
    return NextResponse.json({ status: 'error', message: 'Server error' }, { status: 500 })
  }
}
