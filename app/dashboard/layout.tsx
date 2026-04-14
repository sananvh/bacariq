import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('User')
    .select('name, email, subscriptionPlan, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar profile={profile} />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
