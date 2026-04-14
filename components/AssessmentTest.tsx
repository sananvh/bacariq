'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, CheckCircle, Loader2 } from 'lucide-react'
import { QUESTIONS, type DimensionKey } from '@/lib/assessment-questions'

export default function AssessmentTest() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, DimensionKey>>({})
  const [selected, setSelected] = useState<DimensionKey | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const question = QUESTIONS[current]
  const total = QUESTIONS.length
  const progress = ((current + 1) / total) * 100
  const isLast = current === total - 1
  const answeredCount = Object.keys(answers).length

  function handleSelect(dim: DimensionKey) {
    setSelected(dim)
  }

  function handleNext() {
    if (!selected) return
    const newAnswers = { ...answers, [question.id]: selected }
    setAnswers(newAnswers)

    if (isLast) {
      handleSubmit(newAnswers)
    } else {
      setCurrent(c => c + 1)
      setSelected(answers[QUESTIONS[current + 1]?.id] ?? null)
    }
  }

  function handleBack() {
    if (current === 0) return
    setCurrent(c => c - 1)
    setSelected(answers[QUESTIONS[current - 1]?.id] ?? null)
  }

  async function handleSubmit(finalAnswers: Record<number, DimensionKey>) {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Xəta baş verdi')
        setSubmitting(false)
        return
      }
      router.push(`/assessment/results/${data.id}`)
    } catch {
      setError('Şəbəkə xətası. Yenidən cəhd edin.')
      setSubmitting(false)
    }
  }

  if (submitting) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mb-6">
          <Loader2 size={36} className="text-violet-600 animate-spin" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Profiliniz Hazırlanır</h2>
        <p className="text-gray-500 text-lg">AI nəticələrinizi analiz edir...</p>
        <p className="text-gray-400 text-sm mt-2">Bu bir neçə saniyə çəkir</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2 font-medium">
          <span>Sual {current + 1} / {total}</span>
          <span>{answeredCount} cavablandırıldı</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-violet-50 text-violet-700 font-extrabold text-sm mb-5">
          {current + 1}
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 leading-snug mb-8">
          {question.text}
        </h2>

        <div className="space-y-3">
          {question.options.map((opt, i) => {
            const isChosen = selected === opt.dim
            return (
              <button
                key={i}
                onClick={() => handleSelect(opt.dim)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-150 ${
                  isChosen
                    ? 'border-violet-500 bg-violet-50 shadow-sm'
                    : 'border-gray-100 bg-gray-50 hover:border-violet-200 hover:bg-violet-50/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isChosen ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
                  }`}>
                    {isChosen && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <p className={`text-sm leading-relaxed font-medium ${isChosen ? 'text-violet-900' : 'text-gray-700'}`}>
                    {opt.text}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm text-center mb-4">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handleBack}
          disabled={current === 0}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 hover:text-gray-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} /> Əvvəlki
        </button>

        <button
          onClick={handleNext}
          disabled={!selected}
          className="flex items-center gap-2 bg-violet-600 text-white font-extrabold px-8 py-3 rounded-2xl hover:bg-violet-700 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {isLast ? 'Nəticəyə Bax' : 'Növbəti'}
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Question dots */}
      <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
        {QUESTIONS.map((q, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current
                ? 'w-5 bg-violet-600'
                : answers[q.id]
                ? 'bg-violet-300'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
