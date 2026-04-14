'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Lock, Loader2, ArrowRight } from 'lucide-react'
import { DIMENSIONS, type DimensionKey, getTopDimensions } from '@/lib/assessment-questions'

interface Props {
  assessmentId: string
  scores: Record<DimensionKey, number>
  existingSkillKeys: DimensionKey[]
  isPaid: boolean
}

const FREE_LIMIT = 1

export default function SkillSelector({ assessmentId, scores, existingSkillKeys, isPaid }: Props) {
  const router = useRouter()
  const { bottom } = getTopDimensions(scores)

  // Start with recommended (bottom = growth areas) pre-selected if not already added
  const initialSelected = existingSkillKeys.length > 0
    ? existingSkillKeys
    : bottom.slice(0, isPaid ? 2 : 1)

  const [selected, setSelected] = useState<DimensionKey[]>(initialSelected)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const allDims = (Object.keys(DIMENSIONS) as DimensionKey[]).sort(
    (a, b) => scores[a] - scores[b] // lowest score first = biggest growth potential
  )

  function toggle(dim: DimensionKey) {
    if (selected.includes(dim)) {
      setSelected(s => s.filter(d => d !== dim))
      return
    }
    if (!isPaid && selected.length >= FREE_LIMIT) {
      setError(`Pulsuz planda yalnız ${FREE_LIMIT} bacarıq seçmək mümkündür.`)
      return
    }
    setError('')
    setSelected(s => [...s, dim])
  }

  async function handleSave() {
    if (selected.length === 0) {
      setError('Ən azı 1 bacarıq seçin.')
      return
    }
    setSaving(true)
    setError('')

    // Remove skills that were deselected
    const toRemove = existingSkillKeys.filter(k => !selected.includes(k))
    for (const skillKey of toRemove) {
      await fetch('/api/skills', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillKey }),
      })
    }

    // Add newly selected skills
    const toAdd = selected.filter(k => !existingSkillKeys.includes(k))
    for (const skillKey of toAdd) {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillKey, assessmentId }),
      })
      if (res.status === 403) {
        setError(`Pulsuz planda yalnız ${FREE_LIMIT} bacarıq seçmək mümkündür.`)
        setSaving(false)
        return
      }
    }

    router.push('/dashboard')
  }

  return (
    <div>
      {/* Skill cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {allDims.map((dim, idx) => {
          const info = DIMENSIONS[dim]
          const isSelected = selected.includes(dim)
          const isRecommended = bottom.includes(dim)
          const isLocked = !isPaid && !isSelected && selected.length >= FREE_LIMIT

          return (
            <button
              key={dim}
              onClick={() => toggle(dim)}
              disabled={isLocked}
              className={`relative text-left p-4 rounded-2xl border-2 transition-all ${
                isSelected
                  ? 'border-violet-500 bg-violet-50 shadow-sm'
                  : isLocked
                  ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-100 bg-white hover:border-violet-200'
              }`}
            >
              {isRecommended && (
                <span className="absolute -top-2 left-3 text-xs font-bold bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">
                  Tövsiyə
                </span>
              )}
              <div className="flex items-start gap-3">
                <span className="text-2xl">{info.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-extrabold text-gray-900 text-sm">{info.label}</p>
                    <span className="text-xs font-bold text-gray-400">{scores[dim]}%</span>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">{info.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  isSelected ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
                }`}>
                  {isSelected && <CheckCircle size={12} className="text-white" />}
                  {isLocked && <Lock size={10} className="text-gray-400" />}
                </div>
              </div>

              {/* Score bar */}
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${scores[dim]}%`, backgroundColor: info.color }}
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Free limit notice */}
      {!isPaid && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-5">
          <Lock size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 text-sm font-semibold">Pulsuz planda 1 bacarıq</p>
            <p className="text-amber-600 text-xs mt-0.5">
              Birdən çox bacarıq izləmək üçün{' '}
              <a href="/upgrade" className="underline font-bold">Pro plana keçin</a> — 14.9 ₼/il
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm mb-4 font-medium">{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving || selected.length === 0}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-extrabold py-4 rounded-2xl hover:bg-violet-700 transition disabled:opacity-50 text-base"
      >
        {saving
          ? <><Loader2 size={18} className="animate-spin" /> Saxlanılır...</>
          : <>{selected.length} Bacarıq Seçildi — Panelinə Keç <ArrowRight size={18} /></>
        }
      </button>
    </div>
  )
}
