'use client'

import { Printer, Share2, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export default function PrintButton() {
  const [copied, setCopied] = useState(false)

  function handlePrint() {
    window.print()
  }

  async function handleShare() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3 print:hidden">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 border border-gray-200 text-gray-600 font-semibold px-5 py-2.5 rounded-xl hover:border-violet-300 hover:text-violet-700 transition text-sm"
      >
        {copied ? <CheckCircle size={16} className="text-green-500" /> : <Share2 size={16} />}
        {copied ? 'Kopyalandı!' : 'Paylaş'}
      </button>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 bg-violet-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-violet-700 transition text-sm"
      >
        <Printer size={16} /> Çap et / PDF
      </button>
    </div>
  )
}
