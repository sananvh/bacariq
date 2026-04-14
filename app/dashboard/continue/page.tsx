import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { PlayCircle, Clock } from 'lucide-react'

export default async function ContinuePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: inProgress } = await supabase
    .from('LessonProgress')
    .select('lessonId, watchedSeconds, updatedAt, Lesson(id, title, category, duration, difficulty)')
    .eq('userId', user!.id)
    .eq('isCompleted', false)
    .gt('watchedSeconds', 0)
    .order('updatedAt', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Davam edirəm</h1>
        <p className="text-gray-500 mt-1">Yarımçıq qalan dərslərin</p>
      </div>

      {!inProgress || inProgress.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <PlayCircle size={40} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Hələ heç nə başlamamısan</h2>
          <p className="text-gray-500 text-sm mb-5">Bir dərsi başla, buradan davam edə bilərsən.</p>
          <Link
            href="/dashboard/lessons"
            className="bg-violet-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-violet-700 transition inline-block"
          >
            Dərslərə Bax
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {inProgress.map((p: any) => {
            const lesson = p.Lesson
            const dur = lesson?.duration || 900
            const pct = Math.min(100, Math.round((p.watchedSeconds / dur) * 100))
            const watchedMin = Math.floor(p.watchedSeconds / 60)
            const totalMin = Math.floor(dur / 60)

            return (
              <Link
                key={p.lessonId}
                href={`/lessons/${p.lessonId}`}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-5 hover:shadow-md hover:border-violet-200 transition"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shrink-0">
                  <PlayCircle size={26} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{lesson?.title}</p>
                  <p className="text-sm text-gray-500 mb-2">{lesson?.category}</p>
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span className="flex items-center gap-1"><Clock size={10} /> {watchedMin}/{totalMin} dəq</span>
                      <span className="font-bold text-violet-600">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-violet-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
                <span className="shrink-0 bg-violet-50 text-violet-700 text-xs font-bold px-3 py-1.5 rounded-full">
                  Davam et →
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
