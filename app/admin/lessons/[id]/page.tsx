'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Save, Eye, EyeOff, Loader2,
  CheckCircle, MessageSquare, ThumbsUp, ThumbsDown, Minus,
} from 'lucide-react'

const CATEGORIES = [
  'Kommunikasiya Bacarıqları',
  'Liderlik və Komanda',
  'Düşüncə Sistemi',
  'Danışıqlar və Təsir',
  'Şəxsi Effektivlik',
  'Karyera İnkişafı',
]

const SENTIMENT_ICON: Record<string, React.ReactNode> = {
  positive: <ThumbsUp size={13} className="text-green-400" />,
  negative: <ThumbsDown size={13} className="text-red-400" />,
  neutral:  <Minus size={13} className="text-gray-500" />,
}

const SENTIMENT_COLOR: Record<string, string> = {
  positive: 'bg-green-900/20 border-green-700/30',
  negative: 'bg-red-900/20 border-red-700/30',
  neutral:  'bg-gray-800 border-gray-700',
}

export default function AdminLessonEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [lesson, setLesson] = useState<any>(null)
  const [feedback, setFeedback] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Editable fields
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    format: 'both',
    duration: 900,
    isFree: false,
    isPublished: false,
    tags: '',
  })

  useEffect(() => {
    fetch(`/api/lessons/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.lesson) {
          const l = data.lesson
          setLesson(l)
          setForm({
            title: l.title ?? '',
            description: l.description ?? '',
            category: l.category ?? '',
            difficulty: l.difficulty ?? 'beginner',
            format: l.format ?? 'both',
            duration: l.duration ?? 900,
            isFree: l.isFree ?? false,
            isPublished: l.isPublished ?? false,
            tags: (l.tags ?? []).join(', '),
          })
        }
        setFeedback(data.feedback ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)

    const res = await fetch(`/api/lessons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        duration: Number(form.duration),
        tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || 'Xəta baş verdi'); return }
    setLesson(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const positiveCount = feedback.filter(f => f.sentiment === 'positive').length
  const negativeCount = feedback.filter(f => f.sentiment === 'negative').length
  const neutralCount  = feedback.filter(f => f.sentiment === 'neutral').length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-violet-500" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="text-center py-24 text-gray-500">
        Dərs tapılmadı.{' '}
        <Link href="/admin/lessons" className="text-violet-400 hover:underline">Geri qayıt</Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/lessons" className="text-gray-400 hover:text-white transition">
          <ArrowLeft size={22} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold text-white truncate">{lesson.title}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {lesson.aiGenerated ? '⚡ AI yaradılmış' : '📝 Manual'} · ID: {id}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-violet-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-violet-700 transition disabled:opacity-50"
        >
          {saving
            ? <><Loader2 size={16} className="animate-spin" /> Saxlanır...</>
            : saved
            ? <><CheckCircle size={16} className="text-green-300" /> Saxlandı!</>
            : <><Save size={16} /> Saxla</>}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Edit form */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h2 className="text-white font-bold mb-5">Dərs Məlumatları</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">Başlıq</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">Açıqlama</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
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
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">
                  Müddət: {Math.round(Number(form.duration) / 60)} dəqiqə
                </label>
                <input
                  type="range"
                  min={300} max={1800} step={60}
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>5 dəq</span><span>30 dəq</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1.5">Teqlər (vergüllə)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="kommunikasiya, liderlik, başlanğıc"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Toggles */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isPublished: !form.isPublished })}
                  className={`flex items-center gap-2 flex-1 py-3 rounded-xl font-bold text-sm border-2 transition ${
                    form.isPublished
                      ? 'bg-green-600 border-green-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {form.isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
                  {form.isPublished ? 'Yayımda' : 'Gizli'}
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isFree: !form.isFree })}
                  className={`flex items-center gap-2 flex-1 py-3 rounded-xl font-bold text-sm border-2 transition ${
                    form.isFree
                      ? 'bg-amber-600 border-amber-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {form.isFree ? '🆓 Pulsuz' : '🔒 Pro'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback panel */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare size={18} className="text-blue-400" />
            <h2 className="text-white font-bold">İstifadəçi Rəyləri</h2>
            <span className="ml-auto text-xs font-bold text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full">
              {feedback.length} rəy
            </span>
          </div>

          {/* Sentiment summary */}
          {feedback.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-3 text-center">
                <div className="text-xl font-extrabold text-green-400">{positiveCount}</div>
                <div className="text-green-500 text-xs mt-0.5">Müsbət</div>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-center">
                <div className="text-xl font-extrabold text-gray-300">{neutralCount}</div>
                <div className="text-gray-500 text-xs mt-0.5">Neytral</div>
              </div>
              <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-3 text-center">
                <div className="text-xl font-extrabold text-red-400">{negativeCount}</div>
                <div className="text-red-500 text-xs mt-0.5">Mənfi</div>
              </div>
            </div>
          )}

          {/* Feedback list */}
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {feedback.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Bu dərs üçün hələ rəy yoxdur</p>
              </div>
            ) : (
              feedback.map((f: any) => (
                <div
                  key={f.id}
                  className={`rounded-xl border p-4 ${SENTIMENT_COLOR[f.sentiment] ?? SENTIMENT_COLOR.neutral}`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="shrink-0 mt-0.5">{SENTIMENT_ICON[f.sentiment]}</span>
                    <p className="text-gray-200 text-sm leading-relaxed flex-1">{f.content}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-500 text-xs">
                      {f.User?.name || f.User?.email || 'Anonim'}
                    </span>
                    <span className="text-gray-600 text-xs">
                      {new Date(f.createdAt).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
