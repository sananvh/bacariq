'use client'

import { useState, useEffect } from 'react'
import { DIMENSIONS, type DimensionKey } from '@/lib/assessment-questions'
import { Loader2, CheckCircle, AlertCircle, Play, RefreshCw } from 'lucide-react'

const SKILL_KEYS: DimensionKey[] = ['K', 'L', 'A', 'D', 'S', 'C']

interface ProgramStatus {
  id: string
  skillKey: string
  status: string
  programTitle: string
  lessonCount: number
}

export default function CurriculumAdminPage() {
  const [programs, setPrograms] = useState<ProgramStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function fetchPrograms() {
    const res = await fetch('/api/admin/curriculum-status')
    if (res.ok) {
      const data = await res.json()
      setPrograms(data.programs ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPrograms()
    const interval = setInterval(fetchPrograms, 8000)
    return () => clearInterval(interval)
  }, [])

  async function handleGenerate(skillKey: DimensionKey) {
    setGenerating(skillKey)
    setMessage(null)
    const res = await fetch('/api/admin/generate-curriculum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillKey }),
    })
    const json = await res.json()
    if (res.ok) {
      setMessage(`"${DIMENSIONS[skillKey].fullLabel}" üçün generasiya başladı. Dərslər bir-bir yazılır...`)
      fetchPrograms()
    } else {
      setMessage(`Xəta: ${json.error}`)
    }
    setGenerating(null)
  }

  const getProgram = (skillKey: string) => programs.find(p => p.skillKey === skillKey)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Kurikulum Generatoru</h1>
        <p className="text-gray-400 mt-1">Hər bacarıq üçün AI dərslərini bir-bir generasiya et</p>
      </div>

      {message && (
        <div className="bg-violet-900/40 border border-violet-700 rounded-2xl p-4 mb-6 text-violet-200 text-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SKILL_KEYS.map(key => {
          const dim = DIMENSIONS[key]
          const prog = getProgram(key)
          const isGenerating = prog?.status === 'generating'
          const isReady = prog?.status === 'ready'
          const isError = prog?.status === 'error'
          const isRunning = generating === key

          return (
            <div key={key} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{dim.icon}</span>
                  <div>
                    <h2 className="font-extrabold text-white">{dim.fullLabel}</h2>
                    <p className="text-gray-400 text-xs mt-0.5">{dim.lessonCategory}</p>
                  </div>
                </div>

                {/* Status badge */}
                <div className="shrink-0">
                  {isGenerating && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-full">
                      <Loader2 size={12} className="animate-spin" /> Generasiya olunur...
                    </span>
                  )}
                  {isReady && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full">
                      <CheckCircle size={12} /> Hazır
                    </span>
                  )}
                  {isError && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-400/10 px-3 py-1.5 rounded-full">
                      <AlertCircle size={12} /> Xəta
                    </span>
                  )}
                  {!prog && (
                    <span className="text-xs text-gray-600 font-semibold">Yoxdur</span>
                  )}
                </div>
              </div>

              {/* Lesson count */}
              {prog && (
                <div className="mt-4 p-3 bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">{prog.programTitle}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{prog.lessonCount} / 12 dərs</span>
                    <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full transition-all"
                        style={{ width: `${(prog.lessonCount / 12) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Generate button */}
              <div className="mt-4">
                {!isGenerating && (
                  <button
                    onClick={() => handleGenerate(key)}
                    disabled={isRunning}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition ${
                      isReady || isError
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-violet-600 text-white hover:bg-violet-700'
                    } disabled:opacity-50`}
                  >
                    {isRunning ? (
                      <><Loader2 size={15} className="animate-spin" /> Başladılır...</>
                    ) : isReady ? (
                      <><RefreshCw size={15} /> Yenidən Generasiya Et</>
                    ) : isError ? (
                      <><RefreshCw size={15} /> Yenidən Cəhd Et</>
                    ) : (
                      <><Play size={15} /> Generasiyanı Başlat</>
                    )}
                  </button>
                )}
                {isGenerating && (
                  <p className="text-center text-xs text-amber-400 mt-2">
                    Hər dərs ayrıca generasiya olunur. Səhifəni avtomatik yeniləyir...
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {loading && (
        <div className="text-center py-12">
          <Loader2 size={32} className="text-violet-500 animate-spin mx-auto" />
        </div>
      )}
    </div>
  )
}
