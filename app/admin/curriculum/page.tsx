'use client'

import { useState, useEffect, useRef } from 'react'
import { DIMENSIONS, type DimensionKey } from '@/lib/assessment-questions'
import {
  Loader2, CheckCircle, AlertCircle, Play, RefreshCw,
  BookOpen, ChevronDown, ChevronUp, X, Headphones,
  MessageSquare, ThumbsUp, RotateCcw, Sparkles
} from 'lucide-react'

const SKILL_KEYS: DimensionKey[] = ['K', 'L', 'A', 'D', 'S', 'C']
const TOTAL_LESSONS = 12

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
  lessons?: Lesson[]
}

interface Suggestion {
  skillName: string
  category: string
  reasoning: string
  suggestedLesson: string
  demandLevel: string
  status: string
}

const diffLabel: Record<string, string> = { beginner: 'Başlanğıc', intermediate: 'Orta', advanced: 'İrəliləmiş' }
const diffColor: Record<string, string> = {
  beginner: 'bg-green-900/30 text-green-400 border-green-700/30',
  intermediate: 'bg-amber-900/30 text-amber-400 border-amber-700/30',
  advanced: 'bg-red-900/30 text-red-400 border-red-700/30',
}

export default function CurriculumAdminPage() {
  const [programs, setPrograms] = useState<ProgramStatus[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [lessonLoading, setLessonLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [comment, setComment] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function fetchAll() {
    const [progRes, suggRes] = await Promise.all([
      fetch('/api/admin/curriculum-status'),
      fetch('/api/admin/curriculum-suggestions'),
    ])
    if (progRes.ok) {
      const data = await progRes.json()
      setPrograms(data.programs ?? [])
    }
    if (suggRes.ok) {
      const data = await suggRes.json()
      setSuggestions(data.suggestions ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    const hasGenerating = programs.some(p => p.status === 'generating')
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(fetchAll, hasGenerating ? 3000 : 10000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [programs])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function handleGenerate(skillKey: DimensionKey) {
    setGenerating(skillKey)
    const res = await fetch('/api/admin/generate-curriculum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillKey }),
    })
    const json = await res.json()
    if (res.ok) {
      showToast(`"${DIMENSIONS[skillKey].fullLabel}" generasiyası başladı`)
      fetchAll()
    } else {
      showToast(`Xəta: ${json.error}`)
    }
    setGenerating(null)
  }

  async function openLesson(lesson: Lesson) {
    setSelectedLesson(null)
    setLessonLoading(true)
    setComment('')
    setActionMsg(null)
    const res = await fetch(`/api/admin/lesson-review?lessonId=${lesson.id}`)
    if (res.ok) {
      const data = await res.json()
      setSelectedLesson(data.lesson)
    }
    setLessonLoading(false)
  }

  function handleSpeak() {
    if (!selectedLesson?.content?.textContent) return
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return }
    const tc = selectedLesson.content.textContent
    const text = [tc.intro, tc.mainConcept, tc.realExample, tc.framework].filter(Boolean).join('\n\n')
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'az-AZ'; utt.rate = 0.95
    utt.onend = () => setSpeaking(false)
    window.speechSynthesis.speak(utt)
    setSpeaking(true)
  }

  useEffect(() => { return () => window.speechSynthesis.cancel() }, [])

  async function handleAction(action: 'approve' | 'revise') {
    if (!selectedLesson) return
    if (action === 'revise' && !comment.trim()) {
      setActionMsg('Düzəliş üçün şərh yazın')
      return
    }
    setActionLoading(true)
    setActionMsg(null)
    const res = await fetch('/api/admin/lesson-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, lessonId: selectedLesson.id, comment: comment.trim() }),
    })
    const json = await res.json()
    if (res.ok) {
      if (action === 'approve') {
        showToast('Dərs təsdiqləndi ✓')
        setSelectedLesson({ ...selectedLesson, adminApproved: true })
      } else {
        showToast('Dərs yenidən generasiya edildi')
        if (json.newContent) setSelectedLesson({ ...selectedLesson, content: json.newContent, adminApproved: false })
        setComment('')
      }
      fetchAll()
    } else {
      setActionMsg(json.error ?? 'Xəta baş verdi')
    }
    setActionLoading(false)
  }

  const getProgram = (skillKey: string) => programs.find(p => p.skillKey === skillKey)

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-violet-700 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl animate-fade-in">
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
          {/* Trend suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-gray-900 border border-violet-800/50 rounded-2xl p-5">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-violet-400" />
                Trend Analizindən Tövsiyələr
                <span className="text-xs font-normal text-gray-500">({suggestions.length} gözləyir)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestions.map((s, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white font-semibold text-sm">{s.skillName}</p>
                      <span className="text-xs text-violet-300 bg-violet-900/30 border border-violet-700/30 px-2 py-0.5 rounded-full shrink-0">{s.demandLevel}</span>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">{s.reasoning}</p>
                    {s.suggestedLesson && (
                      <p className="text-violet-400 text-xs">💡 {s.suggestedLesson}</p>
                    )}
                    <button
                      onClick={() => handleGenerate('A')}
                      className="mt-1 flex items-center justify-center gap-1.5 w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition"
                    >
                      <Sparkles size={11} /> AI ilə Generasiya Et
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill program cards */}
          {SKILL_KEYS.map(key => {
            const dim = DIMENSIONS[key]
            const prog = getProgram(key)
            const isGenerating = prog?.status === 'generating'
            const isReady = prog?.status === 'ready'
            const isError = prog?.status === 'error'
            const isStarting = generating === key
            const count = prog?.lessonCount ?? 0
            const pct = Math.round((count / TOTAL_LESSONS) * 100)
            const isExpanded = expandedSkill === key

            return (
              <div
                key={key}
                className={`bg-gray-900 border rounded-2xl transition-all ${
                  isGenerating ? 'border-violet-600 shadow-lg shadow-violet-900/20' : 'border-gray-800'
                }`}
              >
                {/* Card header */}
                <div className="p-5 flex items-center gap-4">
                  <span className="text-3xl shrink-0">{dim.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="font-extrabold text-white">{dim.fullLabel}</h2>
                      {isGenerating && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                          <Loader2 size={10} className="animate-spin" /> Generasiya olunur
                        </span>
                      )}
                      {isReady && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full border border-green-400/20">
                          <CheckCircle size={10} /> Hazır
                        </span>
                      )}
                      {isError && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full border border-red-400/20">
                          <AlertCircle size={10} /> Xəta
                        </span>
                      )}
                    </div>
                    {/* Progress bar */}
                    {prog && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">
                            {isGenerating ? `Dərs ${count}/${TOTAL_LESSONS} yazılır...` : `${count}/${TOTAL_LESSONS} dərs`}
                          </span>
                          <span className={`font-bold ${isReady ? 'text-green-400' : isGenerating ? 'text-amber-400' : 'text-gray-600'}`}>{pct}%</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${isReady ? 'bg-green-500' : isGenerating ? 'bg-gradient-to-r from-violet-500 to-blue-500' : isError ? 'bg-red-500' : 'bg-gray-600'}`}
                            style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                          />
                        </div>
                        {isGenerating && (
                          <div className="flex gap-1 mt-1.5">
                            {[...Array(TOTAL_LESSONS)].map((_, i) => (
                              <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < count ? 'bg-green-500' : i === count ? 'bg-violet-400 animate-pulse' : 'bg-gray-700'}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isReady && (
                      <button
                        onClick={() => setExpandedSkill(isExpanded ? null : key)}
                        className="flex items-center gap-1.5 text-xs font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition"
                      >
                        <BookOpen size={13} />
                        Dərslər
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    )}
                    {!isGenerating && (
                      <button
                        onClick={() => handleGenerate(key)}
                        disabled={isStarting}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition disabled:opacity-50 ${
                          isReady ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' :
                          isError ? 'bg-red-900/40 text-red-300 hover:bg-red-900/60' :
                          'bg-violet-600 text-white hover:bg-violet-700'
                        }`}
                      >
                        {isStarting ? <Loader2 size={13} className="animate-spin" /> :
                         isReady ? <RefreshCw size={13} /> : <Play size={13} />}
                        {isReady ? 'Yenidən' : isError ? 'Yenidən' : 'Generasiya Et'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded lesson list */}
                {isExpanded && prog && (
                  <LessonList programId={prog.id} onOpen={openLesson} />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Lesson Detail Modal */}
      {(selectedLesson || lessonLoading) && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-end p-4" onClick={() => { setSelectedLesson(null); window.speechSynthesis.cancel() }}>
          <div
            className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-2xl h-[calc(100vh-2rem)] flex flex-col shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {lessonLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 size={32} className="text-violet-500 animate-spin" />
              </div>
            ) : selectedLesson ? (
              <>
                {/* Modal header */}
                <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-800 shrink-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${diffColor[selectedLesson.difficulty] ?? diffColor.beginner}`}>
                        {diffLabel[selectedLesson.difficulty]}
                      </span>
                      <span className="text-xs text-gray-500">Dərs {selectedLesson.order}</span>
                      {selectedLesson.adminApproved && (
                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-900/20 border border-green-700/30 px-2 py-0.5 rounded-full">
                          <CheckCircle size={10} /> Təsdiqlənib
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-white text-base leading-snug">{selectedLesson.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleSpeak}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition ${speaking ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      <Headphones size={13} /> {speaking ? 'Dayandır' : 'Dinlə'}
                    </button>
                    <button onClick={() => { setSelectedLesson(null); window.speechSynthesis.cancel() }} className="text-gray-500 hover:text-white p-1">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Lesson content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {selectedLesson.content?.textContent ? (() => {
                    const tc = selectedLesson.content.textContent
                    return (
                      <>
                        {tc.intro && (
                          <div className="bg-violet-900/20 border-l-4 border-violet-500 rounded-r-xl p-4">
                            <p className="text-violet-200 font-semibold text-sm leading-relaxed">{tc.intro}</p>
                          </div>
                        )}
                        {tc.mainConcept && (
                          <div className="bg-gray-900 rounded-xl p-4">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Əsas Konsept</p>
                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{tc.mainConcept}</p>
                          </div>
                        )}
                        {tc.realExample && (
                          <div className="bg-blue-900/20 rounded-xl p-4">
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Real Nümunə</p>
                            <p className="text-gray-300 text-sm leading-relaxed">{tc.realExample}</p>
                          </div>
                        )}
                        {tc.framework && (
                          <div className="bg-green-900/20 rounded-xl p-4">
                            <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">Praktiki Çərçivə</p>
                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{tc.framework}</p>
                          </div>
                        )}
                        {(tc.exercises ?? []).length > 0 && (
                          <div className="bg-amber-900/20 rounded-xl p-4">
                            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Məşq Tapşırıqları</p>
                            <ul className="space-y-2">
                              {tc.exercises.map((ex: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                                  <span className="w-5 h-5 bg-amber-900/40 text-amber-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i+1}</span>
                                  {ex}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )
                  })() : (
                    <div className="text-center py-10 text-gray-600">Məzmun mövcud deyil</div>
                  )}
                </div>

                {/* Admin actions */}
                <div className="p-5 border-t border-gray-800 space-y-3 shrink-0">
                  {selectedLesson.adminComment && (
                    <div className="bg-gray-800 rounded-xl px-4 py-3 text-xs text-gray-400">
                      <span className="font-bold text-gray-300">Əvvəlki şərh: </span>{selectedLesson.adminComment}
                    </div>
                  )}
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Şərh / düzəliş təlimatı... (məs: daha çox Azərbaycan nümunəsi əlavə et)"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-violet-500"
                    rows={3}
                  />
                  {actionMsg && <p className="text-xs text-red-400">{actionMsg}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction('revise')}
                      disabled={actionLoading || !comment.trim()}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-sm rounded-xl transition disabled:opacity-40"
                    >
                      {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                      AI ilə Yenidən Yaz
                    </button>
                    <button
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading || selectedLesson.adminApproved}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-700 hover:bg-green-600 text-white font-bold text-sm rounded-xl transition disabled:opacity-40"
                    >
                      {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} />}
                      {selectedLesson.adminApproved ? 'Təsdiqlənib' : 'Təsdiqlə'}
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

// Sub-component: lesson list for an expanded skill
function LessonList({ programId, onOpen }: { programId: string; onOpen: (l: Lesson) => void }) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/curriculum-lessons?programId=${programId}`)
      .then(r => r.json())
      .then(d => { setLessons(d.lessons ?? []); setLoading(false) })
  }, [programId])

  if (loading) return (
    <div className="px-5 pb-5 text-center text-gray-600 text-sm flex items-center gap-2 justify-center">
      <Loader2 size={14} className="animate-spin" /> Dərslər yüklənir...
    </div>
  )

  return (
    <div className="border-t border-gray-800">
      <ul className="divide-y divide-gray-800">
        {lessons.map(lesson => (
          <li key={lesson.id}>
            <button
              onClick={() => onOpen(lesson)}
              className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-800/50 transition text-left"
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${diffColor[lesson.difficulty] ?? diffColor.beginner}`}>
                {lesson.order}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-200 truncate">{lesson.title}</p>
                <p className="text-xs text-gray-500 truncate">{diffLabel[lesson.difficulty]} · ~{Math.round(lesson.durationSeconds/60)} dəq</p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {lesson.adminApproved
                  ? <CheckCircle size={15} className="text-green-500" />
                  : <MessageSquare size={15} className="text-gray-600" />}
                <BookOpen size={14} className="text-gray-600" />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
