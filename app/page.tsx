import Link from 'next/link'
import { Brain, TrendingUp, Users, CheckCircle, ArrowRight, Zap, BookOpen } from 'lucide-react'

const CATEGORIES = [
  { icon: '🗣️', title: 'Kommunikasiya', desc: 'İctimai çıxış, aktiv dinləmə, yazılı kommunikasiya' },
  { icon: '👥', title: 'Liderlik', desc: 'Rəy vermə, delegasiya, komanda idarəetməsi' },
  { icon: '🧠', title: 'Düşüncə Sistemi', desc: 'Kritik düşüncə, problemin həlli, qərar qəbulu' },
  { icon: '🤝', title: 'Danışıqlar', desc: 'Effektiv sual, müzakirə, razılaşma sənəti' },
  { icon: '⚡', title: 'Şəxsi Effektivlik', desc: 'Vaxt idarəetməsi, emosional intellekt' },
  { icon: '🚀', title: 'Karyera İnkişafı', desc: 'Şəbəkə qurma, personal branding, müsahibə' },
]

const PLANS = [
  {
    name: 'Pulsuz',
    price: '0',
    period: '',
    highlight: false,
    features: ['1 bacarıq proqramına giriş', 'Platformanı sına', 'Temel məzmun'],
    cta: 'Başla',
    href: '/register',
  },
  {
    name: 'Pro',
    price: '14.9',
    period: '/il',
    highlight: true,
    features: [
      'Bütün dərslərə tam giriş',
      'Həftəlik yeni AI dərsləri',
      'Fərdi öyrənmə tövsiyəsi',
      'Şəxsi tərəqqi tablosu',
      'Tamamlama sertifikatları',
      'Praktiki tapşırıqlar',
    ],
    cta: 'Pro ilə Başla',
    href: '/register?plan=pro',
  },
  {
    name: 'Komanda',
    price: '89.9',
    period: '/il',
    highlight: false,
    features: [
      '5 üzv daxil',
      'Komanda tərəqqi analitikası',
      'Alt-hesab idarəetməsi',
      'Pro planın bütün üstünlükləri',
      'Hansı bacarıqların öyrənildiyini izlə',
      'Prioritet dəstək',
    ],
    cta: 'Komanda Planı',
    href: '/register?plan=team',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              Bacar<span className="text-violet-600">IQ</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#kateqoriyalar" className="hover:text-gray-900 transition">Kateqoriyalar</a>
            <a href="#planlar" className="hover:text-gray-900 transition">Planlar</a>
            <a href="#nece-isleyir" className="hover:text-gray-900 transition">Necə işləyir?</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
              Daxil ol
            </Link>
            <Link
              href="/register"
              className="bg-violet-600 text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-violet-700 transition"
            >
              Pulsuz Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-blue-50 to-white pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-sm font-semibold px-4 py-2 rounded-full mb-8">
            <Zap size={14} />
            AI ilə gücləndirilmiş öyrənmə platforması
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            Peşəkar bacarıqlarını<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">
              sürətlə inkişaf etdir
            </span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Azərbaycan iş bazarına uyğun real bacarıqlar. AI motor həftəlik yeni dərslər yaradır,
            sənin irəliləyişini izləyir və fərdi tövsiyələr verir.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/assessment"
              className="flex items-center justify-center gap-2 bg-violet-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-violet-700 transition text-lg shadow-lg shadow-violet-200"
            >
              Bacarıq Testini Keç <ArrowRight size={20} />
            </Link>
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-800 font-bold px-8 py-4 rounded-2xl hover:border-violet-300 transition text-lg"
            >
              <BookOpen size={20} /> Pulsuz Başla
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-gray-400 font-medium">
            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500" /> 5 dəqiqəlik pulsuz test</span>
            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500" /> AI profil analizi</span>
            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500" /> Fərdi öyrənmə planı</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '6', label: 'Bacarıq Kateqoriyası' },
              { value: 'AI', label: 'Həftəlik Yeni Dərslər' },
              { value: '15+', label: 'Dəqiqəlik Dərslər' },
              { value: '3', label: 'Abunəlik Planı' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-4xl font-extrabold text-violet-400 mb-2">{s.value}</div>
                <div className="text-gray-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="kateqoriyalar" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">6 Əsas Bacarıq Sahəsi</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Azərbaycan iş bazarında karyeranı irəli aparan bacarıqlar
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map(cat => (
              <div
                key={cat.title}
                className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-violet-200 hover:shadow-lg transition"
              >
                <div className="text-4xl mb-4">{cat.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-violet-700 transition">
                  {cat.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="nece-isleyir" className="py-24 bg-gradient-to-b from-violet-50 to-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">AI Motor Necə İşləyir?</h2>
            <p className="text-gray-500 text-lg">BacarIQ-un arxasındakı intellekt</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01', icon: TrendingUp, title: 'Həftəlik Trend Analizi',
                desc: 'AI hər həftə Azərbaycan iş bazarında ən çox tələb olunan bacarıqları analiz edir və yeni dərslər yaradır.',
              },
              {
                step: '02', icon: Brain, title: 'Fərdi Öyrənmə Yolu',
                desc: 'Sənin tərəqqini izləyir, güclü və zəif tərəflərini müəyyən edir, növbəti dərs üçün ən uyğun mövzunu tövsiyə edir.',
              },
              {
                step: '03', icon: Users, title: 'Kollektiv İntellekt',
                desc: 'Bütün istifadəçilərin geri bildirimini analiz edir, ən çox soruşulan suallara əsasən kurikulumu güncəlləyir.',
              },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-5">
                  <item.icon size={28} className="text-violet-600" />
                </div>
                <div className="text-violet-400 font-bold text-xs mb-2 tracking-widest">{item.step}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planlar" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Sadə Qiymətlər</h2>
            <p className="text-gray-500 text-lg">Öz sürətinlə öyrən, istədiyin zaman yüksəlt</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border-2 flex flex-col ${
                  plan.highlight
                    ? 'border-violet-600 bg-violet-600 text-white shadow-xl shadow-violet-200 relative'
                    : 'border-gray-100 bg-white'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-gray-900 text-xs font-extrabold px-4 py-1 rounded-full">
                    ƏN POPULYAR
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`font-extrabold text-xl mb-2 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-end gap-1">
                    <span className={`text-5xl font-extrabold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm mb-2 ${plan.highlight ? 'text-violet-200' : 'text-gray-400'}`}>
                      {plan.price === '0' ? ' ₼' : `₼${plan.period}`}
                    </span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? 'text-violet-100' : 'text-gray-600'}`}>
                      <CheckCircle size={16} className={`shrink-0 mt-0.5 ${plan.highlight ? 'text-violet-200' : 'text-green-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center font-bold py-3 rounded-xl transition ${
                    plan.highlight
                      ? 'bg-white text-violet-600 hover:bg-violet-50'
                      : 'bg-violet-600 text-white hover:bg-violet-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-violet-600 to-blue-600">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-5">
            Bacarıqların sənin ən böyük investisiyan
          </h2>
          <p className="text-violet-200 text-lg mb-8">
            Pulsuz hesab aç, 1 bacarıq proqramını sına, sonra qərar ver.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-violet-700 font-extrabold px-10 py-4 rounded-2xl hover:bg-violet-50 transition text-lg shadow-xl"
          >
            İndi Başla — Pulsuz <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-violet-600 rounded-md flex items-center justify-center">
              <Brain size={13} className="text-white" />
            </div>
            <span className="font-bold text-white">Bacar<span className="text-violet-400">IQ</span></span>
          </div>
          <p className="text-sm">© 2026 BacarIQ. Bütün hüquqlar qorunur.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/lessons" className="hover:text-white transition">Dərslər</Link>
            <Link href="/privacy" className="hover:text-white transition">Məxfilik</Link>
            <Link href="/terms" className="hover:text-white transition">Şərtlər</Link>
            <Link href="/login" className="hover:text-white transition">Daxil ol</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
