'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Lock, Play, Trophy, BookOpen, Headphones, X, Award, ChevronRight } from 'lucide-react'

interface Lesson {
  id: string
  order: number
  title: string
  description: string | null
  difficulty: string
  durationSeconds: number
}

interface Props {
  programId: string
  programTitle: string
  skillLabel: string
  skillIcon: string
  gradientColor: string
  lessons: Lesson[]
  progressMap: Record<string, boolean>
  completedCount: number
  totalCount: number
  allDone: boolean
  examResult: { score: number; passed: boolean } | null
}

const ZIGZAG = ['center', 'right', 'center', 'left'] as const
type Position = typeof ZIGZAG[number]

const difficultyLabel: Record<string, string> = {
  beginner: 'Başlanğıc',
  intermediate: 'Orta',
  advanced: 'İrəliləmiş',
}

const unitLabels = ['Başlanğıc Səviyyə', 'Orta Səviyyə', 'İrəliləmiş Səviyyə']

export default function SkillProgramMap({
  programId, programTitle, skillLabel, skillIcon, gradientColor,
  lessons, progressMap, completedCount, totalCount, allDone, examResult,
}: Props) {
  const [popup, setPopup] = useState<Lesson | null>(null)
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const nextLesson = lessons.find(l => !progressMap[l.id])

  function getNodeState(lesson: Lesson): 'done' | 'next' | 'locked' {
    if (progressMap[lesson.id]) return 'done'
    if (lesson.id === nextLesson?.id) return 'next'
    return 'locked'
  }

  // Group into units of 4 lessons
  const units: Lesson[][] = []
  for (let i = 0; i < lessons.length; i += 4) {
    units.push(lessons.slice(i, i + 4))
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* ── Sidebar ── */}
      <div className="w-full lg:w-64 shrink-0 space-y-4">
        {/* Progress card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{skillIcon}</span>
            <div className="min-w-0">
              <p className="font-extrabold text-gray-900 text-sm truncate">{skillLabel}</p>
              <p className="text-xs text-gray-400 truncate">{programTitle}</p>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${gradientColor}, #3b82f6)` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{completedCount}/{totalCount} dərs</span>
            <span className="font-bold" style={{ color: gradientColor }}>{pct}%</span>
          </div>
        </div>

        {/* Certificate card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
            <Award size={24} className="text-amber-500" />
          </div>
          {examResult?.passed ? (
            <>
              <p className="font-extrabold text-gray-900 text-sm mb-1">Sertifikat Hazırdır!</p>
              <p className="text-xs text-gray-400 mb-3">İmtahan: {examResult.score}%</p>
              <Link
                href={`/certificate/skill/${programId}`}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-2 rounded-xl hover:bg-amber-200 transition"
              >
                <Award size={13} /> Sertifikata Bax
              </Link>
            </>
          ) : (
            <>
              <p className="font-extrabold text-gray-900 text-sm mb-1">Sertifikatı Qazanın</p>
              <p className="text-xs text-gray-400 mb-3">
                {allDone ? 'İmtahana girmək üçün hazırsınız!' : 'Bütün dərslər bitdikdən sonra sertifikat əldə edin.'}
              </p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{pct}% tamamlandı</p>
            </>
          )}
        </div>

        {/* Exam CTA */}
        {allDone && !examResult && (
          <Link
            href={`/program/${programId}/exam`}
            className="flex items-center justify-center gap-2 bg-amber-400 text-amber-900 font-extrabold py-3 rounded-2xl hover:bg-amber-500 transition text-sm"
          >
            <Trophy size={18} /> Yekun İmtahana Gir
          </Link>
        )}
        {examResult && !examResult.passed && (
          <Link
            href={`/program/${programId}/exam`}
            className="flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 rounded-2xl hover:bg-red-600 transition text-sm"
          >
            <Trophy size={16} /> Yenidən Cəhd Et
          </Link>
        )}
      </div>

      {/* ── Journey Map ── */}
      <div className="flex-1 min-w-0">
        {units.map((unitLessons, unitIdx) => (
          <div key={unitIdx} className="mb-2">
            {/* Unit header */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className="px-4 py-2 rounded-2xl text-white text-xs font-extrabold uppercase tracking-wider shrink-0"
                style={{ background: `linear-gradient(135deg, ${gradientColor}, #3b82f6)` }}
              >
                Vahid {unitIdx + 1}
              </div>
              <span className="text-sm font-semibold text-gray-400">{unitLabels[unitIdx] ?? `Vahid ${unitIdx + 1}`}</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Nodes */}
            <div className="relative">
              {/* Vertical track line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2 z-0" />

              {unitLessons.map((lesson, lessonIdx) => {
                const globalIdx = unitIdx * 4 + lessonIdx
                const pos: Position = ZIGZAG[globalIdx % 4]
                const state = getNodeState(lesson)

                return (
                  <div
                    key={lesson.id}
                    className={`relative z-10 flex mb-10 ${
                      pos === 'left' ? 'justify-start' :
                      pos === 'right' ? 'justify-end' :
                      'justify-center'
                    }`}
                  >
                    <button
                      onClick={() => state !== 'locked' && setPopup(lesson)}
                      className={`flex flex-col items-center gap-2 group focus:outline-none ${state === 'locked' ? 'cursor-default opacity-50' : 'cursor-pointer'}`}
                    >
                      {/* Node circle */}
                      <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-transform ${
                        state === 'done'
                          ? 'bg-emerald-500 group-hover:scale-105'
                          : state === 'next'
                          ? 'group-hover:scale-105'
                          : 'bg-gray-200'
                      }`}
                      style={state === 'next' ? { background: `linear-gradient(135deg, ${gradientColor}, #3b82f6)` } : undefined}
                      >
                        {state === 'done' && <CheckCircle size={28} className="text-white" />}
                        {state === 'next' && (
                          <>
                            <Play size={26} className="text-white fill-white" />
                            {/* Pulse ring */}
                            <span className="absolute inset-0 rounded-2xl animate-ping opacity-30"
                              style={{ background: gradientColor }} />
                          </>
                        )}
                        {state === 'locked' && <Lock size={22} className="text-gray-400" />}
                      </div>

                      {/* Label */}
                      <div className="text-center max-w-[120px]">
                        <p className={`text-xs font-bold leading-tight ${
                          state === 'done' ? 'text-emerald-700' :
                          state === 'next' ? 'text-gray-900' :
                          'text-gray-400'
                        }`}>
                          {lesson.title}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {difficultyLabel[lesson.difficulty] ?? lesson.difficulty}
                        </p>
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Final Exam / Trophy node */}
        <div className="relative z-10 flex justify-center mt-4">
          {allDone && !examResult ? (
            <Link
              href={`/program/${programId}/exam`}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Trophy size={36} className="text-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-extrabold text-amber-700">Yekun İmtahan</p>
                <p className="text-xs text-gray-400">Sertifikat üçün keç</p>
              </div>
            </Link>
          ) : examResult?.passed ? (
            <Link
              href={`/certificate/skill/${programId}`}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Trophy size={36} className="text-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-extrabold text-amber-700">Sertifikat — {examResult.score}%</p>
                <p className="text-xs text-gray-400">Sertifikata bax</p>
              </div>
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-40">
              <div className="w-20 h-20 rounded-2xl bg-gray-200 flex items-center justify-center">
                <Trophy size={36} className="text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-gray-400">Yekun İmtahan</p>
                <p className="text-[10px] text-gray-300">Bütün dərslər bitdikdən sonra</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Lesson Popup ── */}
      {popup && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setPopup(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Difficulty badge */}
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                popup.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                popup.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {difficultyLabel[popup.difficulty] ?? popup.difficulty}
              </span>
              <button onClick={() => setPopup(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Title */}
            <h3 className="font-extrabold text-gray-900 text-lg leading-snug mb-2">
              {popup.title}
            </h3>
            {popup.description && (
              <p className="text-gray-500 text-sm leading-relaxed mb-5">
                {popup.description}
              </p>
            )}

            {/* Duration */}
            <p className="text-xs text-gray-400 mb-5">
              ⏱ ~{Math.round((popup.durationSeconds ?? 720) / 60)} dəqiqə
            </p>

            {/* CTA buttons */}
            <div className="space-y-2">
              <Link
                href={`/program/${programId}/lesson/${popup.id}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-white transition"
                style={{ background: `linear-gradient(135deg, ${gradientColor}, #3b82f6)` }}
                onClick={() => setPopup(null)}
              >
                <BookOpen size={18} /> Oxu
              </Link>
              <Link
                href={`/program/${programId}/lesson/${popup.id}?mode=listen`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold bg-gray-900 text-white hover:bg-gray-800 transition"
                onClick={() => setPopup(null)}
              >
                <Headphones size={18} /> Dinlə
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
