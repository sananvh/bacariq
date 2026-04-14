'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Headphones, CheckCircle, ChevronRight, Trophy } from 'lucide-react'
import Link from 'next/link'

interface Props {
  lessonId: string
  content: any
  format: string
  initialProgress: number
  isCompleted: boolean
  nextLesson: { id: string; title: string } | null
  category: string
  userId: string
  existingCertId?: string | null
}

export default function LessonViewer({
  lessonId, content, isCompleted: initialDone, nextLesson, existingCertId,
}: Props) {
  const [mode, setMode] = useState<'read' | 'listen'>('read')
  const [done, setDone] = useState(initialDone)
  const [marking, setMarking] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [showComplete, setShowComplete] = useState(false)

  // Text-to-speech
  function buildReadAloudText() {
    if (!content?.textContent) return ''
    const tc = content.textContent
    return [
      tc.intro,
      tc.mainConcept,
      tc.realExample,
      tc.framework,
      ...(tc.exercises ?? []),
      tc.nextStep,
    ].filter(Boolean).join('\n\n')
  }

  function handleListen() {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      setMode('read')
      return
    }
    const text = buildReadAloudText()
    if (!text) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'az-AZ'
    utterance.rate = 0.95
    utterance.onend = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
    setMode('listen')
  }

  // Stop speech on unmount
  useEffect(() => {
    return () => { window.speechSynthesis.cancel() }
  }, [])

  async function markComplete() {
    setMarking(true)
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, watchedSeconds: 999, isCompleted: true }),
    })
    setDone(true)
    setMarking(false)
    setShowComplete(true)
  }

  if (!content) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <BookOpen size={40} className="text-gray-200 mx-auto mb-4" />
        <p className="text-gray-400">Bu dərsin məzmunu hələ əlavə edilməyib.</p>
      </div>
    )
  }

  const tc = content.textContent
  const vs = content.videoScript

  return (
    <div>
      {/* Mode switcher */}
      {tc && (
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => { setMode('read'); window.speechSynthesis.cancel(); setSpeaking(false) }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
              mode === 'read'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'
            }`}
          >
            <BookOpen size={16} /> Oxu
          </button>
          <button
            onClick={handleListen}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
              mode === 'listen'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'
            }`}
          >
            <Headphones size={16} /> {speaking ? 'Dayandır' : 'Dinlə'}
          </button>
          {speaking && (
            <div className="flex items-center gap-1 ml-2">
              {[1,2,3,4].map(i => (
                <div
                  key={i}
                  className="w-1 bg-violet-500 rounded-full animate-bounce"
                  style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Text content */}
      {tc && (
        <div className="space-y-6">
          {/* Intro */}
          {tc.intro && (
            <div className="bg-violet-50 border-l-4 border-violet-500 rounded-r-2xl p-5">
              <p className="text-violet-900 font-semibold text-lg leading-relaxed">{tc.intro}</p>
            </div>
          )}

          {/* Main concept */}
          {tc.mainConcept && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center text-xs font-black">1</span>
                Əsas Konsept
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{tc.mainConcept}</p>
            </div>
          )}

          {/* Real example */}
          {tc.realExample && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs font-black">2</span>
                Real Həyat Nümunəsi
              </h2>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-blue-900 leading-relaxed">{tc.realExample}</p>
              </div>
            </div>
          )}

          {/* Framework */}
          {tc.framework && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xs font-black">3</span>
                Praktiki Çərçivə
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{tc.framework}</p>
            </div>
          )}

          {/* Exercises */}
          {tc.exercises && tc.exercises.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-xs font-black">4</span>
                Məşq Tapşırıqları
              </h2>
              <ul className="space-y-3">
                {tc.exercises.map((ex: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                    <span className="w-6 h-6 bg-amber-400 text-white rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-gray-800 text-sm leading-relaxed">{ex}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Check questions */}
          {tc.checkQuestions && tc.checkQuestions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-extrabold text-gray-900 mb-4">🧐 Yoxlama Sualları</h2>
              <ul className="space-y-2">
                {tc.checkQuestions.map((q: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                    <span className="text-violet-400 font-bold shrink-0">?</span> {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next step */}
          {tc.nextStep && (
            <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-2xl border border-violet-100 p-5">
              <p className="text-xs font-bold text-violet-500 uppercase tracking-wide mb-1">Növbəti Addım</p>
              <p className="text-gray-800 leading-relaxed">{tc.nextStep}</p>
            </div>
          )}
        </div>
      )}

      {/* Video script (if no text content) */}
      {vs && !tc && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-extrabold text-gray-900 mb-4">Video Ssenarisi</h2>
            {Object.entries(vs).map(([key, val]: any) => (
              <div key={key} className="mb-4 pb-4 border-b border-gray-50 last:border-0 last:mb-0 last:pb-0">
                <p className="text-violet-500 text-xs font-bold uppercase mb-1">{key}</p>
                <p className="text-gray-700 leading-relaxed">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete button */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        {!done ? (
          <button
            onClick={markComplete}
            disabled={marking}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-extrabold py-4 rounded-2xl hover:bg-violet-700 transition disabled:opacity-60 text-lg"
          >
            {marking ? 'Yüklənir...' : <><CheckCircle size={22} /> Dərsi Tamamladım</>}
          </button>
        ) : (
          <div className="bg-green-50 rounded-2xl p-5 text-center">
            <CheckCircle size={28} className="text-green-500 mx-auto mb-2" />
            <p className="font-extrabold text-green-800 text-lg">Tamamlandı! 🎉</p>
          </div>
        )}

        {/* Certificate button — always shown once done */}
        {done && (
          <Link
            href={existingCertId ? `/certificate/${existingCertId}` : `/certificate/generate?lessonId=${lessonId}`}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-amber-400 text-amber-900 font-extrabold py-4 rounded-2xl hover:bg-amber-500 transition text-lg"
          >
            <Trophy size={22} /> Sertifikat Al
          </Link>
        )}

        {/* Next lesson */}
        {done && nextLesson && (
          <Link
            href={`/lessons/${nextLesson.id}`}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition"
          >
            Növbəti: {nextLesson.title} <ChevronRight size={18} />
          </Link>
        )}
      </div>

      {/* Completion modal */}
      {showComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowComplete(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Əla!</h2>
            <p className="text-gray-500 mb-4">Bu dərsi uğurla tamamladınız.</p>
            <Link
              href={existingCertId ? `/certificate/${existingCertId}` : `/certificate/generate?lessonId=${lessonId}`}
              className="block bg-amber-400 text-amber-900 font-extrabold py-3 rounded-xl hover:bg-amber-500 transition mb-3"
              onClick={() => setShowComplete(false)}
            >
              <Trophy size={18} className="inline mr-2" />
              Sertifikat Al
            </Link>
            {nextLesson && (
              <Link
                href={`/lessons/${nextLesson.id}`}
                className="block bg-violet-600 text-white font-extrabold py-3 rounded-xl hover:bg-violet-700 transition"
                onClick={() => setShowComplete(false)}
              >
                Növbəti Dərse Keç →
              </Link>
            )}
            <button
              onClick={() => setShowComplete(false)}
              className="mt-3 text-sm text-gray-400 hover:text-gray-600 w-full"
            >
              Bağla
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
