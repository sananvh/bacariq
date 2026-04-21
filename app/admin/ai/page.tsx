'use client'

import { useState } from 'react'
import { Zap, Loader2, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface AILessonContent {
  title: string
  description: string
  learningOutcomes?: string[]
  videoScript?: Record<string, string>
  textContent?: Record<string, string | string[]>
}
interface GenerateResult {
  aiContent: AILessonContent
}

const CATEGORIES = [
  'Kommunikasiya Bacarıqları',
  'Liderlik və Komanda',
  'Düşüncə Sistemi',
  'Danışıqlar və Təsir',
  'Şəxsi Effektivlik',
  'Karyera İnkişafı',
]

export default function AdminAIPage() {
  const [form, setForm] = useState({
    title: '',
    category: CATEGORIES[0],
    format: 'both',
    difficulty: 'beginner',
    targetMinutes: 15,
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  async function handleGenerate() {
    if (!form.title.trim()) { setError('Başlıq daxil edin'); return }
    setLoading(true)
    setError('')
    setResult(null)

    const res = await fetch('/api/ai/generate-lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error || 'Xəta baş verdi'); return }
    setResult(data)
  }

  const content = result?.aiContent

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">AI Motor — Dərs Generatoru</h1>
        <p className="text-gray-400 mt-1">Claude AI ilə yeni dərslər yarat</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-white font-bold mb-5 flex items-center gap-2">
            <Zap size={18} className="text-violet-400" /> Yeni Dərs Yarat
          </h2>

          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1.5">Dərs Başlığı</label>
              <input
                type="text"
                placeholder="məs. Effektiv E-poçt Yazma Texnikası"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1.5">Kateqoriya</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">Format</label>
                <select
                  value={form.format}
                  onChange={e => setForm({ ...form, format: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="both">Video + Mətn</option>
                  <option value="video">Yalnız Video</option>
                  <option value="text">Yalnız Mətn</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">Çətinlik</label>
                <select
                  value={form.difficulty}
                  onChange={e => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="beginner">Başlanğıc</option>
                  <option value="intermediate">Orta</option>
                  <option value="advanced">İrəliləmiş</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1.5">
                Müddət: {form.targetMinutes} dəqiqə
              </label>
              <input
                type="range"
                min={5} max={30} step={5}
                value={form.targetMinutes}
                onChange={e => setForm({ ...form, targetMinutes: Number(e.target.value) })}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 dəq</span><span>30 dəq</span>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl hover:bg-violet-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Yaradılır...</> : <><Zap size={18} /> AI ilə Yarat</>}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-white font-bold mb-5">Nəticə</h2>
          {!result && !loading && (
            <div className="text-center py-16 text-gray-600">
              <Zap size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">Dərs yaratmaq üçün formu doldurun</p>
            </div>
          )}
          {loading && (
            <div className="text-center py-16">
              <Loader2 size={40} className="mx-auto mb-4 text-violet-500 animate-spin" />
              <p className="text-gray-400 text-sm">Claude AI dərsi yaradır...</p>
              <p className="text-gray-600 text-xs mt-1">Bu 20-40 saniyə çəkə bilər</p>
            </div>
          )}
          {result && content && (
            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">
              <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                <CheckCircle size={16} /> Dərs yaradıldı və bazaya əlavə edildi!
              </div>

              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-white font-bold">{content.title}</p>
                <p className="text-gray-400 text-sm mt-1">{content.description}</p>
              </div>

              {/* Learning outcomes */}
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-xs font-bold uppercase mb-2">Öyrənmə Nəticələri</p>
                <ul className="space-y-1">
                  {(content.learningOutcomes ?? []).map((o: string, i: number) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-violet-400 shrink-0">✓</span> {o}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Video script sections */}
              {content.videoScript && (
                <div>
                  <button
                    onClick={() => setExpanded(expanded === 'video' ? null : 'video')}
                    className="flex items-center justify-between w-full bg-gray-800 rounded-xl p-4 text-left"
                  >
                    <span className="text-white font-semibold text-sm">Video Ssenarisi</span>
                    {expanded === 'video' ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>
                  {expanded === 'video' && (
                    <div className="bg-gray-800/50 rounded-b-xl px-4 pb-4 space-y-2 -mt-1 border border-gray-700 border-t-0">
                      {Object.entries(content.videoScript).map(([k, v]) => (
                        <div key={k} className="pt-3 border-t border-gray-700 first:border-0 first:pt-0">
                          <p className="text-violet-400 text-xs font-bold mb-1">{k.toUpperCase()}</p>
                          <p className="text-gray-300 text-sm">{v}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Text content */}
              {content.textContent && (
                <div>
                  <button
                    onClick={() => setExpanded(expanded === 'text' ? null : 'text')}
                    className="flex items-center justify-between w-full bg-gray-800 rounded-xl p-4 text-left"
                  >
                    <span className="text-white font-semibold text-sm">Mətn Məzmunu</span>
                    {expanded === 'text' ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>
                  {expanded === 'text' && (
                    <div className="bg-gray-800/50 rounded-b-xl px-4 pb-4 space-y-3 -mt-1 border border-gray-700 border-t-0">
                      {Object.entries(content.textContent).map(([k, v]) => (
                        <div key={k} className="pt-3 border-t border-gray-700 first:border-0 first:pt-0">
                          <p className="text-violet-400 text-xs font-bold mb-1">{k.toUpperCase()}</p>
                          {Array.isArray(v) ? (
                            <ul className="space-y-1">
                              {v.map((item: string, i: number) => (
                                <li key={i} className="text-gray-300 text-sm">• {item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-300 text-sm">{v}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
