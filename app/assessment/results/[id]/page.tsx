import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Brain, Sparkles } from 'lucide-react'
import CompetencyRadar from '@/components/CompetencyRadar'
import SkillSelector from '@/components/SkillSelector'
import ParadoxReport from '@/components/ParadoxReport'
import GeneratePlanButton from './GeneratePlanButton'
import { DIMENSIONS, type DimensionKey, getTopDimensions } from '@/lib/assessment-questions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AssessmentResultsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: result } = await supabase
    .from('AssessmentResult')
    .select('*')
    .eq('id', id)
    .eq('userId', user.id)
    .single()

  if (!result) notFound()

  const [{ data: profile }, { data: existingSkills }] = await Promise.all([
    supabase.from('User').select('subscriptionPlan, name').eq('id', user.id).single(),
    supabase.from('UserSkill').select('skillKey').eq('userId', user.id),
  ])

  const isPaid = profile?.subscriptionPlan === 'PRO' || profile?.subscriptionPlan === 'TEAM'
  const scores = result.scores as Record<DimensionKey, number>
  const aiPlan = result.aiPlan
  const { top, bottom } = getTopDimensions(scores)
  const existingSkillKeys = (existingSkills ?? []).map((s: { skillKey: string }) => s.skillKey as DimensionKey)
  const name = profile?.name || 'İstifadəçi'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain size={14} className="text-white" />
            </div>
            <span className="font-extrabold tracking-tight">
              Bacar<span className="text-violet-600">IQ</span>
            </span>
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 transition">
            İdarə Paneli →
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-sm font-bold px-4 py-2 rounded-full mb-4">
            <Sparkles size={14} /> Bacarıq Profil Nəticəsi
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Profiliniz hazırdır, {name}!
          </h1>
          <p className="text-gray-500 text-lg">
            Aşağıda kompetensiya xəritənizi görün, sonra inkişaf etdirmək istədiyiniz bacarığı seçin.
          </p>
        </div>

        {/* STEP 1 — Radar + Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Radar */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center">
            <h2 className="font-extrabold text-gray-900 text-lg mb-6 self-start">
              📊 Kompetensiya Xəritəniz
            </h2>
            <CompetencyRadar scores={scores} size={280} />
            <div className="grid grid-cols-2 gap-2 mt-6 w-full">
              {(Object.keys(scores) as DimensionKey[])
                .sort((a, b) => scores[b] - scores[a])
                .map(dim => (
                  <div key={dim} className="flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: DIMENSIONS[dim].color }} />
                    <span className="text-gray-600 truncate text-xs">{DIMENSIONS[dim].label}</span>
                    <span className="font-bold text-xs ml-auto" style={{ color: DIMENSIONS[dim].color }}>
                      {scores[dim]}%
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Strengths + Growth */}
          <div className="space-y-4">
            {/* AI summary */}
            {aiPlan?.profile && (
              <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-2xl border border-violet-100 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={15} className="text-violet-500" />
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wide">AI Profil Analizi</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{aiPlan.profile}</p>
              </div>
            )}

            {/* Top strengths */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-extrabold text-gray-900 mb-3 text-sm">💪 Güclü Tərəfləriniz</h3>
              <div className="space-y-2">
                {top.map(dim => {
                  const info = DIMENSIONS[dim]
                  return (
                    <div key={dim} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: info.bgColor }}>
                      <span className="text-xl">{info.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm">{info.label}</p>
                        <p className="text-gray-500 text-xs">{scores[dim]}% · Güclü sahə</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Growth areas */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-extrabold text-gray-900 mb-3 text-sm">🌱 İnkişaf Potensialı</h3>
              <div className="space-y-2">
                {bottom.map(dim => {
                  const info = DIMENSIONS[dim]
                  const quickWin = aiPlan?.growthAreas?.find((g: any) => g.dim === dim)?.quickWin
                  return (
                    <div key={dim} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xl">{info.icon}</span>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{info.label}</p>
                          <p className="text-gray-400 text-xs">{scores[dim]}% · İnkişaf sahəsi</p>
                        </div>
                      </div>
                      {quickWin && (
                        <p className="text-violet-700 text-xs font-semibold ml-8">💡 {quickWin}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* AI plan (paid) */}
            {isPaid && !aiPlan && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <p className="text-gray-500 text-sm mb-3">4 həftəlik fərdi planınızı yaradın</p>
                <GeneratePlanButton assessmentId={id} />
              </div>
            )}
          </div>
        </div>

        {/* Paradox / Synergy Report */}
        <div className="mb-10">
          <ParadoxReport scores={scores} name={name} />
        </div>

        {/* 4-week plan (paid + plan exists) */}
        {isPaid && aiPlan?.weeklyPlan && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-10">
            <h2 className="font-extrabold text-gray-900 text-xl mb-6">📅 4 Həftəlik İnkişaf Planınız</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiPlan.weeklyPlan.map((week: any) => (
                <div key={week.week} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 bg-violet-600 text-white rounded-lg flex items-center justify-center text-xs font-black">
                      {week.week}
                    </span>
                    <span className="text-xs font-bold text-violet-600 uppercase tracking-wide">{week.week}. Həftə</span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-sm mb-1">{week.focus}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed mb-2">{week.action}</p>
                  <Link
                    href={`/learn/${encodeURIComponent(week.lessonCategory)}`}
                    className="text-violet-600 text-xs font-semibold hover:underline"
                  >
                    → {week.lessonCategory}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — Skill Selection */}
        <div className="bg-white rounded-3xl border-2 border-violet-200 shadow-sm p-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              Addım 2
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              Hansı bacarığı inkişaf etdirmək istəyirsiniz?
            </h2>
            <p className="text-gray-500 text-sm">
              Seçdiyiniz bacarıq panelinizə əlavə olunacaq. Profilinizə uyğun tövsiyə olunan bacarıqlar işarələnib.
              {!isPaid && ' Pulsuz planda 1 bacarıq seçmək mümkündür.'}
            </p>
          </div>

          <SkillSelector
            assessmentId={id}
            scores={scores}
            existingSkillKeys={existingSkillKeys}
            isPaid={isPaid}
          />
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Testi yenidən keçmək istəyirsən?{' '}
          <Link href="/assessment/test" className="text-violet-600 hover:underline">Buraya klik et</Link>
        </p>
      </div>
    </div>
  )
}
