import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Trophy, ArrowRight } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ plan?: string; lessonId?: string }>
}

export default async function UpgradeSuccessPage({ searchParams }: PageProps) {
  const { plan, lessonId } = await searchParams

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const planLabel = plan === 'TEAM' ? 'Komanda' : 'Pro'

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Ödəniş Uğurlu!</h1>
        <p className="text-gray-500 mb-2">
          <span className="font-bold text-violet-600">{planLabel} Plan</span>-a uğurla abunə oldunuz.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Abunəliyiniz 1 il müddətinə aktivdir. Bütün premium məzmunlara giriş açıldı.
        </p>

        <div className="space-y-3">
          {lessonId && (
            <Link
              href={`/certificate/generate?lessonId=${lessonId}`}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 text-amber-900 font-extrabold py-4 rounded-2xl hover:bg-amber-500 transition"
            >
              <Trophy size={20} /> Sertifikatı Al
            </Link>
          )}
          <Link
            href="/dashboard/lessons"
            className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-extrabold py-4 rounded-2xl hover:bg-violet-700 transition"
          >
            Dərslərə Keç <ArrowRight size={18} />
          </Link>
          <Link
            href="/dashboard"
            className="block text-sm text-gray-400 hover:text-gray-600 py-2"
          >
            İdarə Panelinə Qayıt
          </Link>
        </div>
      </div>
    </div>
  )
}
