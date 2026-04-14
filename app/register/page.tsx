'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Brain, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Suspense } from 'react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan     = searchParams.get('plan')     || 'free'
  const returnTo = searchParams.get('returnTo') || '/dashboard'

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Create user profile in User table
      await supabase.from('User').insert({
        id: data.user.id,
        email: form.email,
        name: form.name,
        role: 'STUDENT',
        subscriptionPlan: plan.toUpperCase() === 'PRO' ? 'PRO' : plan.toUpperCase() === 'TEAM' ? 'TEAM' : 'FREE',
        subscriptionStatus: 'ACTIVE',
        createdAt: new Date().toISOString(),
      })
    }

    router.push(returnTo)
    router.refresh()
  }

  const planLabels: Record<string, string> = {
    free: 'Pulsuz Plan',
    pro: 'Pro Plan — 14.9 ₼/ay',
    team: 'Komanda Planı — 89.9 ₼/ay',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain size={22} className="text-white" />
            </div>
            <span className="font-extrabold text-2xl">Bacar<span className="text-violet-600">IQ</span></span>
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900">Hesab Yarat</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {planLabels[plan]} ilə başlayırsınız
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ad Soyad</label>
              <input
                type="text"
                required
                placeholder="Əli Əliyev"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-poçt</label>
              <input
                type="email"
                required
                placeholder="ali@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Şifrə</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Ən azı 6 simvol"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl hover:bg-violet-700 transition disabled:opacity-60 mt-2"
            >
              {loading ? 'Yüklənir...' : 'Hesab Yarat'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Artıq hesabın var?{' '}
            <Link href="/login" className="text-violet-600 font-semibold hover:underline">
              Daxil ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
