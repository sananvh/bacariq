import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Users, GraduationCap, Crown } from 'lucide-react'

const PLAN_BADGE: Record<string, { label: string; color: string }> = {
  FREE:  { label: 'Pulsuz',  color: 'bg-gray-700 text-gray-300' },
  PRO:   { label: 'Pro',     color: 'bg-violet-900/50 text-violet-300' },
  TEAM:  { label: 'Komanda', color: 'bg-blue-900/50 text-blue-300' },
}

export default async function AdminUsersPage() {
  const supabase = await createServerSupabaseClient()

  const { data: users } = await supabase
    .from('User')
    .select('id, name, email, role, subscriptionPlan, subscriptionStatus, createdAt')
    .order('createdAt', { ascending: false })

  const userIds = (users ?? []).map((u: any) => u.id)
  let progressMap: Record<string, number> = {}

  if (userIds.length > 0) {
    const { data: progress } = await supabase
      .from('LessonProgress')
      .select('userId')
      .eq('isCompleted', true)
      .in('userId', userIds)

    for (const p of progress ?? []) {
      progressMap[p.userId] = (progressMap[p.userId] ?? 0) + 1
    }
  }

  const students = (users ?? []).filter((u: any) => u.role === 'STUDENT').length
  const proUsers = (users ?? []).filter((u: any) => u.subscriptionPlan === 'PRO').length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">İstifadəçilər</h1>
        <p className="text-gray-400 mt-1">Bütün qeydiyyatlı istifadəçilər</p>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-10">
        {[
          { label: 'Ümumi', value: users?.length ?? 0, icon: Users, color: 'text-blue-400 bg-blue-900/30' },
          { label: 'Tələbə', value: students, icon: GraduationCap, color: 'text-green-400 bg-green-900/30' },
          { label: 'Pro Abunə', value: proUsers, icon: Crown, color: 'text-violet-400 bg-violet-900/30' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div className="text-2xl font-extrabold text-white">{s.value}</div>
            <div className="text-gray-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-800">
            <tr>
              {['İstifadəçi', 'Plan', 'Tamamlanan', 'Qeydiyyat'].map(h => (
                <th key={h} className="text-left px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(users ?? []).map((u: any) => {
              const initials = (u.name || u.email || 'U').slice(0, 2).toUpperCase()
              const badge = PLAN_BADGE[u.subscriptionPlan] ?? PLAN_BADGE.FREE
              return (
                <tr key={u.id} className="hover:bg-gray-800/50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{u.name || '—'}</p>
                        <p className="text-gray-500 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-white font-semibold">{progressMap[u.id] ?? 0}</span>
                    <span className="text-gray-500 text-sm ml-1">dərs</span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-sm">
                    {new Date(u.createdAt).toLocaleDateString('az-AZ', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!users || users.length === 0) && (
          <div className="text-center py-16 text-gray-600">
            <Users size={36} className="mx-auto mb-3 opacity-30" />
            <p>Hələ istifadəçi yoxdur</p>
          </div>
        )}
      </div>
    </div>
  )
}
