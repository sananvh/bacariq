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

// ─── Questions ────────────────────────────────────────────────────────────────
//
// Designed around 3 sinergiya pairs so the test directly measures the balance
// between each paired dimension:
//
//  Q1–Q6   →  K (Kommunikasiya) ↔ L (Liderlik)
//  Q7–Q12  →  A (Analitik Düşüncə) ↔ D (Danışıqlar)
//  Q13–Q18 →  S (Özünü İdarə) ↔ C (Karyera İnkişafı)
//  Q19–Q20 →  general mix
//
// Each question in a pair block has both paired dimensions as its primary
// options so a user's natural preference is captured directly in the scores.
// ──────────────────────────────────────────────────────────────────────────────

export const QUESTIONS: Question[] = [
  // ── K ↔ L pair ──────────────────────────────────────────────────────────────
  {
    id: 1,
    text: 'İş yerinizdə mühüm bir dəyişiklik baş verir. Komandaya bu barədə məlumat vermək sizin üzərinizdədir. Yanaşmanız nə olacaq?',
    options: [
      { text: 'Hər kəsin vəziyyəti aydın anlayacağı şəkildə strukturlaşdırılmış mesaj hazırlayıram, sualları birbaşa cavablandırıram', dim: 'K' },
      { text: 'Komandanı bu dəyişikliyə hazırlamaq üçün motivasiyanı idarə edirəm, narahatlıqları birlikdə həll edirəm', dim: 'L' },
      { text: 'Dəyişikliyin gözlənilən nəticələrini faktlara əsasən analiz edirəm', dim: 'A' },
      { text: 'Bütün maraqlı tərəflərlə razılığa gəlmək üçün danışıqlar aparıram', dim: 'D' },
    ],
  },
  {
    id: 2,
    text: 'Komanda üzvünüz işdə ciddi çətinlik yaşayır, bu ümumi nəticəyə təsir edir. Necə davranırsınız?',
    options: [
      { text: 'Onunla fərdi görüş keçirir, güclü tərəflərini ortaya çıxarmağa, inkişafına yardım etməyə çalışıram', dim: 'L' },
      { text: 'Problemi bilavasitə, amma hörmətlə müzakirə edirəm — konkret gözləntiləri açıq şəkildə ifadə edirəm', dim: 'K' },
      { text: 'Bu vəziyyətin öz işimə olan təsirini minimuma endirmək üçün planımı yenidən tənzimləyirəm', dim: 'S' },
      { text: 'Hər iki tərəfin ehtiyacını ödəyəcək razılaşmaya nail olmağa çalışıram', dim: 'D' },
    ],
  },
  {
    id: 3,
    text: 'Yeni komandaya rəhbərlik etməlisiniz. İlk görüşünüzdə ən mühüm şey sizin üçün nədir?',
    options: [
      { text: 'Öz idarəetmə fəlsəfəmi və gözləntiləri aydın şəkildə çatdırmaq, açıq ünsiyyət mühiti qurmaq', dim: 'K' },
      { text: 'Hər üzvün güclü tərəfini anlamaq, rolları buna uyğun bölmək və ümumi hədəfi müəyyən etmək', dim: 'L' },
      { text: 'Komandanın mövcud performans göstəricilərini analiz edib zəif nöqtələri müəyyən etmək', dim: 'A' },
      { text: 'Bu rəhbərlik imkanını karyera hədəflərimə doğru strateji bir addım kimi görüb planlaşdırmaq', dim: 'C' },
    ],
  },
  {
    id: 4,
    text: 'Bir toplantıda təklifinizi rədd etdilər. Sizcə qərar yanlışdır. Nə edirsiniz?',
    options: [
      { text: 'Fikirlərimi daha aydın, faktlara əsaslanan şəkildə yenidən ifadə edirəm', dim: 'K' },
      { text: 'Qrupdakı müxtəlif mövqeləri anlayıb, daha yaxşı qərara doğru müzakirəni istiqamətləndirirəm', dim: 'L' },
      { text: 'Qərarı qəbul edib, növbəti fürsatda mövqeyimi bildirirəm', dim: 'S' },
      { text: 'Fikirlərimi dəstəkləyəcək insanlarla ayrıca danışıqlar aparıram', dim: 'D' },
    ],
  },
  {
    id: 5,
    text: 'Bir layihədə komanda üzvləri arasında münaqişə var, bu işi ləngidir. Nə edirsiniz?',
    options: [
      { text: 'Hər iki tərəfin öz düşüncəsini açıq ifadə edə biləcəyi mühit yaradıram, dialoqu asanlaşdırıram', dim: 'K' },
      { text: 'Münaqişənin kökünü anlayıb, hər iki tərəfi ümumi hədəf ətrafında birləşdirməyə çalışıram', dim: 'L' },
      { text: 'Hər iki tərəfin qəbul edəcəyi kompromis həll irəli sürürəm', dim: 'D' },
      { text: 'Bu vəziyyəti uzunmüddətli karyerama dərs olaraq qiymətləndirirəm', dim: 'C' },
    ],
  },
  {
    id: 6,
    text: 'Rəhbəriniz sizə qeyri-müəyyən tapşırıq verib gedir. Nə edirsiniz?',
    options: [
      { text: 'Tapşırığı aydınlaşdırmaq üçün dərhal suallar verirəm, gözləntiləri dəqiqləşdirirəm', dim: 'K' },
      { text: 'Komanda üzvlərimi cəlb edib birlikdə ən yaxşı yanaşmanı müəyyən edirəm', dim: 'L' },
      { text: 'Mövcud məlumatla irəliləyirəm — lazım gəlsə sonra soruşacağam', dim: 'S' },
      { text: 'Tapşırığın məqsədini anlamaq üçün mövcud məlumatları analiz edirəm', dim: 'A' },
    ],
  },

  // ── A ↔ D pair ──────────────────────────────────────────────────────────────
  {
    id: 7,
    text: 'Şirkətimizdə əhəmiyyətli müqavilə üçün danışıqlar aparacaqsınız. Necə hazırlaşırsınız?',
    options: [
      { text: 'Bazar məlumatlarını, qarşı tərəfin mövqeyini, alternativ ssenariləri sistematik analiz edirəm', dim: 'A' },
      { text: 'Qarşı tərəfin prioritetlərini anlayıb hər iki tərəf üçün faydalı nöqtələri müəyyən edirəm', dim: 'D' },
      { text: 'Komandamı bu prosesə cəlb edib hər birinin güclü tərəfini istifadə edirəm', dim: 'L' },
      { text: 'Mövqeyimi aydın, inandırıcı şəkildə çatdıracaq bir çərçivə hazırlayıram', dim: 'K' },
    ],
  },
  {
    id: 8,
    text: 'Layihəniz üçün büdcə təsdiqlənmir. Bu gözlənilməz bir maneədir. Nə edirsiniz?',
    options: [
      { text: 'Layihənin dəyərini sübut edəcək faktlara əsaslanan güclü bir iş dosyası hazırlayıram', dim: 'A' },
      { text: 'Qərar vericilərlə müzakirə aparıb büdcəni almaq ya da layihəni yenidən formatlamaq üçün inandırıram', dim: 'D' },
      { text: 'Mövcud resurslarla ən vacib hissəni tamamlamaq üçün yenidən planlaşdırıram', dim: 'S' },
      { text: 'Bu vəziyyəti şəxsi yaradıcılığımı nümayiş etdirmək üçün bir imkan kimi görürəm', dim: 'C' },
    ],
  },
  {
    id: 9,
    text: 'Araşdırmanıza görə mövcud iş yanaşmanız artıq keçərli deyil, dəyişməlidir. Komanda razı deyil. Nə edirsiniz?',
    options: [
      { text: 'Faktları, rəqəmləri, beynəlxalq təcrübəni sənədləşdirib strukturlaşdırılmış arqument hazırlayıram', dim: 'A' },
      { text: 'Maraqlı tərəflərin narahatlığını anlayıb onları dəyişikliyə inandırmaq üçün strateji söhbətlər aparıram', dim: 'D' },
      { text: 'Komandanı prosesə cəlb edib dəyişiklik üçün ümumi razılıq yaradıram', dim: 'L' },
      { text: 'Narahatlığımı açıq şəkildə ifadə edib rəhbərin fikrini almağa çalışıram', dim: 'K' },
    ],
  },
  {
    id: 10,
    text: 'Rəhbəriniz işinizi kəskin tənqid edir. Reaksiyanız nə olur?',
    options: [
      { text: 'Tənqidin haqlı olub-olmadığını faktlara əsasən dəyərləndirirəm — nəyi düzəltmək lazımdır?', dim: 'A' },
      { text: 'Öz nöqteyi-nəzərimi hörmətlə, amma möhkəm şəkildə bildirirəm', dim: 'D' },
      { text: 'Tənqidin hansı konkret nöqtələrə aid olduğunu aydınlaşdırmaq üçün suallar verirəm', dim: 'K' },
      { text: 'Emosiyalarımı bir kənara qoyub sakit şəkildə fikirləşirəm', dim: 'S' },
    ],
  },
  {
    id: 11,
    text: 'Yeni bir layihə üçün iki fərqli strategiya arasında seçim var. Qərar sizdən gözlənir.',
    options: [
      { text: 'Hər iki strategiyanın riskini, maliyyə nəticəsini, bazar faktlarını müqayisəli analiz edirəm', dim: 'A' },
      { text: 'Əsas maraqlı tərəflərin hansı strategiyaya meyil etdiyini öyrənib ümumi razılıq axtarıram', dim: 'D' },
      { text: 'Komandamı toplantıya çağırıb kollektiv qərarı birlikdə formalaşdırıram', dim: 'L' },
      { text: 'Ən vacib meyarları müəyyən edib vaxtında qərar verirəm', dim: 'S' },
    ],
  },
  {
    id: 12,
    text: 'Müştəri layihənin istiqaməti ilə bağlı narazılığını bildirdi. Yanaşmanız nədir?',
    options: [
      { text: 'Layihənin başlanğıc meyarlara uyğun olduğunu sübut edəcək faktlara əsaslanan hesabat hazırlayıram', dim: 'A' },
      { text: 'Müştərinin əsl narahatlığını anlamaq üçün dərin söhbət aparıram, birgə həll axtarıram', dim: 'D' },
      { text: 'Müştəriyə şəffaf şəkildə vəziyyəti izah edirəm, gözləntiləri yenidən müəyyən edirəm', dim: 'K' },
      { text: 'Komanda ilə müştəri problemini birlikdə həll etmək üçün operativ görüş keçirirəm', dim: 'L' },
    ],
  },

  // ── S ↔ C pair ──────────────────────────────────────────────────────────────
  {
    id: 13,
    text: 'Gözlənilmədən böyük bir layihə üçün çağırıldınız — karyeranız üçün böyük imkandır, lakin mövcud işləriniz artıq çoxdur.',
    options: [
      { text: 'Bunun karyerama uzunmüddətli töhvəsini qiymətləndirirəm — bu imkan üçün vaxt tapıram', dim: 'C' },
      { text: 'Mövcud öhdəliklərim üçün vaxt cədvəlimi yenidən tənzimləyirəm — həm var işlərimi, həm yeni layihəni idarə edəcəyəm', dim: 'S' },
      { text: 'Layihənin şərtlərini mənim vəziyyətimlə uyğunlaşdırmaq üçün danışıq aparıram', dim: 'D' },
      { text: 'Komandamdan bəzi tapşırıqları həvalə edirəm ki, imkan üçün yer açım', dim: 'L' },
    ],
  },
  {
    id: 14,
    text: '5 il sonra karyeranızda harada olmaq istədiyinizi düşünürsünüz. Yanaşmanız nədir?',
    options: [
      { text: 'Konkret vəzifə, sahə və ya şirkəti müəyyən edib oraya çatmaq üçün yol xəritəsi hazırlayıram', dim: 'C' },
      { text: 'Hər gün kiçik addımlar atıram — disiplin, fokus və özünü idarəetmə ilə uzağa çatacağam', dim: 'S' },
      { text: 'Güclü tərəflərimi analiz edib ən böyük potensialımı ortaya çıxaracaq yolu seçirəm', dim: 'A' },
      { text: 'Sahəmin uğurlu liderlərini müşahidə edib onlardan öyrənirəm', dim: 'L' },
    ],
  },
  {
    id: 15,
    text: 'Bir gün işin içindəsiniz: görüşlər, e-poçtlar, acil tapşırıqlar. Axşam bir saatınız var. Nə edirsiniz?',
    options: [
      { text: 'Sabah üçün ən vacib 3 tapşırığı sıralayır, sabahın planını hazırlayıram', dim: 'S' },
      { text: 'Şəbəkəmdəki bir mütəxəssislə əlaqə saxlayıb karyerama dəyər katacak bir söhbət edirəm', dim: 'C' },
      { text: 'Komanda ilə ünsiyyətimdə gecikmiş yazışmaları cavablandırıram', dim: 'K' },
      { text: 'Sabahkı vacib görüş üçün strateji hazırlıq edirəm', dim: 'D' },
    ],
  },
  {
    id: 16,
    text: 'İllik qiymətləndirmədən sonra rəhbəriniz daha "görünür" olmağı tövsiyə edir. Reaksiyanız nədir?',
    options: [
      { text: 'Sənayedəki tədbirlərə, ictimai platformalara, şəbəkə qurmağa daha çox sərmayə qoyuram', dim: 'C' },
      { text: 'Görünürlüğün öz işimə diqqətimdən yayındırmamasına diqqət edirəm — performansım özünü sübut edəcək', dim: 'S' },
      { text: 'Fikirlərimi paylaşmaq üçün toplantılarda daha aktiv oluram', dim: 'K' },
      { text: 'Rəhbərlə açıq danışıq aparıb "görünürlük" altında nəyin nəzərdə tutulduğunu dəqiqləşdirirəm', dim: 'D' },
    ],
  },
  {
    id: 17,
    text: 'Karyeranızda irəliləmək üçün yeni bir sahənin biliyini mənimsəmək lazımdır. Yanaşmanız nədir?',
    options: [
      { text: 'Həmin sahənin ekspertləri ilə əlaqə qurur, mentorluq axtarır, bu sahəyə strateji investisiya edirəm', dim: 'C' },
      { text: 'Özüm üçün fərdi öyrənmə planı hazırlayır, hər gün müəyyən vaxt ayırıram', dim: 'S' },
      { text: 'Mövzunu sistematik şəkildə araşdırır, mənbələri analiz edirəm', dim: 'A' },
      { text: 'Artıq bu bilikli insanlarla söhbətlər vasitəsilə lazım olan informasiyanı alıram', dim: 'D' },
    ],
  },
  {
    id: 18,
    text: 'Böyük bir uğursuzluq yaşadınız — layihə çöküb, müştəri getdi. İlk reaksiyanız nə olur?',
    options: [
      { text: 'Özümü tez toparlayıb növbəti addımı planlaşdırıram — irəli baxıram', dim: 'S' },
      { text: 'Bu uğursuzluqdan karyerama nə öyrənə biləcəyimi, strateji yönümümü düşünürəm', dim: 'C' },
      { text: 'Nəyin, niyə yanlış getdiyini sistematik şəkildə analiz edirəm', dim: 'A' },
      { text: 'Komanda ilə açıq söhbət edib birlikdə dərslər çıxarıram', dim: 'L' },
    ],
  },

  // ── General mix ─────────────────────────────────────────────────────────────
  {
    id: 19,
    text: 'Peşəkar bir konfrans və ya sənaye tədbirinə gedirsəniz. Əsas məqsədiniz nədir?',
    options: [
      { text: 'Yeni insanlarla tanış olmaq, uzunmüddətli peşəkar əlaqələr qurmaq', dim: 'C' },
      { text: 'Sahəmdəki son trendlər və yeniliklər haqqında öyrənmək', dim: 'A' },
      { text: 'Öz ideyalarımı bölüşmək, digərləri ilə mənalı müzakirə aparmaq', dim: 'K' },
      { text: 'Potensial tərəfdaş və ya müştərilərlə konkret iş danışıqlarına başlamaq', dim: 'D' },
    ],
  },
  {
    id: 20,
    text: 'Həftənin ilk günü masanızda 10-dan çox tapşırıq var. Nə edirsəniz?',
    options: [
      { text: 'Tapşırıqları əhəmiyyəti və vaxtındalığına görə sıralayıb ardıcıl yerinə yetirirəm', dim: 'S' },
      { text: 'Bəzi tapşırıqları komanda üzvlərinin güclü tərəflərinə görə həvalə edirəm', dim: 'L' },
      { text: 'Hansı tapşırıqların əsl nəticəyə töhfə verdiyini soruşur, lazımsızları kənarlaşdırıram', dim: 'A' },
      { text: 'Daha az aktual olan bəzi son tarixlər barədə yenidən razılaşmağa çalışıram', dim: 'D' },
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
