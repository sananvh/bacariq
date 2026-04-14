import Link from 'next/link'
import { Brain, Clock, ArrowRight, CheckCircle, Lock, Sparkles, Target, TrendingUp } from 'lucide-react'

export default function AssessmentIntroPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain size={17} className="text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              Bacar<span className="text-violet-600">IQ</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login?returnTo=/assessment/test" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
              Daxil ol
            </Link>
            <Link
              href="/register?returnTo=/assessment/test"
              className="bg-violet-600 text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-violet-700 transition"
            >
              Qeydiyyat
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-blue-50 to-white pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Sparkles size={14} /> Pulsuz · AI ilə gücləndirilmiş
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            Peşəkar profiliniz<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">
              nə deyir sizin haqqınızda?
            </span>
          </h1>

          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            20 ssenari sualı. Düzgün cavab yoxdur — yalnız sizin təbii reaksiyanız.
            AI bunu analiz edib gizli güclü tərəflərinizi aşkar edəcək.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mb-10">
            <span className="flex items-center gap-2 font-medium">
              <Clock size={16} className="text-violet-500" /> 5–7 dəqiqə
            </span>
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle size={16} className="text-violet-500" /> Heç bir düzgün cavab yoxdur
            </span>
            <span className="flex items-center gap-2 font-medium">
              <Target size={16} className="text-violet-500" /> Fərdi inkişaf planı
            </span>
          </div>

          <Link
            href="/login?returnTo=/assessment/test"
            className="inline-flex items-center gap-2 bg-violet-600 text-white font-extrabold px-10 py-4 rounded-2xl hover:bg-violet-700 transition text-lg shadow-lg shadow-violet-200"
          >
            Testi Başla <ArrowRight size={20} />
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            Nəticənizi saxlamaq üçün giriş tələb olunur — pulsuz qeydiyyat 30 saniyə çəkir
          </p>
        </div>
      </section>

      {/* What happens after the test */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Test bitdikdən sonra nə baş verir?</h2>
            <p className="text-gray-500">Nəticəniz dərhal hazır olur</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                color: 'bg-violet-100 text-violet-600',
                title: 'AI Profil Analizi',
                desc: 'Cavablarınız əsasında 6 ölçü üzrə xəritəniz hazırlanır. Güclü tərəfləriniz, inkişaf potensialınız.',
              },
              {
                icon: Target,
                color: 'bg-blue-100 text-blue-600',
                title: 'Bacarıq Seçimi',
                desc: 'Profilinizə əsasən hansı bacarığı inkişaf etdirmək istədiyinizi seçirsiniz. Bu bacarıq panelinizə əlavə olunur.',
              },
              {
                icon: TrendingUp,
                color: 'bg-green-100 text-green-600',
                title: 'Fərdi Öyrənmə Yolu',
                desc: 'Seçdiyiniz bacarıq üzrə tövsiyə olunan dərslər və 4 həftəlik plan (Pro planda) sizin üçün hazırlanır.',
              },
            ].map(s => (
              <div key={s.title} className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${s.color}`}>
                  <s.icon size={26} />
                </div>
                <h3 className="font-extrabold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free vs Paid — minimal, focused on skills */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Pulsuz plan nəyi əhatə edir?</h2>
            <p className="text-gray-500">Test tamamilə pulsuzdur. Bacarıq seçimi pulsuz planda mövcuddur.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-7">
              <h3 className="font-extrabold text-gray-900 text-lg mb-4">Pulsuz Plan</h3>
              <ul className="space-y-3">
                {[
                  'Tam 20 sual testi',
                  'AI profil xəritəsi (6 ölçü)',
                  'Güclü tərəf + inkişaf analizi',
                  '1 bacarıq seçimi',
                  '1 tövsiyə olunan dərs',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle size={15} className="text-green-500 shrink-0" /> {f}
                  </li>
                ))}
                {[
                  'Birdən çox bacarıq seçimi',
                  '4 həftəlik inkişaf planı',
                  'Bütün dərslərə giriş',
                  'Tamamlama sertifikatları',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-gray-400 text-sm">
                    <Lock size={15} className="text-gray-300 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-violet-600 rounded-2xl p-7 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-white text-lg">Pro Plan</h3>
                <span className="bg-amber-400 text-gray-900 text-xs font-extrabold px-3 py-1 rounded-full">14.9 ₼/il</span>
              </div>
              <ul className="space-y-3">
                {[
                  'Pulsuz planın hamısı',
                  'Sınırsız bacarıq seçimi',
                  'AI 4 həftəlik inkişaf planı',
                  'Hər bacarıq üçün dərs yolu',
                  'Bütün dərslərə tam giriş',
                  'Tamamlama sertifikatları',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-violet-100 text-sm">
                    <CheckCircle size={15} className="text-violet-200 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-violet-600 to-blue-600 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Özünüzü tanımaq hər şeyin başlanğıcıdır
          </h2>
          <p className="text-violet-200 mb-8 text-lg">
            5 dəqiqə vaxt ayırın. Profilinizi kəşf edin. Öyrənmə yolunuzu qurun.
          </p>
          <Link
            href="/login?returnTo=/assessment/test"
            className="inline-flex items-center gap-2 bg-white text-violet-700 font-extrabold px-10 py-4 rounded-2xl hover:bg-violet-50 transition text-lg shadow-xl"
          >
            Testi Başla — Pulsuz <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <footer className="bg-gray-950 text-gray-400 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between gap-4">
          <span className="font-bold text-white text-sm">Bacar<span className="text-violet-400">IQ</span></span>
          <div className="flex gap-5 text-sm">
            <Link href="/privacy" className="hover:text-white">Məxfilik</Link>
            <Link href="/terms" className="hover:text-white">Şərtlər</Link>
            <Link href="/" className="hover:text-white">Ana Səhifə</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
