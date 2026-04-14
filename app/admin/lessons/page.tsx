import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { BookOpen, CheckCircle, Eye, EyeOff, MessageSquare, Zap } from 'lucide-react'

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner:     'Başlanğıc',
  intermediate: 'Orta',
  advanced:     'İrəliləmiş',
}

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     'bg-green-900/30 text-green-400',
  intermediate: 'bg-yellow-900/30 text-yellow-400',
  advanced:     'bg-red-900/30 text-red-400',
}

export default async function AdminLessonsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: lessons } = await supabase
    .from('Lesson')
    .select('id, title, category, difficulty, format, duration, isFree, isPublished, aiGenerated, createdAt')
    .order('createdAt', { ascending: false })

  const lessonIds = (lessons ?? []).map((l: any) => l.id)

  // Feedback counts per lesson
  let feedbackMap: Record<string, number> = {}
  if (lessonIds.length > 0) {
    const { data: fb } = await supabase
      .from('Feedback')
      .select('lessonId')
      .in('lessonId', lessonIds)
    for (const f of fb ?? []) {
      feedbackMap[f.lessonId] = (feedbackMap[f.lessonId] ?? 0) + 1
    }
  }

  // Completion counts per lesson
  let completionMap: Record<string, number> = {}
  if (lessonIds.length > 0) {
    const { data: prog } = await supabase
      .from('LessonProgress')
      .select('lessonId')
      .eq('isCompleted', true)
      .in('lessonId', lessonIds)
    for (const p of prog ?? []) {
      completionMap[p.lessonId] = (completionMap[p.lessonId] ?? 0) + 1
    }
  }

  const published = (lessons ?? []).filter((l: any) => l.isPublished).length
  const aiGenerated = (lessons ?? []).filter((l: any) => l.aiGenerated).length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Dərslər</h1>
          <p className="text-gray-400 mt-1">Bütün dərslər — istifadəçi rəyləri ilə birlikdə</p>
        </div>
        <Link
          href="/admin/ai"
          className="flex items-center gap-2 bg-violet-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-violet-700 transition text-sm"
        >
          <Zap size={16} /> Yeni Dərs Yarat
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Ümumi', value: lessons?.length ?? 0 },
          { label: 'Yayımlanmış', value: published },
          { label: 'AI Yaradılmış', value: aiGenerated },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5 text-center">
            <div className="text-2xl font-extrabold text-white">{s.value}</div>
            <div className="text-gray-500 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Lessons table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              {['Dərs', 'Kateqoriya', 'Çətinlik', 'Rəylər', 'Tamamlama', 'Status', ''].map(h => (
                <th key={h} className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(lessons ?? []).map((lesson: any) => {
              const mins = Math.round((lesson.duration || 900) / 60)
              const fbCount = feedbackMap[lesson.id] ?? 0
              const doneCount = completionMap[lesson.id] ?? 0

              return (
                <tr key={lesson.id} className="hover:bg-gray-800/50 transition">
                  <td className="px-5 py-4 max-w-xs">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${lesson.aiGenerated ? 'bg-violet-900/50' : 'bg-gray-800'}`}>
                        {lesson.aiGenerated ? <Zap size={14} className="text-violet-400" /> : <BookOpen size={14} className="text-gray-500" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{lesson.title}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{mins} dəq · {lesson.format === 'both' ? 'Video+Mətn' : lesson.format === 'video' ? 'Video' : 'Mətn'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-gray-300 text-sm">{lesson.category}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${DIFFICULTY_COLOR[lesson.difficulty] ?? DIFFICULTY_COLOR.beginner}`}>
                      {DIFFICULTY_LABEL[lesson.difficulty] ?? lesson.difficulty}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <MessageSquare size={14} className={fbCount > 0 ? 'text-blue-400' : 'text-gray-600'} />
                      <span className="text-sm font-semibold">{fbCount}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <CheckCircle size={14} className={doneCount > 0 ? 'text-green-400' : 'text-gray-600'} />
                      <span className="text-sm font-semibold">{doneCount}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {lesson.isPublished ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-900/30 px-2.5 py-1 rounded-full">
                          <Eye size={11} /> Yayımda
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full">
                          <EyeOff size={11} /> Gizli
                        </span>
                      )}
                      {lesson.isFree && (
                        <span className="text-xs font-bold text-amber-400 bg-amber-900/30 px-2 py-1 rounded-full">Pulsuz</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/lessons/${lesson.id}`}
                      className="text-xs font-bold text-violet-400 hover:text-violet-300 transition"
                    >
                      Düzəliş →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!lessons || lessons.length === 0) && (
          <div className="text-center py-16 text-gray-600">
            <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
            <p>Hələ dərs yoxdur</p>
          </div>
        )}
      </div>
    </div>
  )
}
