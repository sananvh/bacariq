import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Brain } from 'lucide-react'
import AssessmentTest from '@/components/AssessmentTest'

export default async function AssessmentTestPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?returnTo=/assessment/test')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain size={14} className="text-white" />
            </div>
            <span className="font-extrabold tracking-tight">
              Bacar<span className="text-violet-600">IQ</span>
            </span>
          </Link>
          <span className="text-xs font-semibold text-gray-400 bg-violet-50 text-violet-600 px-3 py-1 rounded-full">
            Bacarıq Profil Testi
          </span>
        </div>
      </div>

      <AssessmentTest />
    </div>
  )
}
