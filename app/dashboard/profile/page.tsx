import { createServerSupabaseClient } from '@/lib/supabase-server'
import { User, Mail, Calendar, Crown } from 'lucide-react'
import Link from 'next/link'
import { DIMENSIONS, type DimensionKey } from '@/lib/assessment-questions'

const PLAN_INFO: Record<string, { label: string; desc: string; color: string }> = {
  FREE:  { label: 'Pulsuz',  desc: '3 tanıtım dərsinə giriş',         color: 'bg-gray-100 text-gray-700' },
  PRO:   { label: 'Pro',     desc: 'Bütün dərslərə + AI tövsiyəsi',   color: 'bg-violet-100 text-violet-700' },
  TEAM:  { label: 'Komanda', desc: '5 üzv + komanda analitikası',      color: 'bg-blue-100 text-blue-700' },
}

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('User')
    .select('name, email, subscriptionPlan, subscriptionStatus, createdAt')
    .eq('id', user!.id)
    .single()

  const { data: userSkills } = await supabase
    .from('UserSkill')
    .select('skillKey, skillLabel, skillIcon')
    .eq('userId', user!.id)
    .order('addedAt', { ascending: true })

  const { data: latestAssessment } = await supabase
    .from('AssessmentResult')
    .select('id')
    .eq('userId', user!.id)
    .order('createdAt', { ascending: false })
    .limit(1)
    .maybeSingle()

  const name    = profile?.name || user?.email?.split('@')[0] || 'İstifadəçi'
  const email   = profile?.email || user?.email || ''
  const initials = name.slice(0, 2).toUpperCase()
  const plan    = profile?.subscriptionPlan || 'FREE'
  const planInfo = PLAN_INFO[plan] ?? PLAN_INFO.FREE
  const isPaid  = plan === 'PRO' || plan === 'TEAM'
  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''
  const skills = userSkills ?? []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Profilim</h1>
        <p className="text-gray-500 mt-1">Hesab məlumatları və abunəlik</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100">
            <div className="w-20 h-20 rounded-full bg-violet-600 text-white flex items-center justify-center text-2xl font-extrabold">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
              <p className="text-gray-500 text-sm">{email}</p>
              <span className={`mt-2 inline-block text-xs font-semibold px-3 py-1 rounded-full ${planInfo.color}`}>
                {planInfo.label} Plan
              </span>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                <User size={17} className="text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Ad Soyad</p>
                <p className="font-semibold text-gray-800">{name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                <Mail size={17} className="text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">E-poçt</p>
                <p className="font-semibold text-gray-800">{email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                <Calendar size={17} className="text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Qeydiyyat tarixi</p>
                <p className="font-semibold text-gray-800">{joinDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900">Aktiv Bacarıqlar</h3>
            <Link
              href={latestAssessment ? `/assessment/results/${latestAssessment.id}` : '/assessment/test'}
              className="text-sm text-violet-600 hover:text-violet-800 font-semibold transition"
            >
              + Bacarıq əlavə et
            </Link>
          </div>

          {skills.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm mb-4">Hələ bacarıq seçilməyib.</p>
              <Link
                href="/assessment/test"
                className="inline-flex items-center gap-2 bg-violet-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-violet-700 transition"
              >
                Testi Keç və Bacarıq Seç
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {skills.map((skill: any) => {
                const dim = DIMENSIONS[skill.skillKey as DimensionKey]
                return (
                  <div
                    key={skill.skillKey}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ backgroundColor: dim?.bgColor ?? '#f5f3ff' }}
                  >
                    <span className="text-xl">{skill.skillIcon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{skill.skillLabel}</p>
                      {dim && <p className="text-gray-500 text-xs truncate">{dim.description}</p>}
                    </div>
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: dim?.color ?? '#7c3aed' }}
                    />
                  </div>
                )
              })}

              {!isPaid && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                  <span className="text-amber-500 text-sm">🔒</span>
                  <div className="flex-1">
                    <p className="text-amber-800 text-xs font-semibold">Pulsuz planda 1 bacarıq</p>
                  </div>
                  <Link href="/upgrade" className="text-xs font-bold text-violet-600 hover:underline shrink-0">
                    Pro →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Subscription card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-4">
            <Crown size={20} className="text-violet-600" />
            <h3 className="font-bold text-gray-900">Abunəlik</h3>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${planInfo.color} mb-3`}>
            {planInfo.label}
          </div>
          <p className="text-gray-500 text-sm mb-5">{planInfo.desc}</p>
          {plan === 'FREE' && (
            <Link
              href="/register?plan=pro"
              className="block text-center bg-violet-600 text-white font-bold py-3 rounded-xl hover:bg-violet-700 transition"
            >
              Pro Plana Keç — 14.9 ₼/ay
            </Link>
          )}
          {plan === 'PRO' && (
            <Link
              href="/register?plan=team"
              className="block text-center bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
            >
              Komanda Planına Keç — 89.9 ₼/ay
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
