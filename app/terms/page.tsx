import Link from 'next/link'
import { Brain, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">İstifadə Şərtləri</h1>
        <p className="text-gray-500 text-sm mb-10">Son yenilənmə: Aprel 2025</p>

        <div className="space-y-8">

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">1. Razılaşma</h2>
            <p className="text-gray-600 leading-relaxed">
              BacarIQ platformasına daxil olaraq və ya istifadə edərək bu İstifadə Şərtlərini («Şərtlər»)
              qəbul etmiş olursunuz. Bu şərtlərlə razı deyilsinizsə, platformadan istifadə etməyin.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">2. Hesab Yaradılması</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Hesab yaratmaq üçün:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>16 yaşından yuxarı olmalısınız</li>
              <li>Dəqiq və tam məlumat verməlisiniz</li>
              <li>Hesabınızın təhlükəsizliyindən özünüz məsuliyyət daşıyırsınız</li>
              <li>Bir nəfər yalnız bir hesab yarada bilər</li>
              <li>Hesabınızı başqasına ötürə bilməzsiniz</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">3. Abunəlik və Ödənişlər</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Pro Plan:</strong> İllik 14.90 AZN — bir istifadəçi üçün tam giriş</li>
              <li><strong>Komanda Planı:</strong> İllik 89.90 AZN — 5 istifadəçiyə qədər</li>
              <li>Bütün ödənişlər Epoint.az vasitəsilə işlənir</li>
              <li>Abunəlik avtomatik olaraq yenilənmir; vaxt bitdikdən 3 gün sonra plan pulsuz plana keçir</li>
              <li>Ödənişlər qeyri-qaytarılandır (texniki problemlər istisna olmaqla)</li>
              <li>Qiymətlər əvvəlcədən bildiriş verilmədən dəyişdirilə bilər</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">4. İstifadə Qaydaları</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Platformadan istifadə edərkən aşağıdakılar qadağandır:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Platforma məzmununu icazəsiz kopyalamaq, paylaşmaq və ya satmaq</li>
              <li>Platformanın normal işinə mane olmaq (DDoS, spam və s.)</li>
              <li>Digər istifadəçiləri aldatmaq və ya onlara ziyan vermək</li>
              <li>Qeyri-qanuni fəaliyyətlər üçün platformadan istifadə etmək</li>
              <li>Sistemin təhlükəsizliyinə sındırmağa cəhd etmək</li>
              <li>Bot və ya avtomatik vasitələrlə platformaya daxil olmaq</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">5. Məzmun Hüquqları</h2>
            <p className="text-gray-600 leading-relaxed">
              BacarIQ platformasındakı bütün məzmun — dərslər, AI yaradılan materiallar, dizayn elementləri —
              BacarIQ-yə məxsusdur. Şəxsi, qeyri-kommersiya öyrənmə məqsədi ilə istifadə oluna bilər.
              Kommersiya məqsədi ilə yenidən paylaşmaq əvvəlcədən yazılı icazə tələb edir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">6. Sertifikatlar</h2>
            <p className="text-gray-600 leading-relaxed">
              BacarIQ sertifikatları yalnız Pro və Komanda plan üzvlərinə verilir. Sertifikatlar
              platformada tamamlanan dərsləri təsdiq edir. BacarIQ peşəkar ixtisas sertifikatı deyil —
              bacarıq inkişaf etdirmə platformasının tamamlama sənədidir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">7. AI Məzmunu</h2>
            <p className="text-gray-600 leading-relaxed">
              Platformadakı bəzi məzmun süni intellekt (Anthropic Claude) tərəfindən yaradılır.
              AI yaradılan məzmun peşəkar məsləhət əvəz etmir. Mühüm qərarlar üçün ixtisaslı mütəxəssislərlə
              məsləhətləşin.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">8. Məsuliyyətin Məhdudlaşdırılması</h2>
            <p className="text-gray-600 leading-relaxed">
              BacarIQ platforması «olduğu kimi» təqdim olunur. Platformadan istifadə nəticəsində baş verəcək
              dolayı, təsadüfi və ya nəticə zərərləri üçün məsuliyyət daşımırıq. Maksimum məsuliyyətimiz
              ödədiyiniz son abunəlik məbləği ilə məhdudlaşır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">9. Hesabın Dayandırılması</h2>
            <p className="text-gray-600 leading-relaxed">
              Bu şərtləri pozduğunuz halda hesabınız əvvəlcədən xəbərdarlıq edilmədən dayandırıla bilər.
              Öz iradənizlə hesabı silmək üçün profil ayarlarından istifadə edə bilərsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">10. Tətbiq Edilən Qanun</h2>
            <p className="text-gray-600 leading-relaxed">
              Bu şərtlər Azərbaycan Respublikasının qanunvericiliyinə tabedir.
              Mübahisələr Azərbaycan məhkəmələrinin yurisdiksiyasına aiddir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">11. Dəyişikliklər</h2>
            <p className="text-gray-600 leading-relaxed">
              Şərtlər dəyişdirildikdə e-poçt vasitəsilə bildiriş göndəriləcək. Dəyişiklikdən sonra
              platformadan istifadəyə davam etmək yeni şərtlərə razılıq kimi qəbul edilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-3">12. Əlaqə</h2>
            <p className="text-gray-600 leading-relaxed">
              Suallarınız üçün:{' '}
              <a href="mailto:support@bacariq.az" className="text-violet-600 hover:underline">support@bacariq.az</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4 text-sm text-gray-400">
          <Link href="/privacy" className="hover:text-gray-700">Məxfilik Siyasəti</Link>
          <Link href="/" className="hover:text-gray-700">Ana Səhifə</Link>
        </div>
      </div>
    </div>
  )
}
