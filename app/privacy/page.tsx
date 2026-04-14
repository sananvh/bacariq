import Link from 'next/link'
import { Brain, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-gray-700 transition">
            <ArrowLeft size={20} />
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain size={14} className="text-white" />
            </div>
            <span className="font-extrabold tracking-tight">
              Bacar<span className="text-violet-600">IQ</span>
            </span>
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Məxfilik Siyasəti</h1>
        <p className="text-gray-500 text-sm mb-10">Son yenilənmə: Aprel 2025</p>

        <div className="prose prose-gray max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">1. Giriş</h2>
            <p className="text-gray-600 leading-relaxed">
              BacarIQ platforması («biz», «bizim» və ya «platforma») istifadəçilərimizin məxfiliyini qorumağı öhdəsinə götürür.
              Bu Məxfilik Siyasəti, bacariq.az saytından istifadə edərkən hansı məlumatların toplanıldığını, necə istifadə edildiyini
              və necə qorunduğunu izah edir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">2. Toplanan Məlumatlar</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Aşağıdakı məlumatları toplayırıq:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Hesab məlumatları:</strong> Ad, e-poçt ünvanı, şifrə (şifrələnmiş formada)</li>
              <li><strong>Öyrənmə fəaliyyəti:</strong> Tamamlanan dərslər, izləmə müddəti, test nəticələri</li>
              <li><strong>Ödəniş məlumatları:</strong> Abunəlik planı, ödəniş tarixi (kart məlumatları BacarIQ tərəfindən saxlanılmır — Epoint.az vasitəsilə işlənir)</li>
              <li><strong>Texniki məlumatlar:</strong> IP ünvanı, brauzer növü, cihaz məlumatları</li>
              <li><strong>Geri bildirimlər:</strong> Dərslər haqqında yazdığınız şərhlər</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">3. Məlumatların İstifadəsi</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Toplanan məlumatlar aşağıdakı məqsədlər üçün istifadə olunur:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Hesabınızın yaradılması və idarə edilməsi</li>
              <li>Fərdi öyrənmə tövsiyələri vermək üçün AI analizi</li>
              <li>Abunəlik ödənişlərinin emalı</li>
              <li>Platforma xidmətlərinin inkişaf etdirilməsi</li>
              <li>Texniki dəstək göstərilməsi</li>
              <li>Qanuni öhdəliklərimizi yerinə yetirmək</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">4. Məlumatların Paylaşılması</h2>
            <p className="text-gray-600 leading-relaxed">
              Şəxsi məlumatlarınızı üçüncü tərəflərlə satmırıq. Məlumatlar yalnız aşağıdakı hallarda paylaşılır:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 mt-3">
              <li><strong>Supabase:</strong> Verilənlər bazası xidməti (ABŞ)</li>
              <li><strong>Epoint.az:</strong> Ödəniş emalı (Azərbaycan)</li>
              <li><strong>Anthropic:</strong> AI dərs yaradılması (məzmun yaradılması üçün)</li>
              <li><strong>Qanuni tələb:</strong> Məhkəmə qərarı və ya dövlət orqanlarının tələbi ilə</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">5. Məlumatların Qorunması</h2>
            <p className="text-gray-600 leading-relaxed">
              Məlumatlarınızı HTTPS şifrələmə, çoxfaktorlu autentifikasiya seçimi və Supabase-in
              sənaye standartı təhlükəsizlik tədbirləri ilə qoruyuruq. Şifrələr heç vaxt açıq mətn formatında saxlanılmır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">6. Çərəzlər (Cookies)</h2>
            <p className="text-gray-600 leading-relaxed">
              Platformamız sessiyanızı saxlamaq üçün zəruri çərəzlərdən istifadə edir. Üçüncü tərəf reklam çərəzlərindən istifadə etmirik.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">7. İstifadəçi Hüquqları</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Aşağıdakı hüquqlara maliksiniz:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Məlumatlarınıza baxmaq və düzəliş etmək</li>
              <li>Məlumatlarınızın silinməsini tələb etmək</li>
              <li>Məlumat portasiyası (export)</li>
              <li>Məlumat emalına etiraz etmək</li>
            </ul>
            <p className="text-gray-600 mt-3">
              Hüquqlarınızı həyata keçirmək üçün{' '}
              <a href="mailto:support@bacariq.az" className="text-violet-600 hover:underline">support@bacariq.az</a>{' '}
              ünvanına müraciət edin.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">8. Məlumatların Saxlanma Müddəti</h2>
            <p className="text-gray-600 leading-relaxed">
              Hesabınızı silənə qədər məlumatlarınızı saxlayırıq. Hesab silinməsindən sonra məlumatlar 30 gün ərzində
              sistemlərimizdən tamamilə silinir. Qanuni öhdəliklər üçün bəzi məlumatlar daha uzun müddət saxlanıla bilər.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">9. Uşaqların Məxfiliyi</h2>
            <p className="text-gray-600 leading-relaxed">
              Platformamız 16 yaşdan aşağı uşaqlara yönəlməyib. Belə şəxslərin məlumatlarını bilerek toplamırıq.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">10. Dəyişikliklər</h2>
            <p className="text-gray-600 leading-relaxed">
              Bu Məxfilik Siyasəti zaman-zaman yenilənə bilər. Mühüm dəyişikliklər barədə e-poçt vasitəsilə
              məlumatlandırılacaqsınız. Platformadan istifadəyə davam etməklə yenilikləri qəbul etmiş olursunuz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">11. Əlaqə</h2>
            <p className="text-gray-600 leading-relaxed">
              Məxfiliklə bağlı suallarınız üçün:{' '}
              <a href="mailto:support@bacariq.az" className="text-violet-600 hover:underline">support@bacariq.az</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4 text-sm text-gray-400">
          <Link href="/terms" className="hover:text-gray-700">İstifadə Şərtləri</Link>
          <Link href="/" className="hover:text-gray-700">Ana Səhifə</Link>
        </div>
      </div>
    </div>
  )
}
