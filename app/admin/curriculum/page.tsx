'use client'

import { useState, useEffect, useRef } from 'react'
import { DIMENSIONS, type DimensionKey } from '@/lib/assessment-questions'
import {
  Loader2, CheckCircle, AlertCircle, Play, RefreshCw,
  BookOpen, ChevronDown, ChevronUp, ThumbsUp,
  RotateCcw, MessageSquare, ChevronRight, ExternalLink, Volume2, VolumeX,
} from 'lucide-react'

const SKILL_KEYS: DimensionKey[] = ['K', 'L', 'A', 'D', 'S', 'C']
const TOTAL_LESSONS = 12
const SESSION_KEY = 'biq_curriculum_gen'

interface LessonMeta {
  order: number; title: string; description: string; difficulty: string; durationSeconds: number
}
interface Lesson {
  id: string; order: number; title: string; description: string
  difficulty: string; durationSeconds: number; content: any
  adminApproved: boolean; adminComment: string | null
}
interface ProgramStatus {
  id: string; skillKey: string; status: string; programTitle: string; lessonCount: number
}
interface GenState {
  phase: 'outline' | 'lessons' | 'done' | 'error'
  current: number; total: number; done: number[]; programId: string | null; error?: string
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
  const [toast, setToast] = useState<string | null>(null)
  const [lessonListKey, setLessonListKey] = useState(0)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Persist genStates to sessionStorage so navigation doesn't wipe them
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      if (saved) setGenStates(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(genStates)) } catch {}
  }, [genStates])

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
    pollingRef.current = setInterval(fetchPrograms, 6000)
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  function setGen(key: string, update: Partial<GenState>) {
    setGenStates(prev => {
      const next = { ...prev, [key]: { ...prev[key], ...update } as GenState }
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  async function handleGenerate(key: DimensionKey) {
    const dim = DIMENSIONS[key]
    setGen(key, { phase: 'outline', current: 0, total: TOTAL_LESSONS, done: [], programId: null })
    setExpandedSkill(null)

    // Phase 1: outline
    let outlineData: any
    try {
      const res = await fetch('/api/admin/generate-outline', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillKey: key }),
      })
      outlineData = await res.json()
      if (!res.ok) {
        setGen(key, { phase: 'error', error: outlineData.error ?? 'Outline failed' })
        showToast(`Xəta: ${outlineData.error ?? 'Outline failed'}`)
        return
      }
    } catch (err: any) {
      setGen(key, { phase: 'error', error: err?.message ?? 'Network error' })
      return
    }

    const { programId, lessons } = outlineData as { programId: string; lessons: LessonMeta[] }
    setGen(key, { phase: 'lessons', programId, total: lessons.length, done: [], current: 0 })
    fetchPrograms()

    // Phase 2: lessons one by one
    const completedOrders: number[] = []
    for (let i = 0; i < lessons.length; i++) {
      const meta = lessons[i]
      setGen(key, { current: i })
      let success = false
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch('/api/admin/generate-lesson', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ programId, lesson: meta, skillLabel: dim.fullLabel, category: dim.lessonCategory, totalLessons: lessons.length }),
          })
          if (res.ok) break
        } catch {}
        if (attempt === 0) await new Promise(r => setTimeout(r, 3000))
      }
      completedOrders.push(meta.order)
      setGen(key, { done: [...completedOrders] })
    }

    // Phase 3: finalize
    try {
      const res = await fetch('/api/admin/finalize-program', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId, status: 'ready' }),
      })
      if (!res.ok) console.error('finalize-program failed:', await res.json().catch(() => ({})))
    } catch (e) {
      console.error('finalize-program network error:', e)
    }

    setGen(key, { phase: 'done' })
    fetchPrograms()
    setLessonListKey(k => k + 1)
    showToast(`"${dim.fullLabel}" proqramı hazırdır ✓`)
  }

  const getProgram = (key: string) => programs.find(p => p.skillKey === key)

  return (
    <div>
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-violet-700 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl">
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
            const isActivelyGenerating = !!gen && gen.phase !== 'done' && gen.phase !== 'error'
            const isReady = (prog?.status === 'ready' || gen?.phase === 'done') && !isActivelyGenerating
            const isStuck = !!prog && prog.status === 'generating' && !isActivelyGenerating && gen?.phase !== 'done'
            const isError = (prog?.status === 'error' || gen?.phase === 'error') && !isActivelyGenerating && !isReady
            const isExpanded = expandedSkill === key

            const doneLessons = gen?.done?.length ?? ((isReady || isStuck) ? (prog?.lessonCount ?? 0) : 0)
            const totalLessons = gen?.total ?? TOTAL_LESSONS
            const pct = Math.round((doneLessons / totalLessons) * 100)
            const lessonCount = isReady
              ? (gen?.done?.length ?? prog?.lessonCount ?? TOTAL_LESSONS)
              : prog?.lessonCount ?? 0

            return (
              <div key={key} className={`bg-gray-900 border rounded-2xl transition-all ${isActivelyGenerating ? 'border-violet-600 shadow-lg shadow-violet-900/20' : 'border-gray-800'}`}>
                <div className="p-5 flex items-start gap-4">
                  <span className="text-3xl shrink-0 mt-0.5">{dim.icon}</span>

                  <div className="flex-1 min-w-0">
                    {/* Title + badge row */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <h2 className="font-extrabold text-white text-lg">{dim.fullLabel}</h2>
                      {isActivelyGenerating && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                          <Loader2 size={10} className="animate-spin" />
                          {gen.phase === 'outline' ? 'Struktur hazırlanır...' : `Dərs ${doneLessons + 1}/${totalLessons} yazılır`}
                        </span>
                      )}
                      {isReady && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full border border-green-400/20">
                          <CheckCircle size={11} /> {lessonCount} dərs hazırdır
                        </span>
                      )}
                      {isStuck && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                          <AlertCircle size={11} /> Yarıda kəsildi — yenidən başladın
                        </span>
                      )}
                      {isError && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full border border-red-400/20">
                          <AlertCircle size={11} /> Xəta{gen?.error ? `: ${gen.error.slice(0, 50)}` : ''}
                        </span>
                      )}
                      {!prog && !gen && <span className="text-xs text-gray-600">Başlanmayıb</span>}
                    </div>

                    {/* Progress bar — only while generating */}
                    {isActivelyGenerating && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">
                            {gen.phase === 'outline' ? 'Proqram strukturu hazırlanır...' : `Dərs ${doneLessons + 1} / ${totalLessons} yazılır...`}
                          </span>
                          <span className="font-extrabold text-sm text-violet-300">
                            {gen.phase === 'outline' ? '...' : `${pct}%`}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-800 rounded-full overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500 transition-all duration-500"
                            style={{ width: gen.phase === 'outline' ? '6%' : `${Math.max(pct, doneLessons > 0 ? 6 : 0)}%` }}
                          />
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: totalLessons }, (_, i) => {
                            const isDone = gen.done.includes(i + 1)
                            const isCurrent = i === gen.current && gen.phase === 'lessons'
                            return (
                              <div key={i} className={`flex-1 h-5 rounded flex items-center justify-center text-[8px] font-bold transition-all duration-300 ${
                                isDone ? 'bg-green-500/30 text-green-400 border border-green-500/40'
                                : isCurrent ? 'bg-violet-500/40 text-violet-200 border border-violet-400/60 animate-pulse'
                                : 'bg-gray-800 text-gray-700 border border-gray-700'
                              }`}>{isDone ? '✓' : i + 1}</div>
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
                        {isReady && (
                          <a href={`/program/${prog.id}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-bold text-violet-300 bg-violet-900/30 hover:bg-violet-900/50 px-3 py-2 rounded-xl border border-violet-700/30 transition">
                            <ExternalLink size={12} /> İstifadəçi Görünüşü
                          </a>
                        )}
                        <button
                          onClick={() => setExpandedSkill(isExpanded ? null : key)}
                          className="flex items-center gap-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 px-3 py-2 rounded-xl transition"
                        >
                          <BookOpen size={13} /> Dərslərə Bax
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                        <button onClick={() => handleGenerate(key)}
                          className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition">
                          <RefreshCw size={13} /> Yenidən Generasiya
                        </button>
                      </>
                    )}
                    {!isActivelyGenerating && !isReady && !isStuck && (
                      <button onClick={() => handleGenerate(key)}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition ${
                          isError ? 'bg-red-900/40 text-red-300 hover:bg-red-900/60' : 'bg-violet-600 text-white hover:bg-violet-700'
                        }`}>
                        {isError ? <><RefreshCw size={13} /> Yenidən Cəhd Et</> : <><Play size={13} /> Generasiya Et</>}
                      </button>
                    )}
                  </div>
                </div>

                {/* Lessons accordion */}
                {isExpanded && prog && (isReady || isStuck) && (
                  <LessonList key={`${prog.id}-${lessonListKey}`} programId={prog.id} onToast={showToast} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Per-lesson inline review ────────────────────────────────────────────────

interface LessonItemState {
  open: boolean
  contentLoaded: boolean
  loadingContent: boolean
  fullLesson: Lesson | null
  commentOpen: boolean
  comment: string
  actionLoading: boolean
  msg: string | null
  speaking: boolean
}

function LessonList({ programId, onToast }: { programId: string; onToast: (m: string) => void }) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [fetching, setFetching] = useState(true)
  const [itemStates, setItemStates] = useState<Record<string, LessonItemState>>({})

  useEffect(() => {
    fetch(`/api/admin/curriculum-lessons?programId=${programId}`)
      .then(r => r.json())
      .then(d => { setLessons(d.lessons ?? []); setFetching(false) })
  }, [programId])

  // Clean up TTS on unmount
  useEffect(() => () => window.speechSynthesis.cancel(), [])

  function getItem(id: string): LessonItemState {
    return itemStates[id] ?? {
      open: false, contentLoaded: false, loadingContent: false, fullLesson: null,
      commentOpen: false, comment: '', actionLoading: false, msg: null, speaking: false,
    }
  }

  function setItem(id: string, update: Partial<LessonItemState>) {
    setItemStates(prev => ({ ...prev, [id]: { ...getItem(id), ...update } }))
  }

  async function toggleOpen(lesson: Lesson) {
    const item = getItem(lesson.id)
    if (item.open) {
      window.speechSynthesis.cancel()
      setItem(lesson.id, { open: false, speaking: false })
      return
    }
    setItem(lesson.id, { open: true })
    if (!item.contentLoaded) {
      setItem(lesson.id, { open: true, loadingContent: true })
      const res = await fetch(`/api/admin/lesson-review?lessonId=${lesson.id}`)
      if (res.ok) {
        const data = await res.json()
        setItem(lesson.id, { open: true, loadingContent: false, contentLoaded: true, fullLesson: data.lesson })
      } else {
        setItem(lesson.id, { open: true, loadingContent: false })
      }
    }
  }

  function toggleSpeak(id: string) {
    const item = getItem(id)
    if (item.speaking) {
      window.speechSynthesis.cancel()
      setItem(id, { speaking: false })
      return
    }
    const tc = item.fullLesson?.content?.textContent
    if (!tc) return
    const text = [tc.intro, tc.mainConcept, tc.realExample, tc.framework].filter(Boolean).join('\n\n')
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'az-AZ'; utt.rate = 0.9
    utt.onend = () => setItem(id, { speaking: false })
    window.speechSynthesis.speak(utt)
    setItem(id, { speaking: true })
  }

  async function handleAction(lesson: Lesson, action: 'approve' | 'revise') {
    const item = getItem(lesson.id)
    if (action === 'revise' && !item.comment.trim()) {
      setItem(lesson.id, { msg: 'Şərh yazın' }); return
    }
    setItem(lesson.id, { actionLoading: true, msg: null })
    const res = await fetch('/api/admin/lesson-review', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, lessonId: lesson.id, comment: item.comment.trim() }),
    })
    const json = await res.json()
    if (res.ok) {
      if (action === 'approve') {
        setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, adminApproved: true } : l))
        setItem(lesson.id, { actionLoading: false, msg: null, commentOpen: false, open: false })
        onToast('Dərs təsdiqləndi ✓')
      } else {
        const newContent = json.newContent
        setItem(lesson.id, {
          actionLoading: false, msg: 'Dərs yenidən yazıldı. Nəzərdən keçib təsdiqlə.',
          comment: '', commentOpen: false,
          fullLesson: item.fullLesson ? { ...item.fullLesson, content: newContent ?? item.fullLesson.content, adminApproved: false } : null,
        })
        setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, adminApproved: false } : l))
        onToast('Dərs yenidən generasiya edildi')
      }
    } else {
      setItem(lesson.id, { actionLoading: false, msg: json.error ?? 'Xəta baş verdi' })
    }
  }

  if (fetching) {
    return (
      <div className="border-t border-gray-800 flex items-center gap-2 justify-center py-6 text-gray-500 text-sm">
        <Loader2 size={14} className="animate-spin" /> Dərslər yüklənir...
      </div>
    )
  }

  const approvedCount = lessons.filter(l => l.adminApproved).length

  return (
    <div className="border-t border-gray-800">
      {/* Approval progress */}
      <div className="px-5 py-3 flex items-center gap-3 border-b border-gray-800/60">
        <p className="text-xs text-gray-500 shrink-0">
          <span className="text-green-400 font-bold">{approvedCount}</span>/{lessons.length} təsdiqlənib
        </p>
        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${lessons.length ? (approvedCount / lessons.length) * 100 : 0}%` }} />
        </div>
      </div>

      <ul className="divide-y divide-gray-800">
        {lessons.map(lesson => {
          const item = getItem(lesson.id)
          return (
            <li key={lesson.id}>
              {/* ── Row header ── */}
              <button
                onClick={() => toggleOpen(lesson)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-800/40 transition text-left"
              >
                {/* Order number / checkmark */}
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border transition ${
                  lesson.adminApproved ? 'bg-green-900/40 border-green-600/40 text-green-400'
                  : `${diffColor[lesson.difficulty] ?? diffColor.beginner}`
                }`}>
                  {lesson.adminApproved ? <CheckCircle size={14} /> : lesson.order}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-100 truncate">{lesson.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${diffColor[lesson.difficulty] ?? diffColor.beginner}`}>
                      {diffLabel[lesson.difficulty]}
                    </span>
                    <span className="text-[10px] text-gray-500">~{Math.round(lesson.durationSeconds / 60)} dəq</span>
                    {lesson.adminApproved && (
                      <span className="text-[10px] font-semibold text-green-400">Təsdiqlənib</span>
                    )}
                  </div>
                </div>

                <ChevronRight size={15} className={`text-gray-600 transition-transform shrink-0 ${item.open ? 'rotate-90' : ''}`} />
              </button>

              {/* ── Expanded lesson body ── */}
              {item.open && (
                <div className="mx-4 mb-4 bg-gray-800/30 border border-gray-700/50 rounded-2xl overflow-hidden">
                  {item.loadingContent ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-gray-500 text-sm">
                      <Loader2 size={16} className="animate-spin text-violet-500" /> Məzmun yüklənir...
                    </div>
                  ) : item.fullLesson?.content?.textContent ? (
                    <>
                      {/* Audio button */}
                      <div className="flex items-center justify-between px-5 pt-4 pb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dərs Məzmunu</p>
                        <button
                          onClick={e => { e.stopPropagation(); toggleSpeak(lesson.id) }}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                            item.speaking ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {item.speaking ? <><VolumeX size={12} /> Dayandır</> : <><Volume2 size={12} /> Audio</>}
                        </button>
                      </div>

                      {/* Content sections */}
                      <div className="px-5 pb-4 space-y-3" onClick={e => e.stopPropagation()}>
                        {(() => {
                          const tc = item.fullLesson!.content.textContent
                          return (
                            <>
                              {tc.intro && (
                                <div className="bg-violet-900/20 border-l-4 border-violet-500 rounded-r-xl p-3">
                                  <p className="text-violet-200 text-sm leading-relaxed">{tc.intro}</p>
                                </div>
                              )}
                              {tc.mainConcept && (
                                <div className="bg-gray-900/60 rounded-xl p-3">
                                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Əsas Konsept</p>
                                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{tc.mainConcept}</p>
                                </div>
                              )}
                              {tc.realExample && (
                                <div className="bg-blue-900/15 rounded-xl p-3">
                                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1.5">Real Nümunə</p>
                                  <p className="text-gray-300 text-sm leading-relaxed">{tc.realExample}</p>
                                </div>
                              )}
                              {tc.framework && (
                                <div className="bg-green-900/15 rounded-xl p-3">
                                  <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1.5">Praktiki Çərçivə</p>
                                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{tc.framework}</p>
                                </div>
                              )}
                              {(tc.exercises ?? []).length > 0 && (
                                <div className="bg-amber-900/15 rounded-xl p-3">
                                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">Məşq Tapşırıqları</p>
                                  <ul className="space-y-1.5">
                                    {tc.exercises.map((ex: string, i: number) => (
                                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                                        <span className="w-4 h-4 bg-amber-900/40 text-amber-400 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                                        {ex}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          )
                        })()}

                        {/* Previous comment */}
                        {item.fullLesson!.adminComment && !item.commentOpen && (
                          <div className="text-xs text-gray-400 bg-gray-800 rounded-lg px-3 py-2">
                            <span className="font-semibold text-gray-300">Əvvəlki şərh: </span>
                            {item.fullLesson!.adminComment}
                          </div>
                        )}

                        {/* Status message */}
                        {item.msg && (
                          <p className={`text-xs font-medium px-1 ${item.msg.includes('Xəta') || item.msg === 'Şərh yazın' ? 'text-red-400' : 'text-green-400'}`}>
                            {item.msg}
                          </p>
                        )}

                        {/* Comment panel */}
                        {item.commentOpen && (
                          <div className="space-y-2">
                            <textarea
                              value={item.comment}
                              onChange={e => setItem(lesson.id, { comment: e.target.value, msg: null })}
                              placeholder="Şərh yazın... (məs: daha çox nümunə əlavə et, framework hissəsini genişləndir)"
                              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-violet-500 transition"
                              rows={3}
                              onClick={e => e.stopPropagation()}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={e => { e.stopPropagation(); handleAction(lesson, 'revise') }}
                                disabled={item.actionLoading || !item.comment.trim()}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-violet-700 hover:bg-violet-600 disabled:opacity-40 text-white font-bold text-sm rounded-xl transition"
                              >
                                {item.actionLoading ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                                Şərhi nəzərə alaraq Yenidən Yaz
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); setItem(lesson.id, { commentOpen: false }) }}
                                className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold text-sm rounded-xl transition"
                              >
                                Ləğv et
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Bottom action bar */}
                        {!item.commentOpen && (
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={e => { e.stopPropagation(); setItem(lesson.id, { commentOpen: true, msg: null }) }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold text-sm rounded-xl transition"
                            >
                              <MessageSquare size={13} /> Şərh Əlavə Et
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); handleAction(lesson, 'approve') }}
                              disabled={item.actionLoading || lesson.adminApproved}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 font-bold text-sm rounded-xl transition disabled:opacity-50 ${
                                lesson.adminApproved
                                  ? 'bg-green-900/40 text-green-400 cursor-default'
                                  : 'bg-green-600 hover:bg-green-500 text-white'
                              }`}
                            >
                              {item.actionLoading ? <Loader2 size={13} className="animate-spin" /> : <ThumbsUp size={13} />}
                              {lesson.adminApproved ? 'Təsdiqlənib ✓' : 'Təsdiqlə'}
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-600 text-sm">Məzmun mövcud deyil</div>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
