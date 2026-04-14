'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2 } from 'lucide-react'

export default function GeneratePlanButton({ assessmentId }: { assessmentId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    await fetch('/api/assessment', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: assessmentId }),
    })
    router.refresh()
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="inline-flex items-center gap-2 bg-violet-600 text-white font-extrabold px-8 py-3 rounded-2xl hover:bg-violet-700 transition disabled:opacity-60"
    >
      {loading
        ? <><Loader2 size={18} className="animate-spin" /> Hazırlanır...</>
        : <><Sparkles size={18} /> AI Planı Yarat</>
      }
    </button>
  )
}
