import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Brain } from 'lucide-react'
import PrintButton from './PrintButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CertificatePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: cert } = await supabase
    .from('Certificate')
    .select('*, Lesson(category)')
    .eq('id', id)
    .single()

  if (!cert) notFound()

  const issuedDate = new Date(cert.issuedAt).toLocaleDateString('az-AZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const category = (cert as any).Lesson?.category ?? ''

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav — hidden when printing */}
      <div className="print:hidden bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard/lessons" className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition text-sm">
            <ArrowLeft size={18} /> Öyrənmə Yollarına Qayıt
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* Certificate page */}
      <div className="max-w-4xl mx-auto px-6 py-12 print:py-0 print:px-0 print:max-w-none">
        {/*
          Print styles: when printing, make the cert fill the A4 page.
          We use inline style for the certificate itself so it works in print.
        */}
        <div
          className="relative bg-white rounded-3xl shadow-2xl overflow-hidden print:rounded-none print:shadow-none"
          style={{ minHeight: '680px' }}
        >
          {/* Top gradient band */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-violet-600 via-blue-500 to-violet-600" />

          {/* Corner ornaments */}
          <div className="absolute top-8 left-8 w-20 h-20 rounded-full bg-violet-50 opacity-60" />
          <div className="absolute top-8 right-8 w-20 h-20 rounded-full bg-blue-50 opacity-60" />
          <div className="absolute bottom-8 left-8 w-16 h-16 rounded-full bg-violet-50 opacity-40" />
          <div className="absolute bottom-8 right-8 w-16 h-16 rounded-full bg-blue-50 opacity-40" />

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-[140px] font-extrabold text-violet-50 tracking-tighter leading-none rotate-[-15deg]">
              IQ
            </span>
          </div>

          {/* Certificate content */}
          <div className="relative z-10 flex flex-col items-center text-center px-16 py-16 print:px-12 print:py-12">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
                <Brain size={24} className="text-white" />
              </div>
              <span className="font-extrabold text-3xl tracking-tight text-gray-900">
                Bacar<span className="text-violet-600">IQ</span>
              </span>
            </div>

            {/* "Certificate of Completion" */}
            <p className="text-xs font-extrabold text-violet-500 uppercase tracking-[0.25em] mb-4">
              Tamamlama Sertifikatı
            </p>

            <div className="w-24 h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent mb-8" />

            {/* "This is to certify that" */}
            <p className="text-gray-500 text-lg mb-4 font-medium">Bu sertifikat təsdiq edir ki,</p>

            {/* User name */}
            <h1 className="text-5xl font-extrabold text-gray-900 mb-2 leading-tight" style={{ fontFamily: 'serif' }}>
              {cert.userName}
            </h1>

            <div className="w-48 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8" />

            {/* "has successfully completed" */}
            <p className="text-gray-500 text-lg mb-5 font-medium">uğurla tamamlamışdır</p>

            {/* Lesson title */}
            <div className="bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-100 rounded-2xl px-10 py-6 mb-6 max-w-xl">
              <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">Dərs</p>
              <h2 className="text-2xl font-extrabold text-gray-900 leading-snug">
                {cert.lessonTitle}
              </h2>
              {category && (
                <p className="text-violet-600 font-semibold text-sm mt-2">{category}</p>
              )}
            </div>

            {/* Date + cert ID */}
            <div className="flex items-center gap-8 mt-4 mb-10">
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Tarix</p>
                <p className="font-bold text-gray-800 text-sm">{issuedDate}</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Sertifikat №</p>
                <p className="font-mono text-gray-500 text-xs">{id.slice(0, 16).toUpperCase()}</p>
              </div>
            </div>

            {/* Signature area */}
            <div className="flex items-end justify-center gap-16">
              <div className="text-center">
                <div className="h-12 flex items-end justify-center mb-1">
                  <span className="font-bold text-2xl text-violet-700" style={{ fontFamily: 'cursive' }}>
                    BacarIQ
                  </span>
                </div>
                <div className="w-32 h-px bg-gray-300 mb-1" />
                <p className="text-xs text-gray-400">BacarIQ Platforması</p>
              </div>
            </div>
          </div>

          {/* Bottom gradient band */}
          <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-violet-600 via-blue-500 to-violet-600" />
        </div>

        {/* Below cert (hidden in print) */}
        <div className="print:hidden mt-8 text-center text-gray-400 text-sm">
          Sertifikatı çap etmək üçün yuxarıdakı &quot;Çap et / PDF&quot; düyməsini istifadə edin.
        </div>
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 1cm; }
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
