import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Brain, CheckCircle, Crown, Zap, Users, ArrowLeft, Lock } from 'lucide-react'
import CheckoutButton from './CheckoutButton'

interface PageProps {
  searchParams: Promise<{ reason?: string; lessonId?: string }>
}

const PRO_FEATURES = [
  'Bütün dərslərə tam giriş',
  'Həftəlik yeni AI dərsləri',
  'Fərdi öyrənmə tövsiyəsi',
  'Şəxsi tərəqqi tablosu',
  'Tamamlama sertifikatları',
  'Praktiki tapşırıqlar',
]

const TEAM_FEATURES = [
  'Pro planın bütün üstünlükləri',
  '5 üzv daxil',
  'Komanda tərəqqi analitikası',
  'Alt-hesab idarəetməsi',
  'Hansı bacarıqların öyrənildiyini izlə',
  'Prioritet dəstək',
]

export default async function UpgradePage({ searchParams }: PageProps) {
  const { reason, lessonId } = await searchParams

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('User')
    .select('subscriptionPlan')
    .eq('id', user.id)
    .single()

  // Already paid — redirect away
  const isPaid = profile?.subscriptionPlan === 'PRO' || profile?.subscriptionPlan === 'TEAM'
  if (isPaid && reason === 'certificate' && lessonId) {
    redirect(`/certificate/generate?lessonId=${lessonId}`)
  }
  if (isPaid) redirect('/dashboard')

  const isCertReason = reason === 'certificate'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 transition">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">
              Bacar<span className="text-violet-600">IQ</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Certificate gate message */}
        {isCertReason && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-10 flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Lock size={22} className="text-amber-600" />
            </div>
            <div>
              <h2 className="font-extrabold text-amber-900 text-lg mb-1">Sertifikat almaq üçün ödənişli plan lazımdır</h2>
              <p className="text-amber-700 text-sm leading-relaxed">
                BacarIQ sertifikatları yalnız Pro və Komanda plan üzvləri üçün əlçatandır.
                Aşağıda bir plan seçin, ödənişi tamamlayın — sertifikatınız dərhal yaradılacaq.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-bold px-4 py-2 rounded-full mb-4">
            <Crown size={16} /> Premium Plana Keç
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Bacarıqlarını Sertifikatla Sübut Et
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Bütün dərslərə giriş, fərdi AI tövsiyələri və rəsmi tamamlama sertifikatları.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Pro Plan */}
          <div className="relative bg-white rounded-3xl border-2 border-violet-500 shadow-xl shadow-violet-100 p-8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-violet-600 text-white text-xs font-extrabold px-4 py-1.5 rounded-full">
                Ən Populyar
              </span>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center">
                <Zap size={22} className="text-violet-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-xl">Pro</h3>
                <p className="text-gray-400 text-sm">Fərdi öyrənmə</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-5xl font-extrabold text-gray-900">14.9</span>
              <span className="text-gray-400 ml-1">₼/il</span>
              <p className="text-green-600 text-sm font-semibold mt-1">≈ 1.24 ₼/ay — aylıq ödəniş yoxdur</p>
            </div>

            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-gray-700 text-sm">
                  <CheckCircle size={16} className="text-violet-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>

            <CheckoutButton plan="PRO" lessonId={lessonId} />
          </div>

          {/* Team Plan */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Users size={22} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-xl">Komanda</h3>
                <p className="text-gray-400 text-sm">5 nəfərə qədər</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-5xl font-extrabold text-gray-900">89.9</span>
              <span className="text-gray-400 ml-1">₼/il</span>
              <p className="text-green-600 text-sm font-semibold mt-1">≈ 7.49 ₼/ay — aylıq ödəniş yoxdur</p>
            </div>

            <ul className="space-y-3 mb-8">
              {TEAM_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-gray-700 text-sm">
                  <CheckCircle size={16} className="text-blue-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>

            <CheckoutButton plan="TEAM" lessonId={lessonId} />
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-8 mt-12 text-gray-400 text-sm">
          <span>🔒 Təhlükəsiz ödəniş</span>
          <span>✓ Epoint ilə</span>
          <span>📋 İllik abunə</span>
        </div>
      </div>
    </div>
  )
}
