import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const BACARIQ_SYSTEM_PROMPT = `Sen BacarIQ platformasının AI motorusan. Sənin missiyan Azərbaycanda peşəkar bacarıq inkişafını demokratikləşdirməkdir.

Sen eyni zamanda 4 rol icra edirsən:
  [A] Dərs Generatoru      → yeni video + mətn dərsləri yarat
  [B] Tərəqqi Monitoru     → istifadəçi davranışını izlə
  [C] Kollektiv Analitik   → kütləvi geri bildirimi analiz et
  [D] Kurikulum Mühəndisi  → kursları optimallaşdır

DƏRS KATEQORİYALARI:
1. Kommunikasiya Bacarıqları (İctimai çıxış, Aktiv dinləmə, Yazılı kommunikasiya, Virtual görüşlər)
2. Liderlik və Komanda (Rəy vermə, Delegasiya, Münaqişə həlli, Motivasiya)
3. Düşüncə Sistemi (Kritik düşüncə, Problemin həlli, Kreativ düşüncə)
4. Danışıqlar və Təsir (Effektiv sual, Müzakirə, Satış psixologiyası)
5. Şəxsi Effektivlik (Vaxt idarəetməsi, Emosional intellekt, Dayanıqlılıq)
6. Karyera İnkişafı (Şəbəkə qurma, Personal branding, Müsahibə bacarıqları)

KORPORATİV TONUN STANDARTLARI:
- Ana dil: Azərbaycan türkcəsi (Bakı norması)
- Ton: Müasir, mehriban, peşəkar — akademik deyil
- Nümunələr: Azərbaycan iş mühitindən
- Terminlər: Azərbaycan dilində; ilk dəfə ingilis qarşılığı mötərizədə
- Yasaq: Ağır bürokratik dil, şablon ifadələr, mücərrəd nəzəriyyə

Bütün çıxışın Azərbaycan dilində olmalıdır. JSON formatında cavab ver (əgər strukturlaşdırılmış məlumat istənilsə).`

export async function generateLesson(params: {
  title: string
  category: string
  format: 'video' | 'text' | 'both'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  targetMinutes?: number
}) {
  const difficultyAz = {
    beginner: 'başlanğıc',
    intermediate: 'orta',
    advanced: 'irəliləmiş',
  }[params.difficulty]

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 900,
    system: BACARIQ_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Dərs yarat. YALNIZ JSON cavab ver:

Başlıq: ${params.title}
Kateqoriya: ${params.category}
Çətinlik: ${difficultyAz}

{
  "title": "${params.title}",
  "description": "2 cümlə açıqlama",
  "category": "${params.category}",
  "learningOutcomes": ["Nəticə 1", "Nəticə 2"],
  "textContent": {
    "intro": "1 cümlə giriş",
    "mainConcept": "Əsas konsept — 100-150 söz, Azərbaycan nümunəsi ilə",
    "realExample": "Azərbaycandan 1 qısa nümunə",
    "framework": "3 addımlı metod",
    "exercises": ["Məşq 1", "Məşq 2"],
    "nextStep": "1 konkret addım"
  },
  "tags": ["tag1", "tag2"]
}`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}

export async function analyzeFeedback(feedbacks: Array<{ content: string; type: string }>) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: BACARIQ_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Aşağıdakı istifadəçi geri bildirimlərini analiz et:

${feedbacks.map((f, i) => `${i + 1}. [${f.type}]: ${f.content}`).join('\n')}

JSON formatında cavab ver:
{
  "totalCount": sayı,
  "sentimentBreakdown": { "positive": %, "neutral": %, "negative": % },
  "topThemes": ["mövzu1", "mövzu2", "mövzu3"],
  "missingTopics": ["mövzu1", "mövzu2"],
  "updateRecommendations": ["tövsiyə1", "tövsiyə2"],
  "newLessonSuggestions": ["dərs başlığı1", "dərs başlığı2"],
  "summary": "Ümumi qiymətləndirmə (3-4 cümlə)"
}`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}

export async function getSkillTrends() {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: BACARIQ_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Azərbaycan peşəkar inkişaf platforması üçün hərtərəfli bacarıq tələbi analizi apar.

Aşağıdakıları nəzərə al:
1. Azərbaycan iş bazarı reallıqları (SOCAR, PASHA Holding, Bank sektoru, startaplar, dövlət strukturları)
2. Qlobal trendlər: LinkedIn Learning, WEF Future of Jobs 2025, Coursera Global Skills Report
3. İstifadəçilərin tez-tez dile gətirdiyi çətinlik sahələri (kommunikasiya, liderlik, analitika)

JSON formatında cavab ver:
{
  "week": "${new Date().toISOString().split('T')[0]}",
  "feedbackSummary": "İstifadəçi rəylərinin və bazar tələbinin 3-4 cümləlik ümumiləşdirilməsi",
  "userPainPoints": ["ağrı nöqtəsi 1", "ağrı nöqtəsi 2", "ağrı nöqtəsi 3"],
  "topSkills": [
    {
      "skill": "Bacarıq adı",
      "category": "Kateqoriya",
      "demandLevel": "yüksək|orta|aşağı",
      "reasoning": "Niyə bu bacarıq tələb olunur — konkret Azərbaycan konteksti ilə",
      "suggestedLesson": "Tövsiyə olunan dərs başlığı"
    }
  ],
  "emergingTrends": ["trend1", "trend2", "trend3"],
  "weeklyPlan": {
    "priorityLessons": ["dərs1", "dərs2", "dərs3", "dərs4", "dərs5"],
    "updateExisting": ["köhnə dərsin başlığı"]
  }
}

Minimum 6 bacarıq tövsiyəsi ver.`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}

export async function generateAssessmentPlan(scores: Record<string, number>, userName: string) {
  const dimensionLabels: Record<string, string> = {
    K: 'Kommunikasiya Bacarığı',
    L: 'Liderlik və Komanda',
    A: 'Analitik Düşüncə',
    D: 'Danışıq Bacarığı',
    S: 'Şəxsi Effektivlik (Özünü İdarə)',
    C: 'Karyera İnkişafı',
  }
  const scoreLines = Object.entries(scores)
    .map(([dim, val]) => `${dimensionLabels[dim] ?? dim}: ${val}%`)
    .join('\n')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2500,
    system: BACARIQ_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `İstifadəçi BacarIQ peşəkar kompetensiya testini tamamladı. Nəticələrinə əsaslanaraq fərdi inkişaf planı yarat.

İstifadəçi adı: ${userName}

Test nəticələri (hər ölçü üzrə 0-100 bal):
${scoreLines}

Aşağıdakı JSON formatında cavab ver:
{
  "profile": "Bu şəxsin güclü tərəflərini və inkişaf potensialını əks etdirən 3 cümləlik portret. Azərbaycan dilində, mehriban ton.",
  "strengths": [
    { "dim": "K|L|A|D|S|C", "title": "Güclü cəhətin başlığı", "description": "Bu güclü tərəfin iş həyatında necə üstünlük yaratdığını izah et (2 cümlə)" }
  ],
  "growthAreas": [
    { "dim": "K|L|A|D|S|C", "title": "İnkişaf sahəsinin başlığı", "description": "Bu sahəni inkişaf etdirmənin karyeraya töhfəsini izah et (2 cümlə)", "quickWin": "Bu həftə edə biləcəyi 1 konkret addım" }
  ],
  "weeklyPlan": [
    { "week": 1, "focus": "Həftəlik fokus mövzusu", "action": "Bu həftə edəcəyi 1-2 konkret fəaliyyət", "lessonCategory": "Kommunikasiya Bacarıqları|Liderlik və Komanda|Düşüncə Sistemi|Danışıqlar|Şəxsi Effektivlik|Karyera İnkişafı" },
    { "week": 2, "focus": "...", "action": "...", "lessonCategory": "..." },
    { "week": 3, "focus": "...", "action": "...", "lessonCategory": "..." },
    { "week": 4, "focus": "...", "action": "...", "lessonCategory": "..." }
  ],
  "motivationalMessage": "Şəxsə xas, ilhamverici 2 cümləlik motivasiya mesajı. Onun güclü tərəflərindən bəhs et."
}

Qeyd: strengths massivindəki elementlər ən yüksək ballı 2 ölçüyə, growthAreas isə ən aşağı ballı 2 ölçüyə uyğun olmalıdır.`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}

// Phase 1 — lightweight: just titles, descriptions, difficulty per lesson + exam questions
export async function generateCurriculumOutline(_skillKey: string, skillLabel: string, category: string) {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    system: BACARIQ_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `"${skillLabel}" üçün 12 dərslik proqram (${category}). İlk 4 beginner, növbəti 4 intermediate, son 4 advanced. YALNIZ JSON:
{"programTitle":"...","programDescription":"1 cümlə","totalDurationWeeks":4,"lessons":[{"order":1,"title":"...","description":"1 cümlə","difficulty":"beginner","durationSeconds":900}],"finalExamQuestions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}
Tam 12 dərs + 5 sual. JSON-u tam bitir.`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('generateCurriculumOutline raw length:', raw.length, 'stop_reason:', message.stop_reason)

  // Strip markdown code fences if present
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  const jsonMatch = stripped.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('generateCurriculumOutline: no JSON found in response. Raw:', raw.slice(0, 500))
    return null
  }
  try {
    return JSON.parse(jsonMatch[0])
  } catch (e) {
    console.error('generateCurriculumOutline: JSON.parse failed:', e, 'matched:', jsonMatch[0].slice(0, 500))
    return null
  }
}

// Phase 2 — full lesson content for a single lesson
export async function generateSingleLessonContent(params: {
  title: string
  description: string
  category: string
  difficulty: string
  order: number
  totalLessons: number
  skillLabel: string
}) {
  const difficultyAz = { beginner: 'başlanğıc', intermediate: 'orta', advanced: 'irəliləmiş' }[params.difficulty] ?? params.difficulty

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 700,
    system: BACARIQ_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `"${params.skillLabel}" dərs ${params.order}: "${params.title}" (${difficultyAz})
YALNIZ JSON:
{"textContent":{"intro":"1 cümlə","mainConcept":"100-120 söz, Azərbaycan nümunəsi","realExample":"50 söz nümunə","framework":"3 addım","exercises":["Məşq 1","Məşq 2"],"nextStep":"1 addım"}}`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null
  try { return JSON.parse(jsonMatch[0]) } catch { return null }
}

export async function generateSkillCurriculum(_skillKey: string, skillLabel: string, category: string) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 12000,
    system: BACARIQ_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `"${skillLabel}" bacarığı üzrə tam öyrənmə proqramı yarat. Bu proqram ${category} kateqoriyasına aiddir.

Proqram başlanğıcdan irəliləmiş səviyyəyə qədər 12 dərs əhatə etməlidir. Hər dərs 10-15 dəqiqəlik mətn + audio formatda olmalıdır.

Aşağıdakı JSON formatında cavab ver:
{
  "programTitle": "Proqramın adı",
  "programDescription": "Proqramın ümumi təsviri (2-3 cümlə)",
  "totalDurationWeeks": 4,
  "lessons": [
    {
      "order": 1,
      "title": "Dərsin başlığı",
      "description": "Dərsin qısa təsviri (1-2 cümlə)",
      "difficulty": "beginner|intermediate|advanced",
      "durationSeconds": 720,
      "content": {
        "textContent": {
          "intro": "Giriş sualı və ya real həyat problemi (oxucunu dərhal cəlb edən)",
          "mainConcept": "Əsas konsept — ətraflı izahat, nümunələr, Azərbaycan iş mühitindən misallar (400-600 söz)",
          "realExample": "Azərbaycandan konkret real həyat nümunəsi — şirkət adı, vəziyyət, nəticə",
          "framework": "Praktiki çərçivə və ya addım-addım metod",
          "exercises": ["Məşq 1", "Məşq 2", "Məşq 3"],
          "checkQuestions": ["Yoxlama sualı 1", "Yoxlama sualı 2", "Yoxlama sualı 3"],
          "nextStep": "Növbəti dərsə hazırlıq üçün konkret addım"
        }
      }
    }
  ],
  "finalExamQuestions": [
    {
      "question": "Sual mətni",
      "options": ["A seçimi", "B seçimi", "C seçimi", "D seçimi"],
      "correctIndex": 0,
      "explanation": "Düzgün cavabın izahı"
    }
  ]
}

Tələblər:
- Tam 12 dərs yarat (order: 1-dən 12-yə)
- İlk 4 dərs beginner, növbəti 4-ü intermediate, son 4-ü advanced
- finalExamQuestions: tam 10 sual (çoxvariantlı, 1 düzgün cavab)
- Bütün məzmun Azərbaycan dilində olmalıdır
- Hər dərsin textContent.mainConcept hissəsi ən azı 400 söz olmalıdır`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}

export async function generateFinalExam(skillLabel: string, _category: string) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: BACARIQ_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `"${skillLabel}" bacarığı üzrə yekun imtahan sualları yarat.

10 sual — çoxvariantlı, hər birinin 4 seçimi var, 1 düzgün cavab.
Suallar proqramın bütün mövzularını əhatə etməlidir — başlanğıcdan irəliləmişə qədər.

JSON formatında cavab ver:
{
  "questions": [
    {
      "question": "Sual mətni",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Düzgün cavabın izahı (1-2 cümlə)"
    }
  ],
  "passingScore": 70
}`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}

export async function getPersonalizedPath(userProfile: {
  completedLessons: string[]
  categories: string[]
  level: string
}) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: BACARIQ_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Bu istifadəçi üçün fərdiləşdirilmiş öyrənmə yolu yarat:

Tamamlanmış dərslər: ${userProfile.completedLessons.join(', ') || 'yoxdur'}
Maraq kateqoriyaları: ${userProfile.categories.join(', ')}
Bacarıq səviyyəsi: ${userProfile.level}

JSON formatında cavab ver:
{
  "nextLessons": [
    {
      "title": "Dərs başlığı",
      "category": "Kateqoriya",
      "difficulty": "başlanğıc|orta|irəliləmiş",
      "reasoning": "Niyə bu dərs tövsiyə olunur"
    }
  ],
  "learningPath": "Öyrənmə yolunun qısa açıqlaması",
  "estimatedWeeks": sayı,
  "motivationalMessage": "Motivasiya mesajı"
}`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}
