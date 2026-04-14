'use client'

import { useState } from 'react'
import { TrendingUp, Loader2, RefreshCw } from 'lucide-react'

export default function AdminTrendsPage() {
  const [loading, setLoading] = useState(false)
  const [trends, setTrends] = useState<any>(null)
  const [error, setError] = useState('')

  async function fetchTrends() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/ai/trends')
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Xəta'); return }
    setTrends(data)
  }

  const demandColor: Record<string, string> = {
    'yüksək': 'text-green-400 bg-green-900/30',
    'orta':   'text-yellow-400 bg-yellow-900/30',
    'aşağı':  'text-gray-400 bg-gray-800',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Trend Analizi</h1>
          <p className="text-gray-400 mt-1">Azərbaycan iş bazarında ən çox tələb olunan bacarıqlar</p>
        </div>
        <button
          onClick={fetchTrends}
          disabled={loading}
          className="flex items-center gap-2 bg-violet-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-violet-700 transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
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
          <p className="text-gray-500">AI ilə trend analizi başlatmaq üçün yuxarıdakı düyməyə basın</p>
          <p className="text-gray-600 text-sm mt-1">Analiz 15-20 saniyə çəkə bilər</p>
        </div>
      )}

      {loading && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-20 text-center">
          <Loader2 size={48} className="mx-auto mb-4 text-violet-500 animate-spin" />
          <p className="text-gray-400">Claude AI Azərbaycan bazarını analiz edir...</p>
        </div>
      )}

      {trends && (
        <div className="space-y-8">
          {/* Top skills */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="text-white font-bold mb-5 flex items-center gap-2">
              <TrendingUp size={18} className="text-violet-400" /> Prioritet Bacarıqlar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(trends.topSkills ?? []).map((skill: any, i: number) => (
                <div key={i} className="bg-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-white font-semibold">{skill.skill}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${demandColor[skill.demandLevel] || demandColor['orta']}`}>
                      {skill.demandLevel}
                    </span>
                  </div>
                  <p className="text-violet-400 text-xs mb-2">{skill.category}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{skill.reasoning}</p>
                  {skill.suggestedLesson && (
                    <div className="mt-3 bg-violet-900/20 border border-violet-700/30 rounded-lg px-3 py-2">
                      <p className="text-violet-300 text-xs font-medium">💡 Tövsiyə: {skill.suggestedLesson}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Weekly plan */}
          {trends.weeklyPlan && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h2 className="text-white font-bold mb-4">Həftəlik Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase mb-3">Yeni Yaradılacaq Dərslər</p>
                  <ul className="space-y-2">
                    {(trends.weeklyPlan.priorityLessons ?? []).map((l: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                        <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-400 text-xs flex items-center justify-center font-bold shrink-0">
                          {i + 1}
                        </span>
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase mb-3">Yenilənəcək Dərslər</p>
                  <ul className="space-y-2">
                    {(trends.weeklyPlan.updateExisting ?? []).map((l: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                        <span className="text-yellow-400">↻</span> {l}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Emerging trends */}
          {(trends.emergingTrends ?? []).length > 0 && (
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h2 className="text-white font-bold mb-4">Yüksələn Trendlər</h2>
              <div className="flex flex-wrap gap-2">
                {trends.emergingTrends.map((t: string, i: number) => (
                  <span key={i} className="bg-blue-900/30 text-blue-300 border border-blue-700/30 text-sm font-medium px-3 py-1.5 rounded-full">
                    ↑ {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
