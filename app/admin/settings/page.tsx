import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Settings, Key, Globe, Bell } from 'lucide-react'

export default async function AdminSettingsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: adminProfile } = await supabase
    .from('User')
    .select('name, email')
    .eq('role', 'ADMIN')
    .limit(5)

  const envVars = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Supabase URL', set: !!process.env.NEXT_PUBLIC_SUPABASE_URL },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Supabase Anon Key', set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', label: 'Supabase Service Role Key', set: !!process.env.SUPABASE_SERVICE_ROLE_KEY },
    { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key', set: !!process.env.ANTHROPIC_API_KEY },
    { key: 'EPOINT_PUBLIC_KEY', label: 'Epoint Public Key', set: !!process.env.EPOINT_PUBLIC_KEY },
    { key: 'EPOINT_PRIVATE_KEY', label: 'Epoint Private Key', set: !!process.env.EPOINT_PRIVATE_KEY },
    { key: 'NEXT_PUBLIC_APP_URL', label: 'App URL', set: !!process.env.NEXT_PUBLIC_APP_URL },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Tənzimləmələr</h1>
        <p className="text-gray-400 mt-1">Platforma konfiqurasiyası və sistem məlumatları</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Environment variables status */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-white font-bold mb-5 flex items-center gap-2">
            <Key size={18} className="text-violet-400" /> Mühit Dəyişənləri
          </h2>
          <p className="text-gray-500 text-xs mb-4">
            Bu açarlar Vercel-də Environment Variables bölməsindən təyin edilməlidir.
          </p>
          <ul className="space-y-3">
            {envVars.map(v => (
              <li key={v.key} className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-mono">{v.key}</p>
                  <p className="text-gray-500 text-xs">{v.label}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  v.set ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
                }`}>
                  {v.set ? '✓ Mövcud' : '✗ Yoxdur'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Admin users */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-white font-bold mb-5 flex items-center gap-2">
            <Settings size={18} className="text-orange-400" /> Admin İstifadəçilər
          </h2>
          {!adminProfile || adminProfile.length === 0 ? (
            <p className="text-gray-500 text-sm">Admin tapılmadı.</p>
          ) : (
            <ul className="space-y-3">
              {adminProfile.map((a: any, i: number) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-800 text-orange-200 text-sm font-bold flex items-center justify-center">
                    {(a.name || a.email || 'A').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-gray-200 text-sm font-medium">{a.name || 'İsimsiz'}</p>
                    <p className="text-gray-500 text-xs">{a.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 bg-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs font-mono leading-relaxed">
              Yeni admin əlavə etmək üçün Supabase SQL Editor-də:<br />
              <span className="text-violet-400">
                UPDATE &quot;User&quot; SET role = &apos;ADMIN&apos;<br />
                WHERE email = &apos;email@domain.com&apos;;
              </span>
            </p>
          </div>
        </div>

        {/* Payment config */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-white font-bold mb-5 flex items-center gap-2">
            <Globe size={18} className="text-green-400" /> Ödəniş Konfiqurasiyası
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Ödəniş Sistemi', value: 'Epoint.az' },
              { label: 'Pro Plan', value: '14.90 AZN/il' },
              { label: 'Komanda Planı', value: '89.90 AZN/il' },
              { label: 'Valyuta', value: 'AZN (Azərbaycan Manatı)' },
              { label: 'Callback URL', value: '/api/payment/callback' },
              { label: 'Uğur Yönləndirmə', value: '/upgrade/success' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                <span className="text-gray-400 text-sm">{row.label}</span>
                <span className="text-gray-200 text-sm font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription reminders info */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h2 className="text-white font-bold mb-5 flex items-center gap-2">
            <Bell size={18} className="text-blue-400" /> Abunəlik Bildirişləri
          </h2>
          <div className="space-y-3">
            {[
              { event: 'Vaxtından 10 gün əvvəl', action: 'Yeniləmə xatırlatması göndərilir' },
              { event: 'Vaxtından 3 gün əvvəl', action: 'Son xəbərdarlıq göndərilir' },
              { event: 'Vaxt bitdikdə', action: 'Plan aktiv qalır (+3 gün güzəşt)' },
              { event: '+3 gün sonra', action: 'Plan FREE-ə endirilir' },
              { event: '+5 gün sonra', action: 'İptal bildirişi göndərilir' },
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-800 last:border-0">
                <span className="text-blue-400 text-xs font-bold shrink-0 mt-0.5 w-28">{row.event}</span>
                <span className="text-gray-400 text-sm">{row.action}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-xs mt-4">
            Bu bildirişlər Vercel Cron Jobs vasitəsilə idarə ediləcək.
          </p>
        </div>
      </div>
    </div>
  )
}
