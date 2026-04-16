'use client'

import { useState, useEffect, useRef } from 'react'
import { DIMENSIONS, type DimensionKey } from '@/lib/assessment-questions'
import {
  Loader2, CheckCircle, AlertCircle, Play, RefreshCw,
  BookOpen, ChevronDown, ChevronUp, X, Headphones,
  ThumbsUp, RotateCcw, ExternalLink, MessageSquare, ChevronRight,
} from 'lucide-react'

const SKILL_KEYS: DimensionKey[] = ['K', 'L', 'A', 'D', 'S', 'C']
const TOTAL_LESSONS = 12

interface LessonMeta {
  order: number
  title: string
  description: string
  difficulty: string
  durationSeconds: number
}

interface Lesson {
  id: string
  order: number
  title: string
  description: string
  difficulty: string
  durationSeconds: number
  content: any
  adminApproved: boolean
  adminComment: string | null
}

interface ProgramStatus {
  id: string
  skillKey: string
  status: string
  programTitle: string
  lessonCount: number
}

interface GenState {
  phase: 'outline' | 'lessons' | 'done' | 'error'
  current: number
  total: number
  done: number[]
  programId: string | null
  error?: string
}

const diffLabel: Record<string, string> = { beginner: 'Başlanğıc', intermediate: 'Orta', advanced: 'İrəliləmiş' }
const diffColor: Record<string, string> = {
  beginner: 'bg-green-900/30 text-green-400 border-green-700/30',
  intermediate: 'bg-amber-900/30 text-amber-400 border-amber-700/30',
  advanced: 'bg-red-900/30 text-red-400 border-red-700/30',
}

export default function CurriculumAdminPage() {
  const [programs, setPrograms] = useState<ProgramStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [genStates, setGenStates] = useState<Record<string, GenState>>({})
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)
  const [modalLesson, setModalLesson] = useState<Lesson | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [lessonListKey, setLessonListKey] = useState(0) // force-refresh LessonList

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
    pollingRef.current = setInterval(fetchPrograms, 5000)
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  function setGen(key: string, update: Partial<GenState>) {
    setGenStates(prev => ({ ...prev, [key]: { ...prev[key], ...update } as GenState }))
  }

  async function handleGenerate(key: DimensionKey) {
    const dim = DIMENSIONS[key]
    setGenStates(prev => ({
      ...prev,
      [key]: { phase: 'outline', current: 0, total: TOTAL_LESSONS, done: [], programId: null },
    }))
    setExpandedSkill(null)

    // Phase 1: outline
    let outlineData: any
    try {
      const outlineRes = await fetch('/api/admin/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillKey: key }),
      })
      outlineData = await outlineRes.json()
      if (!outlineRes.ok) {
        setGen(key, { phase: 'error', error: outlineData.error ?? 'Outline generation failed' })
        showToast(`Xəta: ${outlineData.error ?? 'Outline failed'}`)
        return
      }
    } catch (err: any) {
      setGen(key, { phase: 'error', error: err?.message ?? 'Network error' })
      showToast(`Şəbəkə xətası: ${err?.message}`)
      return
    }

    const { programId, lessons } = outlineData as { programId: string; lessons: LessonMeta[] }
    setGen(key, { phase: 'lessons', programId, total: lessons.length, done: [], current: 0 })
    fetchPrograms()

    // Phase 2: one lesson at a time
    const completedOrders: number[] = []
    for (let i = 0; i < lessons.length; i++) {
      const meta = lessons[i]
      setGen(key, { current: i })
      let success = false
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const lessonRes = await fetch('/api/admin/generate-lesson', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              programId, lesson: meta,
              skillLabel: dim.fullLabel,
              category: dim.lessonCategory,
              totalLessons: lessons.length,
            }),
          })
          if (lessonRes.ok) { success = true; break }
          const errData = await lessonRes.json()
          console.warn(`Lesson ${meta.order} attempt ${attempt + 1} failed:`, errData.error)
        } catch (err) {
          console.warn(`Lesson ${meta.order} attempt ${attempt + 1} network error:`, err)
        }
        if (attempt === 0) await new Promise(r => setTimeout(r, 3000))
      }
      if (!success) console.error(`Lesson ${meta.order} failed after 2 attempts, skipping`)
      completedOrders.push(meta.order)
      setGen(key, { done: [...completedOrders] })
      fetchPrograms()
    }

    // Phase 3: finalize
    const finalizeRes = await fetch('/api/admin/finalize-program', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programId, status: 'ready' }),
    })
    if (!finalizeRes.ok) {
      const err = await finalizeRes.json().catch(() => ({}))
      console.error('finalize-program failed:', err)
      showToast('Tamamlandı amma status yenilənmədi — səhifəni yeniləyin')
    }

    setGen(key, { phase: 'done' })
    fetchPrograms()
    setLessonListKey(k => k + 1)
    showToast(`"${dim.fullLabel}" proqramı hazırdır ✓`)
  }

  async function openModal(lesson: Lesson) {
    setModalLesson(null)
    setModalLoading(true)
    const res = await fetch(`/api/admin/lesson-review?lessonId=${lesson.id}`)
    if (res.ok) {
      const data = await res.json()
      setModalLesson(data.lesson)
    }
    setModalLoading(false)
  }

  function handleSpeak() {
    if (!modalLesson?.content?.textContent) return
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return }
    const tc = modalLesson.content.textContent
    const text = [tc.intro, tc.mainConcept, tc.realExample, tc.framework].filter(Boolean).join('\n\n')
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'az-AZ'; utt.rate = 0.95
    utt.onend = () => setSpeaking(false)
    window.speechSynthesis.speak(utt)
    setSpeaking(true)
  }

  useEffect(() => () => window.speechSynthesis.cancel(), [])

  const getProgram = (key: string) => programs.find(p => p.skillKey === key)

  return (
    <div>
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-violet-700 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl animate-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Kurikulum</h1>
        <p className="text-gray-400 mt-1">Bacarıq proqramları — generasiya et, nəzərdən keç, təsdiqlə</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={36} className="text-violet-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {SKILL_KEYS.map(key => {
            const dim = DIMENSIONS[key]
            const prog = getProgram(key)
            const gen = genStates[key]
            const isActivelyGenerating = gen && gen.phase !== 'done' && gen.phase !== 'error'
            // Ready: DB says ready, OR this session just finished generating
            const isReady = (prog?.status === 'ready' || gen?.phase === 'done') && !isActivelyGenerating
            const isError = (prog?.status === 'error' || gen?.phase === 'error') && !isActivelyGenerating
            // Stuck: DB still shows 'generating' but no active client gen (interrupted by page reload etc.)
            const isStuck = prog?.status === 'generating' && !isActivelyGenerating && gen?.phase !== 'done'
            const isExpanded = expandedSkill === key

            const doneLessons = gen?.done?.length ?? ((isReady || isStuck) ? (prog?.lessonCount ?? 0) : 0)
            const totalLessons = gen?.total ?? TOTAL_LESSONS
            const pct = Math.round((doneLessons / totalLessons) * 100)
            const currentLesson = gen?.current ?? 0

            return (
              <div
                key={key}
                className={`bg-gray-900 border rounded-2xl transition-all ${
                  isActivelyGenerating ? 'border-violet-600 shadow-lg shadow-violet-900/20' : 'border-gray-800'
                }`}
              >
                <div className="p-5 flex items-start gap-4">
                  <span className="text-3xl shrink-0 mt-0.5">{dim.icon}</span>

                  <div className="flex-1 min-w-0">
                    {/* Title + status badge */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <h2 className="font-extrabold text-white">{dim.fullLabel}</h2>
                      {isActivelyGenerating && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                          <Loader2 size={10} className="animate-spin" />
                          {gen.phase === 'outline' ? 'Struktur hazırlanır...' : `Dərs ${doneLessons + 1}/${totalLessons} yazılır`}
                        </span>
                      )}
                      {isReady && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full border border-green-400/20">
                          <CheckCircle size={10} /> Hazır — {prog?.lessonCount ?? gen?.done?.length ?? TOTAL_LESSONS} dərs
                        </span>
                      )}
                      {isStuck && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                          <AlertCircle size={10} /> Yarıda kəsildi — yenidən başladın
                        </span>
                      )}
                      {isError && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full border border-red-400/20" title={gen?.error ?? ''}>
                          <AlertCircle size={10} /> Xəta{gen?.error ? `: ${gen.error.slice(0, 60)}` : ''}
                        </span>
                      )}
                      {!prog && !gen && (
                        <span className="text-xs text-gray-600">Başlanmayıb</span>
                      )}
                    </div>

                    {/* Progress bar */}
                    {(isActivelyGenerating || prog) && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">
                            {gen?.phase === 'outline'
                              ? 'Proqram strukturu hazırlanır...'
                              : isActivelyGenerating
                              ? `Dərs ${doneLessons + 1} / ${totalLessons} yazılır...`
                              : isReady ? 'Bütün dərslər tamamlandı'
                              : isStuck ? `${prog?.lessonCount ?? 0} / ${totalLessons} dərs (yarıda kəsildi)`
                              : `${doneLessons} / ${totalLessons} dərs`}
                          </span>
                          <span className={`font-extrabold text-sm ${isReady ? 'text-green-400' : isActivelyGenerating ? 'text-violet-300' : isStuck ? 'text-amber-400' : 'text-gray-500'}`}>
                            {gen?.phase === 'outline' ? '...' : `${pct}%`}
                          </span>
                        </div>

                        <div className="h-4 bg-gray-800 rounded-full overflow-hidden relative">
                          {isActivelyGenerating && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                          )}
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isReady ? 'bg-green-500'
                              : isActivelyGenerating ? 'bg-gradient-to-r from-violet-600 to-blue-500'
                              : isStuck ? 'bg-amber-600'
                              : isError ? 'bg-red-600' : 'bg-gray-600'
                            }`}
                            style={{ width: gen?.phase === 'outline' ? '8%' : `${Math.max(pct, doneLessons > 0 ? 6 : 0)}%` }}
                          />
                        </div>

                        <div className="flex gap-1 pt-1">
                          {Array.from({ length: totalLessons }, (_, i) => {
                            const lessonOrder = i + 1
                            const isDone = gen ? gen.done.includes(lessonOrder) : i < (prog?.lessonCount ?? 0)
                            const isCurrent = isActivelyGenerating && gen && i === currentLesson && gen.phase === 'lessons'
                            return (
                              <div key={i} title={`Dərs ${lessonOrder}`}
                                className={`flex-1 h-6 rounded-md flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${
                                  isDone ? 'bg-green-500/30 text-green-400 border border-green-500/40'
                                  : isCurrent ? 'bg-violet-500/40 text-violet-200 border border-violet-400/60 animate-pulse'
                                  : 'bg-gray-800 text-gray-600 border border-gray-700'
                                }`}
                              >
                                {isDone ? '✓' : lessonOrder}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {(isReady || isStuck) && prog && (
                      <>
                        {/* View Program — only when truly ready */}
                        {isReady && (
                          <a
                            href={`/program/${prog.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 px-3 py-2 rounded-xl transition"
                          >
                            <ExternalLink size={13} /> Proqrama Bax
                          </a>
                        )}

                        {/* Toggle lessons */}
                        <button
                          onClick={() => setExpandedSkill(isExpanded ? null : key)}
                          className="flex items-center gap-1.5 text-xs font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition"
                        >
                          <BookOpen size={13} />
                          Dərslər
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>

                        {/* Regenerate */}
                        <button
                          onClick={() => handleGenerate(key)}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition ${
                            isStuck
                              ? 'bg-amber-700/40 text-amber-300 hover:bg-amber-700/60'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          <RefreshCw size={13} /> {isStuck ? 'Yenidən Başlat' : 'Yenidən Generasiya'}
                        </button>
                      </>
                    )}

                    {!isActivelyGenerating && !isReady && !isStuck && (
                      <button
                        onClick={() => handleGenerate(key)}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition ${
                          isError ? 'bg-red-900/40 text-red-300 hover:bg-red-900/60'
                          : 'bg-violet-600 text-white hover:bg-violet-700'
                        }`}
                      >
                        {isError ? <><RefreshCw size={13} /> Yenidən Cəhd Et</> : <><Play size={13} /> Generasiya Et</>}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded lesson list */}
                {isExpanded && prog && (isReady || isStuck) && (
                  <LessonList
                    key={`${prog.id}-${lessonListKey}`}
                    programId={prog.id}
                    skillLabel={prog.programTitle}
                    dim={DIMENSIONS[key as DimensionKey]}
                    onOpenModal={openModal}
                    onToast={showToast}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Full content modal */}
      {(modalLesson || modalLoading) && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-start justify-end p-4"
          onClick={() => { setModalLesson(null); window.speechSynthesis.cancel(); setSpeaking(false) }}
        >
          <div
            className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-2xl h-[calc(100vh-2rem)] flex flex-col shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {modalLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 size={32} className="text-violet-500 animate-spin" />
              </div>
            ) : modalLesson ? (
              <>
                <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-800 shrink-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${diffColor[modalLesson.difficulty] ?? diffColor.beginner}`}>
                        {diffLabel[modalLesson.difficulty]}
                      </span>
                      <span className="text-xs text-gray-500">Dərs {modalLesson.order}</span>
                      {modalLesson.adminApproved && (
                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-900/20 border border-green-700/30 px-2 py-0.5 rounded-full">
                          <CheckCircle size={10} /> Təsdiqlənib
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-white text-base leading-snug">{modalLesson.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleSpeak}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition ${speaking ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      <Headphones size={13} /> {speaking ? 'Dayandır' : 'Dinlə'}
                    </button>
                    <button onClick={() => { setModalLesson(null); window.speechSynthesis.cancel(); setSpeaking(false) }} className="text-gray-500 hover:text-white p-1">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {modalLesson.content?.textContent ? (() => {
                    const tc = modalLesson.content.textContent
                    return (
                      <>
                        {tc.intro && <div className="bg-violet-900/20 border-l-4 border-violet-500 rounded-r-xl p-4"><p className="text-violet-200 font-semibold text-sm leading-relaxed">{tc.intro}</p></div>}
                        {tc.mainConcept && <div className="bg-gray-900 rounded-xl p-4"><p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Əsas Konsept</p><p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{tc.mainConcept}</p></div>}
                        {tc.realExample && <div className="bg-blue-900/20 rounded-xl p-4"><p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Real Nümunə</p><p className="text-gray-300 text-sm leading-relaxed">{tc.realExample}</p></div>}
                        {tc.framework && <div className="bg-green-900/20 rounded-xl p-4"><p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">Praktiki Çərçivə</p><p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{tc.framework}</p></div>}
                        {(tc.exercises ?? []).length > 0 && (
                          <div className="bg-amber-900/20 rounded-xl p-4">
                            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Məşq Tapşırıqları</p>
                            <ul className="space-y-2">
                              {tc.exercises.map((ex: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                                  <span className="w-5 h-5 bg-amber-900/40 text-amber-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                                  {ex}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {tc.nextStep && (
                          <div className="bg-gray-800 rounded-xl p-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Növbəti Addım</p>
                            <p className="text-gray-300 text-sm">{tc.nextStep}</p>
                          </div>
                        )}
                      </>
                    )
                  })() : <div className="text-center py-10 text-gray-600">Məzmun mövcud deyil</div>}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Lesson List (per-skill accordion) ──────────────────────────────────────

interface LessonListProps {
  programId: string
  skillLabel: string
  dim: (typeof DIMENSIONS)[DimensionKey]
  onOpenModal: (l: Lesson) => void
  onToast: (msg: string) => void
}

interface LessonRowState {
  expanded: boolean
  comment: string
  loading: boolean
  msg: string | null
}

function LessonList({ programId, onOpenModal, onToast }: LessonListProps) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [fetching, setFetching] = useState(true)
  const [rowStates, setRowStates] = useState<Record<string, LessonRowState>>({})

  useEffect(() => {
    fetch(`/api/admin/curriculum-lessons?programId=${programId}`)
      .then(r => r.json())
      .then(d => { setLessons(d.lessons ?? []); setFetching(false) })
  }, [programId])

  function getRow(id: string): LessonRowState {
    return rowStates[id] ?? { expanded: false, comment: '', loading: false, msg: null }
  }

  function setRow(id: string, update: Partial<LessonRowState>) {
    setRowStates(prev => ({ ...prev, [id]: { ...getRow(id), ...update } }))
  }

  async function handleAction(lesson: Lesson, action: 'approve' | 'revise') {
    const row = getRow(lesson.id)
    if (action === 'revise' && !row.comment.trim()) {
      setRow(lesson.id, { msg: 'Şərh yazın' })
      return
    }
    setRow(lesson.id, { loading: true, msg: null })
    const res = await fetch('/api/admin/lesson-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, lessonId: lesson.id, comment: row.comment.trim() }),
    })
    const json = await res.json()
    if (res.ok) {
      if (action === 'approve') {
        setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, adminApproved: true } : l))
        setRow(lesson.id, { loading: false, msg: null, expanded: false })
        onToast('Dərs təsdiqləndi ✓')
      } else {
        const newContent = json.newContent
        setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, content: newContent ?? l.content, adminApproved: false } : l))
        setRow(lesson.id, { loading: false, msg: 'Dərs yenidən yazıldı. Nəzərdən keçib təsdiqlə.', comment: '' })
        onToast('Dərs yenidən generasiya edildi')
      }
    } else {
      setRow(lesson.id, { loading: false, msg: json.error ?? 'Xəta baş verdi' })
    }
  }

  if (fetching) {
    return (
      <div className="border-t border-gray-800 px-5 py-6 flex items-center gap-2 justify-center text-gray-600 text-sm">
        <Loader2 size={14} className="animate-spin" /> Dərslər yüklənir...
      </div>
    )
  }

  const approvedCount = lessons.filter(l => l.adminApproved).length

  return (
    <div className="border-t border-gray-800">
      {/* Summary bar */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-gray-800/60">
        <p className="text-xs text-gray-500">
          <span className="text-green-400 font-bold">{approvedCount}</span>/{lessons.length} dərs təsdiqlənib
        </p>
        <div className="h-1.5 w-32 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${lessons.length ? (approvedCount / lessons.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <ul className="divide-y divide-gray-800">
        {lessons.map(lesson => {
          const row = getRow(lesson.id)
          return (
            <li key={lesson.id}>
              {/* Row header */}
              <div className="flex items-center gap-3 px-5 py-3.5">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${diffColor[lesson.difficulty] ?? diffColor.beginner}`}>
                  {lesson.adminApproved ? <CheckCircle size={13} className="text-green-400" /> : lesson.order}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-200 truncate">{lesson.title}</p>
                  <p className="text-xs text-gray-500">{diffLabel[lesson.difficulty]} · ~{Math.round(lesson.durationSeconds / 60)} dəq</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* View full content */}
                  <button
                    onClick={() => onOpenModal(lesson)}
                    title="Tam məzmunu gör"
                    className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded-lg transition"
                  >
                    <BookOpen size={12} /> Oxu
                  </button>

                  {/* Toggle inline review */}
                  <button
                    onClick={() => setRow(lesson.id, { expanded: !row.expanded })}
                    title={row.expanded ? 'Bağla' : 'Şərh / Təsdiq'}
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition ${
                      row.expanded ? 'bg-violet-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <MessageSquare size={12} />
                    {lesson.adminApproved ? 'Təsdiqlənib' : 'Nəzərdən keç'}
                    <ChevronRight size={11} className={`transition-transform ${row.expanded ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Inline review panel */}
              {row.expanded && (
                <div className="mx-5 mb-4 bg-gray-800/50 border border-gray-700/60 rounded-xl p-4 space-y-3">
                  {/* Previous comment */}
                  {lesson.adminComment && (
                    <div className="text-xs text-gray-400 bg-gray-800 rounded-lg px-3 py-2">
                      <span className="font-semibold text-gray-300">Əvvəlki şərh: </span>{lesson.adminComment}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1.5 block">
                      Şərh / düzəliş təlimatı
                    </label>
                    <textarea
                      value={row.comment}
                      onChange={e => setRow(lesson.id, { comment: e.target.value, msg: null })}
                      placeholder="Məs: daha çox Azərbaycan nümunəsi əlavə et, framework hissəsini genişləndir..."
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-violet-500 transition"
                      rows={3}
                    />
                  </div>

                  {row.msg && (
                    <p className={`text-xs ${row.msg.includes('Xəta') || row.msg === 'Şərh yazın' ? 'text-red-400' : 'text-green-400'}`}>
                      {row.msg}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(lesson, 'revise')}
                      disabled={row.loading || !row.comment.trim()}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold text-sm rounded-xl transition disabled:opacity-40"
                    >
                      {row.loading ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                      Şərhi nəzərə alaraq Yenidən Yaz
                    </button>
                    <button
                      onClick={() => handleAction(lesson, 'approve')}
                      disabled={row.loading || lesson.adminApproved}
                      className={`flex items-center justify-center gap-1.5 px-5 py-2.5 font-bold text-sm rounded-xl transition disabled:opacity-40 ${
                        lesson.adminApproved
                          ? 'bg-green-900/40 text-green-400 cursor-default'
                          : 'bg-green-600 hover:bg-green-500 text-white'
                      }`}
                    >
                      {row.loading ? <Loader2 size={13} className="animate-spin" /> : <ThumbsUp size={13} />}
                      {lesson.adminApproved ? 'Təsdiqlənib' : 'Təsdiqlə'}
                    </button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
