import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateSingleLessonContent } from '@/lib/ai'

function serviceDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// GET: fetch single lesson full content
export async function GET(req: NextRequest) {
  const authSupabase = await createServerSupabaseClient()
  const { data: { user } } = await authSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const lessonId = req.nextUrl.searchParams.get('lessonId')
  if (!lessonId) return NextResponse.json({ error: 'lessonId required' }, { status: 400 })

  const db = serviceDb()
  const { data: lesson } = await db.from('SkillLesson').select('*').eq('id', lessonId).single()
  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ lesson })
}

// POST: approve, reject, or request revision with comment
export async function POST(req: NextRequest) {
  const authSupabase = await createServerSupabaseClient()
  const { data: { user } } = await authSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = serviceDb()
  const { data: profile } = await db.from('User').select('role').eq('id', user.id).single()
  if (profile?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { action, lessonId, comment } = await req.json() as {
    action: 'approve' | 'revise'
    lessonId: string
    comment?: string
  }

  const { data: lesson } = await db.from('SkillLesson').select('*').eq('id', lessonId).single()
  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

  if (action === 'approve') {
    await db.from('SkillLesson').update({
      adminApproved: true,
      adminComment: comment ?? null,
      approvedAt: new Date().toISOString(),
    }).eq('id', lessonId)
    return NextResponse.json({ ok: true })
  }

  if (action === 'revise') {
    if (!comment) return NextResponse.json({ error: 'Comment required for revision' }, { status: 400 })

    const { data: program } = await db
      .from('SkillProgram')
      .select('skillLabel, category')
      .eq('id', lesson.programId)
      .single()

    // Regenerate with the admin comment as additional instruction
    const newContent = await generateSingleLessonContent({
      title: lesson.title,
      description: (lesson.description ?? '') + `\n\nAdmin qeydi: ${comment}`,
      category: program?.category ?? '',
      difficulty: lesson.difficulty,
      order: lesson.order,
      totalLessons: 12,
      skillLabel: program?.skillLabel ?? '',
    })

    if (!newContent) return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })

    await db.from('SkillLesson').update({
      content: newContent,
      adminApproved: false,
      adminComment: comment,
      approvedAt: null,
    }).eq('id', lessonId)

    return NextResponse.json({ ok: true, newContent })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
