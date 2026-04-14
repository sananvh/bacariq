'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

interface Props {
  plan: 'PRO' | 'TEAM'
  lessonId?: string
}

export default function CheckoutButton({ plan, lessonId }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    const res = await fetch('/api/payment/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, lessonId }),
    })
    const data = await res.json()
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl
    } else {
      alert(data.error || 'Xəta baş verdi. Yenidən cəhd edin.')
      setLoading(false)
    }
  }

  const isPro = plan === 'PRO'

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 font-extrabold py-4 rounded-2xl transition disabled:opacity-60 text-base ${
        isPro
          ? 'bg-violet-600 text-white hover:bg-violet-700'
          : 'bg-gray-900 text-white hover:bg-gray-800'
      }`}
    >
      {loading ? 'Yüklənir...' : (
        <>
          {isPro ? 'Pro ilə Başla' : 'Komanda Planı Seç'}
          <ArrowRight size={18} />
        </>
      )}
    </button>
  )
}
