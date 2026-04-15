'use client'

import { useState, useEffect, useRef } from 'react'
import { DIMENSIONS, type DimensionKey } from '@/lib/assessment-questions'
import { Loader2, CheckCircle, AlertCircle, Play, RefreshCw, BookOpen } from 'lucide-react'

const SKILL_KEYS: DimensionKey[] = ['K', 'L', 'A', 'D', 'S', 'C']
const TOTAL_LESSONS = 12

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
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
  }, [])

  // Faster polling when anything is generating
  useEffect(() => {
    const hasGenerating = programs.some(p => p.status === 'generating')
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(fetchPrograms, hasGenerating ? 3000 : 10000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [programs])

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
      setMessage({ text: `"${DIMENSIONS[skillKey].fullLabel}" üçün generasiya başladı — dərslər bir-bir yazılır.`, type: 'success' })
      fetchPrograms()
    } else {
      setMessage({ text: `Xəta: ${json.error}`, type: 'error' })
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
        <div className={`border rounded-2xl p-4 mb-6 text-sm ${
          message.type === 'success'
            ? 'bg-violet-900/40 border-violet-700 text-violet-200'
            : 'bg-red-900/40 border-red-700 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={36} className="text-violet-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SKILL_KEYS.map(key => {
            const dim = DIMENSIONS[key]
            const prog = getProgram(key)
            const isGenerating = prog?.status === 'generating'
            const isReady = prog?.status === 'ready'
            const isError = prog?.status === 'error'
            const isStarting = generating === key
            const count = prog?.lessonCount ?? 0
            const pct = Math.round((count / TOTAL_LESSONS) * 100)

            return (
              <div
                key={key}
                className={`bg-gray-900 border rounded-2xl p-6 transition-all ${
                  isGenerating ? 'border-violet-600 shadow-lg shadow-violet-900/30' : 'border-gray-800'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{dim.icon}</span>
                    <div>
                      <h2 className="font-extrabold text-white text-base">{dim.fullLabel}</h2>
                      <p className="text-gray-500 text-xs mt-0.5">{dim.lessonCategory}</p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {isGenerating && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20">
                        <Loader2 size={11} className="animate-spin" /> Generasiya olunur
                      </span>
                    )}
                    {isReady && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20">
                        <CheckCircle size={11} /> Hazır
                      </span>
                    )}
                    {isError && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-400/10 px-3 py-1.5 rounded-full border border-red-400/20">
                        <AlertCircle size={11} /> Xəta
                      </span>
                    )}
                    {!prog && (
                      <span className="text-xs text-gray-600 font-semibold">Başlanmayıb</span>
                    )}
                  </div>
                </div>

                {/* Progress section — shown when generating or ready */}
                {prog && (
                  <div className="mb-5">
                    {/* Big progress bar */}
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-400 font-medium">
                        {isGenerating
                          ? `Dərs ${count} / ${TOTAL_LESSONS} yazılır...`
                          : isReady
                          ? `${TOTAL_LESSONS} / ${TOTAL_LESSONS} dərs tamamlandı`
                          : `${count} / ${TOTAL_LESSONS} dərs`}
                      </span>
                      <span className={`font-extrabold ${isReady ? 'text-green-400' : isGenerating ? 'text-amber-400' : 'text-gray-500'}`}>
                        {pct}%
                      </span>
                    </div>

                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isReady
                            ? 'bg-green-500'
                            : isGenerating
                            ? 'bg-gradient-to-r from-violet-500 to-blue-500'
                            : isError
                            ? 'bg-red-500'
                            : 'bg-gray-600'
                        }`}
                        style={{ width: `${Math.max(pct, count > 0 ? 5 : 0)}%` }}
                      />
                    </div>

                    {/* Animated pulse stripe when generating */}
                    {isGenerating && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">AI dərsi yazır, avtomatik yenilənir...</span>
                      </div>
                    )}

                    {/* Lesson dots */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {[...Array(TOTAL_LESSONS)].map((_, i) => {
                        const done = i < count
                        const active = isGenerating && i === count
                        return (
                          <div
                            key={i}
                            title={`Dərs ${i + 1}`}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                              done
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : active
                                ? 'bg-violet-500/30 text-violet-300 border border-violet-500/50 animate-pulse'
                                : 'bg-gray-800 text-gray-600 border border-gray-700'
                            }`}
                          >
                            {done ? <CheckCircle size={12} /> : i + 1}
                          </div>
                        )
                      })}
                    </div>

                    {/* Program title */}
                    {prog.programTitle && prog.programTitle !== `${dim.fullLabel} Proqramı` && (
                      <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
                        <BookOpen size={11} /> {prog.programTitle}
                      </p>
                    )}
                  </div>
                )}

                {/* Generate button */}
                {!isGenerating && (
                  <button
                    onClick={() => handleGenerate(key)}
                    disabled={isStarting}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition ${
                      isReady
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : isError
                        ? 'bg-red-900/40 text-red-300 hover:bg-red-900/60 border border-red-800'
                        : 'bg-violet-600 text-white hover:bg-violet-700'
                    } disabled:opacity-50`}
                  >
                    {isStarting ? (
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
