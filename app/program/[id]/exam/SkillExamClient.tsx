'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Trophy, RotateCcw, Award } from 'lucide-react'
import Link from 'next/link'

interface Question {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

interface ExamResult {
  id: string
  score: number
  passed: boolean
  answers?: number[]
}

interface Props {
  programId: string
  programTitle: string
  skillLabel: string
  questions: Question[]
  existingResult: ExamResult | null
  userName: string
}

export default function SkillExamClient({ programId, programTitle, skillLabel, questions, existingResult, userName }: Props) {
  const router = useRouter()
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null))
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<ExamResult | null>(existingResult)
  const [submitting, setSubmitting] = useState(false)
  const [showReview, setShowReview] = useState(false)

  const allAnswered = answers.every(a => a !== null)

  async function handleSubmit() {
    if (!allAnswered || submitting) return
    setSubmitting(true)

    const correct = questions.filter((q, i) => answers[i] === q.correctIndex).length
    const score = Math.round((correct / questions.length) * 100)
    const passed = score >= 70

    const res = await fetch('/api/skill-exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programId, answers, score, passed }),
    })
    const json = await res.json()

    setResult({ id: json.resultId, score, passed, answers: answers as number[] })
    setSubmitted(true)
    setSubmitting(false)
    router.refresh()
  }

  // Show prior result without review mode
  if (result && !showReview) {
    return (
      <div className="space-y-6">
        <div className={`rounded-3xl p-8 text-center ${result.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-100'}`}>
          <div className="text-6xl mb-4">{result.passed ? '🏆' : '😔'}</div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            {result.passed ? 'Təbriklər!' : 'Heyf...'}
          </h1>
          <p className="text-gray-500 mb-6">
            {result.passed
              ? `Siz imtahandan ${result.score}% nəticə ilə keçdiniz!`
              : `Nəticəniz ${result.score}%. Keçid balı 70%-dir.`}
          </p>
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-white shadow-lg mb-6"
            style={{ background: result.passed ? '#16a34a' : '#dc2626' }}>
            <span className="text-white text-3xl font-extrabold">{result.score}%</span>
          </div>

          {result.passed && (
            <Link
              href={`/certificate/skill/${programId}`}
              className="flex items-center justify-center gap-2 bg-amber-400 text-amber-900 font-extrabold py-4 rounded-2xl hover:bg-amber-500 transition text-lg mb-3"
            >
              <Award size={22} /> Sertifikatı Gör
            </Link>
          )}

          {!result.passed && (
            <Link
              href={`/program/${programId}`}
              className="flex items-center justify-center gap-2 bg-violet-600 text-white font-bold py-4 rounded-2xl hover:bg-violet-700 transition mb-3"
            >
              <RotateCcw size={18} /> Dərsləri Təkrarla
            </Link>
          )}

          <button
            onClick={() => setShowReview(true)}
            className="w-full text-sm text-gray-400 hover:text-gray-600 py-2"
          >
            Cavabları nəzərdən keç
          </button>
        </div>
      </div>
    )
  }

  // Review mode — show questions with correct/wrong answers
  if (result && showReview) {
    const storedAnswers = result.answers ?? answers as number[]
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-extrabold text-gray-900 text-xl">İmtahan Nəticəsi — {result.score}%</h2>
          <button onClick={() => setShowReview(false)} className="text-sm text-violet-600 hover:underline">← Geri</button>
        </div>
        {questions.map((q, i) => {
          const chosen = storedAnswers[i]
          const isCorrect = chosen === q.correctIndex
          return (
            <div key={i} className={`rounded-2xl border p-5 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-start gap-3 mb-3">
                {isCorrect
                  ? <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
                  : <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />}
                <p className="font-semibold text-gray-900 text-sm">{i + 1}. {q.question}</p>
              </div>
              <ul className="space-y-1 mb-3 ml-8">
                {q.options.map((opt, j) => (
                  <li key={j} className={`text-sm px-3 py-1.5 rounded-lg
                    ${j === q.correctIndex ? 'bg-green-200 text-green-900 font-semibold' : ''}
                    ${j === chosen && !isCorrect ? 'bg-red-200 text-red-900 line-through' : ''}
                    ${j !== q.correctIndex && j !== chosen ? 'text-gray-600' : ''}
                  `}>
                    {opt}
                  </li>
                ))}
              </ul>
              {!isCorrect && (
                <p className="text-xs text-gray-500 ml-8 bg-white rounded-lg px-3 py-2 border border-gray-100">
                  {q.explanation}
                </p>
              )}
            </div>
          )
        })}
        <button
          onClick={() => setShowReview(false)}
          className="w-full py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
        >
          ← Nəticəyə Qayıt
        </button>
      </div>
    )
  }

  // Exam taking mode
  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <Trophy size={40} className="text-gray-200 mx-auto mb-4" />
        <p className="text-gray-400">İmtahan sualları hələ hazır deyil.</p>
        <Link href={`/program/${programId}`} className="mt-4 inline-block text-violet-600 hover:underline text-sm">
          Proqrama Qayıt
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-blue-600 rounded-3xl p-6 text-white">
        <div className="text-3xl mb-2">📝</div>
        <h1 className="text-xl font-extrabold mb-1">Yekun İmtahan</h1>
        <p className="text-white/80 text-sm">{programTitle}</p>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">{questions.length} sual</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">Keçid: 70%</span>
        </div>
      </div>

      {/* Questions */}
      {questions.map((q, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="font-bold text-gray-900 mb-4 text-sm leading-relaxed">
            <span className="text-violet-500 font-extrabold mr-2">{i + 1}.</span>
            {q.question}
          </p>
          <ul className="space-y-2">
            {q.options.map((opt, j) => (
              <li key={j}>
                <button
                  onClick={() => {
                    const next = [...answers]
                    next[i] = j
                    setAnswers(next)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition font-medium
                    ${answers[i] === j
                      ? 'border-violet-500 bg-violet-50 text-violet-900'
                      : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <span className="font-bold text-violet-400 mr-2">{String.fromCharCode(65 + j)}.</span>
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>{answers.filter(a => a !== null).length}/{questions.length} cavablandı</span>
          <span>{Math.round((answers.filter(a => a !== null).length / questions.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all"
            style={{ width: `${(answers.filter(a => a !== null).length / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-extrabold py-4 rounded-2xl hover:bg-violet-700 transition disabled:opacity-50 text-lg"
      >
        {submitting ? 'Yoxlanılır...' : <><Trophy size={20} /> İmtahanı Bitir</>}
      </button>
    </div>
  )
}
