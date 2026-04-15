'use client'

import { useState } from 'react'
import { TrendingUp, Loader2, Plus, CheckCircle, BarChart3, MessageSquare } from 'lucide-react'

interface SkillSuggestion {
  skill: string
  category: string
  demandLevel: string
  reasoning: string
  suggestedLesson: string
}

interface TrendData {
  topSkills: SkillSuggestion[]
  emergingTrends: string[]
  weeklyPlan: { priorityLessons: string[]; updateExisting: string[] }
  feedbackSummary?: string
  userPainPoints?: string[]
}

const demandColor: Record<string, string> = {
  'yüksək': 'text-green-400 bg-green-900/30 border-green-700/30',
  'orta':   'text-yellow-400 bg-yellow-900/30 border-yellow-700/30',
  'aşağı':  'text-gray-400 bg-gray-800 border-gray-700',
}

export default function AdminTrendsPage() {
  const [loading, setLoading] = useState(false)
  const [trends, setTrends] = useState<TrendData | null>(null)
  const [error, setError] = useState('')
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState<string | null>(null)

  async function fetchTrends() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/ai/trends')
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Xəta'); return }
    setTrends(data)
  }

  async function addToCurriculum(suggestion: SkillSuggestion) {
    setAdding(suggestion.skill)
    const res = await fetch('/api/admin/add-trend-skill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suggestion }),
    })
    if (res.ok) {
      setAdded(prev => new Set([...prev, suggestion.skill]))
    }
    setAdding(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Trend Analizi</h1>
          <p className="text-gray-400 mt-1">İstifadəçi rəyləri + Azərbaycan bazarı əsasında bacarıq tövsiyələri</p>
        </div>
        <button
          onClick={fetchTrends}
          disabled={loading}
          className="flex items-center gap-2 bg-violet-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-violet-700 transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
          {loading ? 'Analiz edilir...' : 'AI ilə Analiz Et'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {!trends && !loading && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-20 text-center">
          <TrendingUp size={48} className="mx-auto mb-4 text-gray-700" />
          <p className="text-gray-400 font-semibold mb-2">AI ilə Trend Analizi Başladın</p>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            Sistem istifadəçi rəylərini, tamamlanan dərsləri və Azərbaycan iş bazarı trendlərini
            birlikdə analiz edib kurikuluma əlavə etmək üçün bacarıq tövsiyələri hazırlayır.
          </p>
        </div>
      )}

      {loading && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-20 text-center">
          <Loader2 size={48} className="mx-auto mb-4 text-violet-500 animate-spin" />
          <p className="text-gray-300 font-semibold mb-1">Analiz edilir...</p>
          <p className="text-gray-500 text-sm">İstifadəçi rəyləri + bazar trendləri + feedback məlumatları</p>
        </div>
      )}

      {trends && (
        <div className="space-y-6">
          {/* Feedback summary */}
          {trends.feedbackSummary && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-3 flex items-center gap-2">
                <MessageSquare size={17} className="text-blue-400" /> İstifadəçi Rəylərinin Xülasəsi
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">{trends.feedbackSummary}</p>
              {(trends.userPainPoints ?? []).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {trends.userPainPoints!.map((p, i) => (
                    <span key={i} className="text-xs bg-blue-900/30 text-blue-300 border border-blue-700/30 px-3 py-1 rounded-full">
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Skill suggestions */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-5 flex items-center gap-2">
              <TrendingUp size={17} className="text-violet-400" /> Tövsiyə Olunan Bacarıqlar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(trends.topSkills ?? []).map((skill, i) => {
                const isAdded = added.has(skill.skill)
                const isAdding = adding === skill.skill
                return (
                  <div key={i} className="bg-gray-800 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white font-semibold text-sm">{skill.skill}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 border ${demandColor[skill.demandLevel] ?? demandColor['orta']}`}>
                        {skill.demandLevel}
                      </span>
                    </div>
                    <p className="text-violet-400 text-xs">{skill.category}</p>
                    <p className="text-gray-400 text-xs leading-relaxed flex-1">{skill.reasoning}</p>
                    {skill.suggestedLesson && (
                      <div className="bg-violet-900/20 border border-violet-700/30 rounded-lg px-3 py-2">
                        <p className="text-violet-300 text-xs">💡 {skill.suggestedLesson}</p>
                      </div>
                    )}
                    <button
                      onClick={() => addToCurriculum(skill)}
                      disabled={isAdded || isAdding}
                      className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-bold transition ${
                        isAdded
                          ? 'bg-green-900/30 text-green-400 border border-green-700/30 cursor-default'
                          : 'bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50'
                      }`}
                    >
                      {isAdding ? (
                        <><Loader2 size={12} className="animate-spin" /> Əlavə edilir...</>
                      ) : isAdded ? (
                        <><CheckCircle size={12} /> Kurikuluma Əlavə Edildi</>
                      ) : (
                        <><Plus size={12} /> Kurikuluma Əlavə Et</>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Emerging trends */}
          {(trends.emergingTrends ?? []).length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-4">Yüksələn Trendlər</h2>
              <div className="flex flex-wrap gap-2">
                {trends.emergingTrends.map((t, i) => (
                  <span key={i} className="bg-blue-900/30 text-blue-300 border border-blue-700/30 text-sm font-medium px-3 py-1.5 rounded-full">
                    ↑ {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Weekly plan */}
          {trends.weeklyPlan && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold mb-4">Tövsiyə Olunan Fəaliyyət Planı</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Yeni Generasiya Et</p>
                  <ul className="space-y-2">
                    {(trends.weeklyPlan.priorityLessons ?? []).map((l, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                        <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-400 text-xs flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Mövcud Dərsləri Yenilə</p>
                  <ul className="space-y-2">
                    {(trends.weeklyPlan.updateExisting ?? []).map((l, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                        <span className="text-yellow-400">↻</span> {l}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
