export type DimensionKey = 'K' | 'L' | 'A' | 'D' | 'S' | 'C'

export interface DimensionInfo {
  label: string
  fullLabel: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  category: string
  description: string
  lessonCategory: string
}

export const DIMENSIONS: Record<DimensionKey, DimensionInfo> = {
  K: {
    label: 'Kommunikasiya',
    fullLabel: 'Kommunikasiya Bacarığı',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
    icon: '🗣️',
    category: 'Kommunikasiya',
    description: 'Fikirlərini aydın çatdırma, aktiv dinləmə, yazılı və şifahi ifadə bacarığı',
    lessonCategory: 'Kommunikasiya Bacarıqları',
  },
  L: {
    label: 'Liderlik',
    fullLabel: 'Liderlik və Komanda',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    icon: '👥',
    category: 'Liderlik',
    description: 'Komandanı idarə etmə, rəy vermə, delegasiya və ilham vermə qabiliyyəti',
    lessonCategory: 'Liderlik və Komanda',
  },
  A: {
    label: 'Analitik Düşüncə',
    fullLabel: 'Analitik Düşüncə',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    icon: '🧠',
    category: 'Düşüncə Sistemi',
    description: 'Kritik düşüncə, məlumat əsaslı qərar qəbulu, problemin strukturlaşdırılması',
    lessonCategory: 'Düşüncə Sistemi',
  },
  D: {
    label: 'Danışıqlar',
    fullLabel: 'Danışıq Bacarığı',
    color: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    icon: '🤝',
    category: 'Danışıqlar',
    description: 'İnandırma, razılaşma sənəti, münaqişə həlli, maraqları tarazlaşdırma',
    lessonCategory: 'Danışıqlar',
  },
  S: {
    label: 'Özünü İdarə',
    fullLabel: 'Şəxsi Effektivlik',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    icon: '⚡',
    category: 'Şəxsi Effektivlik',
    description: 'Vaxt idarəetməsi, emosional tənzimləmə, stress altında yüksək performans',
    lessonCategory: 'Şəxsi Effektivlik',
  },
  C: {
    label: 'Karyera İnkişafı',
    fullLabel: 'Karyera İnkişafı',
    color: '#0891b2',
    bgColor: '#ecfeff',
    borderColor: '#a5f3fc',
    icon: '🚀',
    category: 'Karyera İnkişafı',
    description: 'Şəbəkə qurma, personal branding, inkişaf məqsədlərini müəyyən etmə',
    lessonCategory: 'Karyera İnkişafı',
  },
}

// Radar chart order (clockwise from top)
export const RADAR_ORDER: DimensionKey[] = ['K', 'L', 'D', 'S', 'C', 'A']

export interface QuestionOption {
  text: string
  dim: DimensionKey
}

export interface Question {
  id: number
  text: string
  options: QuestionOption[]
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'İş yerindəki mühüm dəyişiklik haqqında komandanı məlumatlandırmaq sizin üzərinizdədir. Yanaşmanız nə olacaq?',
    options: [
      { text: 'Dəyişikliyi anlaşıqlı şəkildə çatdırmaq üçün açıq, strukturlaşdırılmış mesaj hazırlayıram', dim: 'K' },
      { text: 'Komandanı prosesə cəlb edirəm, hər kəsin narahatlığını idarə edirəm', dim: 'L' },
      { text: 'Dəyişikliyin səbəblərini və gözlənilən nəticələrini faktlara əsasən analiz edirəm', dim: 'A' },
      { text: 'Bütün maraqlı tərəflərlə razılığa gəlmək üçün danışıqlar aparıram', dim: 'D' },
    ],
  },
  {
    id: 2,
    text: 'Həftənin ilk günü masanızda 10-dan çox tapşırıq var. Nə edirsəniz?',
    options: [
      { text: 'Tapşırıqları əhəmiyyəti və vaxtındalığına görə sıralayıb ardıcıl yerinə yetirirəm', dim: 'S' },
      { text: 'Bəzi tapşırıqları komanda üzvlərinin güclü tərəflərinə görə həvalə edirəm', dim: 'L' },
      { text: 'Hansı tapşırıqların əsl nəticəyə töhfə verdiyini soruşur, lazımsızları kənarlaşdırıram', dim: 'A' },
      { text: 'Daha az aktual olan bəzi son tarixlər barədə yenidən razılaşmağa çalışıram', dim: 'D' },
    ],
  },
  {
    id: 3,
    text: 'Rəhbəriniz işinizi kəskin tənqid edir. Reaksiyanız nə olur?',
    options: [
      { text: 'Tənqidin hansı konkret nöqtələrə aid olduğunu aydınlaşdırmaq üçün suallar verirəm', dim: 'K' },
      { text: 'Emosiyalarımı bir kənara qoyub cavabımı sakin şəkildə formalaşdırıram', dim: 'S' },
      { text: 'Tənqidin haqlı olub-olmadığını faktlara əsasən dəyərləndirirəm', dim: 'A' },
      { text: 'Öz nöqteyi-nəzərimi hörmətlə, amma möhkəm şəkildə bildirirəm', dim: 'D' },
    ],
  },
  {
    id: 4,
    text: 'Yeni bir vəzifə üçün müsahibəsiniz — əmək haqqı mövzusu gəlir. Necə davranırsınız?',
    options: [
      { text: 'Bazar araşdırmama əsaslanaraq konkret gözlənti rəqəmini özüm adlandırıram', dim: 'D' },
      { text: 'Şirkətin mənə nə təklif etdiyini soruşur, öz gözləntilərimə aydınlıq gətirirəm', dim: 'K' },
      { text: 'Yalnız ödənişə deyil, karyera inkişafı imkanlarına da önəm verirəm', dim: 'C' },
      { text: 'Bacarıqlarımın şirkətə yaradacağı dəyəri hesablayıb bunu əsas götürürəm', dim: 'A' },
    ],
  },
  {
    id: 5,
    text: 'Komanda üzvünüz daim iş saatlarından sonra çatışmaz olur, bu da nəticəni pozur. Nə edirsiniz?',
    options: [
      { text: 'Bilavasitə, amma hörmətlə bu barədə birbaşa söhbət edirəm', dim: 'K' },
      { text: 'Problemi anlayıb birlikdə hər iki tərəf üçün işləyəcək həll tapıram', dim: 'L' },
      { text: 'Bunun öz işimə olan təsirini minimuma endirmək üçün planımı yenidən qururum', dim: 'S' },
      { text: 'Hər iki tərəfin ehtiyacını ödəyəcək yazılı razılaşmaya nail olmağa çalışıram', dim: 'D' },
    ],
  },
  {
    id: 6,
    text: 'Peşəkar bir konfrans və ya sənaye tədbirinə gedirsəniz. Əsas məqsədiniz nədir?',
    options: [
      { text: 'Yeni insanlarla tanış olmaq, uzunmüddətli peşəkar əlaqələr qurmaq', dim: 'C' },
      { text: 'Sahəmdəki son trendlər və yeniliklər haqqında öyrənmək', dim: 'A' },
      { text: 'Öz ideyalarımı bölüşmək, digərləri ilə mənalı müzakirə aparmaq', dim: 'K' },
      { text: 'Potensial tərəfdaş və ya müştərilərlə konkret iş danışıqlarına başlamaq', dim: 'D' },
    ],
  },
  {
    id: 7,
    text: 'Rəhbəriniz sizə qeyri-müəyyən tapşırıq verib gedir. Nə edirsiniz?',
    options: [
      { text: 'Tapşırığı aydınlaşdırmaq üçün dərhal suallar verirəm', dim: 'K' },
      { text: 'Tapşırığın arxasındakı məqsədi anlayıb ən məntiqli şərhi seçirəm', dim: 'A' },
      { text: 'Mövcud məlumatla irəliləyirəm — lazım gəlsə sonra soruşacağam', dim: 'S' },
      { text: 'Komanda üzvlərimi cəlb edib birlikdə ən yaxşı yanaşmanı müəyyən edirəm', dim: 'L' },
    ],
  },
  {
    id: 8,
    text: 'Komandanıza pis xəbər çatdırmalısınız (büdcə kəsilməsi, layihə ləğvi). Yanaşmanız nədir?',
    options: [
      { text: 'Xəbəri dürüst, şəffaf şəkildə çatdırıram — nə baş verdiyini tam izah edirəm', dim: 'K' },
      { text: 'Komandanın reaksiyasını idarə edərək onları stabil tutmağa çalışıram', dim: 'L' },
      { text: 'Xəbəri çatdırmaq üçün ən əlverişli vaxtı və konteksti seçirəm', dim: 'A' },
      { text: 'Komandanın emosional reaksiyasına hazırlaşıb cavab ssenariləri düşünürəm', dim: 'S' },
    ],
  },
  {
    id: 9,
    text: 'Bir layihə uğursuz oldu, sizin töhvəniz də var idi. İlk reaksiyanız nə olur?',
    options: [
      { text: 'Nəyin, niyə yanlış getdiyini sistematik şəkildə analiz edib sənədləşdirirəm', dim: 'A' },
      { text: 'Özümü tez toplayıb növbəti addımı planlaşdırıram', dim: 'S' },
      { text: 'Komanda ilə açıq söhbət edib birlikdə dərslər çıxarıram', dim: 'K' },
      { text: 'Bu uğursuzluqdan karyerama nə öyrənə biləcəyimi düşünürəm', dim: 'C' },
    ],
  },
  {
    id: 10,
    text: 'Layihənizin təsdiqi üçün çətin bir komitə qarşısında çıxış edirsiniz. Yanaşmanız nədir?',
    options: [
      { text: 'Rəqəm, məlumat və nümunələrlə möhkəm əsaslandırılmış təqdimat hazırlayıram', dim: 'A' },
      { text: 'Komitənin əsas narahatlığını qabaqcadan müəyyən edib onu ön plana çəkirəm', dim: 'D' },
      { text: 'Aydın, inandırıcı hekayə qurur, dinləyiciləri ilk saniyədən cəlb edirəm', dim: 'K' },
      { text: 'Sual gəldikdə özümü sakin saxlayıb düşünülmüş cavab verirəm', dim: 'S' },
    ],
  },
  {
    id: 11,
    text: '5 il sonra karyeranızda harada olmaq istədiyinizi düşünürsünüz. Yanaşmanız nədir?',
    options: [
      { text: 'Konkret vəzifə, sahə və ya şirkət müəyyən edib oraya çatmaq üçün yol xəritəsi hazırlayıram', dim: 'C' },
      { text: 'Güclü tərəflərimi analiz edib ən böyük potensialımı ortaya çıxaracaq yolu seçirəm', dim: 'A' },
      { text: 'Hər gün kiçik addımlar atıram — uzaq hədəfə tədricən yaxınlaşıram', dim: 'S' },
      { text: 'Sahəmdəki uğurlu liderləri müşahidə edib onlardan öyrənirəm', dim: 'L' },
    ],
  },
  {
    id: 12,
    text: 'Texniki bir mövzunu texniki bilgisi olmayan yöneticilərə izah etmək lazımdır. Nə edirsiniz?',
    options: [
      { text: 'Sadə analogiya və gündəlik həyatdan nümunələr tapıram', dim: 'K' },
      { text: 'Yalnız onlar üçün əhəmiyyətli olan məlumat hissəsini seçirəm', dim: 'A' },
      { text: 'Əvvəlcə onların əsas sualını öyrənir, ona fokuslanıram', dim: 'D' },
      { text: 'Bu imkanı özümü peşəkar kontekstdə tanıtmaq üçün də istifadə edirəm', dim: 'C' },
    ],
  },
  {
    id: 13,
    text: 'İş yükü artdı, stress hiss edirsiniz. Nə edirsiniz?',
    options: [
      { text: 'Ən vacib tapşırıqları ayırıb qalanları sonraya qoyur, özümü tənzimləyirəm', dim: 'S' },
      { text: 'Komandamdan bəzi işlərə dəstək olmalarını xahiş edirəm', dim: 'L' },
      { text: 'Stressin əsl səbəbini müəyyən edib onu aradan qaldırmağa çalışıram', dim: 'A' },
      { text: 'Rəhbərimi vəziyyətlə tanış edib prioritetlər barədə yenidən razılaşıram', dim: 'D' },
    ],
  },
  {
    id: 14,
    text: 'İki komanda üzvü arasında ciddi münaqişə var, bu sizin işinizə də təsir edir. Nə edirsiniz?',
    options: [
      { text: 'Hər iki tərəfin baxış bucağını anlayıb vasitəçi qismində araya girirəm', dim: 'L' },
      { text: 'Hər iki tərəfi bir araya gətirib açıq ünsiyyəti asanlaşdırıram', dim: 'K' },
      { text: 'Hər iki tərəfin qəbul edə biləcəyi kompromis həll irəli sürürəm', dim: 'D' },
      { text: 'Münaqişəyə qoşulmadan öz işimə fokuslanıram', dim: 'S' },
    ],
  },
  {
    id: 15,
    text: 'Böyük bir qərar vermək lazım gəlir, məlumat tam deyil. Nə edirsiniz?',
    options: [
      { text: 'Mövcud məlumatı sistematik analiz edir, ən ağlabatan gümanlarla irəliləyirəm', dim: 'A' },
      { text: 'Mütəxəssislərlə məsləhətləşir, müxtəlif perspektivlər toplayıram', dim: 'D' },
      { text: 'Komandamın kollektiv bilik və təcrübəsinə istinad edirəm', dim: 'L' },
      { text: 'Qeyri-müəyyənliyə baxmayaraq vaxtında qərar verib irəliləyirəm', dim: 'S' },
    ],
  },
  {
    id: 16,
    text: 'Sahənizin ən uğurlu liderlərindən biri ilə 30 dəqiqəlik görüş imkanınız var. Nə edirsiniz?',
    options: [
      { text: 'Onların karyera yolu və əsas dərslər haqqında dərin suallar verirəm', dim: 'C' },
      { text: 'Öz ideyalarımı bölüşür, onların fikrini alıram', dim: 'K' },
      { text: 'Birgə iş imkanları haqqında konkret danışıqlar aparmağa çalışıram', dim: 'D' },
      { text: 'Sahəmin gələcəyi haqqında analitik baxışını öyrənirəm', dim: 'A' },
    ],
  },
  {
    id: 17,
    text: 'Tamamilə yeni bir vəzifəyə keçdiniz. İlk ayınızda yanaşmanız nədir?',
    options: [
      { text: 'Mövcud prosesləri, dinamikanı və rəqəmsal görüntünü tez anlamağa çalışıram', dim: 'A' },
      { text: 'Komandanın güclü tərəflərini anlayıb onları ən yaxşı şəkildə istifadə etməyə başlayıram', dim: 'L' },
      { text: 'Bu vəzifəni karyera hədəflərimə doğru bir pilləkən kimi görüb inkişaf planı qururum', dim: 'C' },
      { text: 'İlk kiçik uğurları qazanmaq üçün prioritetlərimi müəyyən edib həmin sahəyə fokuslanıram', dim: 'S' },
    ],
  },
  {
    id: 18,
    text: 'Kolleqanızın işi standartı ödəmir. Buna necə yanaşırsınız?',
    options: [
      { text: 'Bilavasitə, amma hörmətlə bu barədə açıq söhbət edirəm', dim: 'K' },
      { text: 'Zəif tərəflərini gücləndirib professional inkişafına töhfə vermək istəyirəm', dim: 'L' },
      { text: 'Onunla müəyyən müddət ərzindəki davranış barədə konkret razılaşmaya nail olmağa çalışıram', dim: 'D' },
      { text: 'Məsələni rəhbərə çatdırmadan öncə özüm həll etməyə çalışıram', dim: 'S' },
    ],
  },
  {
    id: 19,
    text: 'Büdcəniz kəsildi, amma hədəfləriniz eyni qaldı. Nə edirsiniz?',
    options: [
      { text: 'Minimum resursla maksimum nəticə üçün kreativ həll yolları axtarıram', dim: 'A' },
      { text: 'Bu çətin vəziyyəti imkanlara çevirmək, özümü sübut etmək fürsəti kimi görürəm', dim: 'C' },
      { text: 'Rəhbərlik ilə hədəflərin realist şəkildə yenidən müəyyən edilməsi barədə danışıq aparıram', dim: 'D' },
      { text: 'Ən kritik hədəfləri seçib qalanlarını sonrakı dövrə saxlayıram', dim: 'S' },
    ],
  },
  {
    id: 20,
    text: 'İllik nəticələrə baxırsınız. Bu ilin ən mühüm dərsi nə idi?',
    options: [
      { text: 'Güclü tərəflərimi daha yaxşı anladım — karyeramı bu istiqamətdə inkişaf etdirəcəyəm', dim: 'C' },
      { text: 'İnsanlarla ünsiyyətimdə daha dərin, daha effektiv olduğumu hiss etdim', dim: 'K' },
      { text: 'Qərar qəbulumda daha analitik, daha faktlara əsaslı olduğumu fərq etdim', dim: 'A' },
      { text: 'Özümü daha yaxşı idarə etmək, stressə daha effektiv yanaşmaq öyrəndim', dim: 'S' },
    ],
  },
]

// Count how many times each dimension appears across all questions
export const DIMENSION_MAX: Record<DimensionKey, number> = (() => {
  const counts: Record<DimensionKey, number> = { K: 0, L: 0, A: 0, D: 0, S: 0, C: 0 }
  for (const q of QUESTIONS) {
    for (const opt of q.options) {
      counts[opt.dim]++
    }
  }
  return counts
})()

// Compute normalized scores (0-100) from a raw answers map
export function computeScores(answers: Record<number, DimensionKey>): Record<DimensionKey, number> {
  const raw: Record<DimensionKey, number> = { K: 0, L: 0, A: 0, D: 0, S: 0, C: 0 }
  for (const [qId, dim] of Object.entries(answers)) {
    const q = QUESTIONS.find(q => q.id === Number(qId))
    if (q) raw[dim as DimensionKey]++
  }
  const scores: Record<DimensionKey, number> = { K: 0, L: 0, A: 0, D: 0, S: 0, C: 0 }
  for (const dim of Object.keys(raw) as DimensionKey[]) {
    scores[dim] = DIMENSION_MAX[dim] > 0
      ? Math.round((raw[dim] / DIMENSION_MAX[dim]) * 100)
      : 0
  }
  return scores
}

export function getTopDimensions(scores: Record<DimensionKey, number>): { top: DimensionKey[]; bottom: DimensionKey[] } {
  const sorted = (Object.keys(scores) as DimensionKey[]).sort((a, b) => scores[b] - scores[a])
  return { top: sorted.slice(0, 2), bottom: sorted.slice(-2).reverse() }
}
