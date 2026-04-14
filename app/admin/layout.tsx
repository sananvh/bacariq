import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('User').select('role, name').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <AdminSidebar name={profile.name} />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
