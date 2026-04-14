import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'BacarIQ — Peşəkar Bacarıq Platforması',
  description: 'Azərbaycanda peşəkar bacarıq inkişafı üçün ən yaxşı platforma. Kommunikasiya, liderlik, kritik düşüncə və daha çox.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-gray-900 font-sans">{children}</body>
    </html>
  )
}
