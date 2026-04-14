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
    model: 'claude-opus-4-6',
    max_tokens: 4000,
    system: BACARIQ_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Bu mövzu üzrə tam dərs yarat:

Başlıq: ${params.title}
Kateqoriya: ${params.category}
Format: ${params.format === 'video' ? 'Video ssenarisi' : params.format === 'text' ? 'Mətn dərsi' : 'Həm video, həm mətn'}
Çətinlik: ${difficultyAz}
Müddət: təxminən ${params.targetMinutes || 15} dəqiqə

Aşağıdakı JSON strukturunda cavab ver:
{
  "title": "Dərsin başlığı",
  "description": "Qısa açıqlama (2-3 cümlə)",
  "category": "Kateqoriya",
  "learningOutcomes": ["Nəticə 1", "Nəticə 2", "Nəticə 3"],
  "videoScript": {
    "hook": "00:00-01:00 — Problemi göstər (real həyat ssenariyi)",
    "why": "01:00-03:00 — Niyə bu bacarıq kritikdir?",
    "method": "03:00-08:00 — Əsas metod/çərçivə (addım-addım)",
    "demo": "08:00-11:00 — Praktiki nümayiş",
    "mistakes": "11:00-13:00 — Ümumi səhvlər + düzgün yanaşma",
    "task": "13:00-15:00 — Tapşırıq + növbəti addım"
  },
  "textContent": {
    "intro": "Giriş sualı (oxucunu cəlb et)",
    "mainConcept": "Əsas konsept (300-500 söz)",
    "realExample": "Real həyat nümunəsi (Azərbaycan kontekstindən)",
    "framework": "Praktiki çərçivə",
    "exercises": ["Məşq 1", "Məşq 2", "Məşq 3"],
    "checkQuestions": ["Sual 1", "Sual 2", "Sual 3"],
    "nextStep": "Növbəti addım"
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
    model: 'claude-opus-4-6',
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
    model: 'claude-opus-4-6',
    max_tokens: 2000,
    system: BACARIQ_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Bu həftə Azərbaycan iş bazarı üçün ən tələb olunan peşəkar bacarıqları analiz et.

LinkedIn, WEF Future of Jobs, Coursera trendlərini və Azərbaycan lokal bazarını nəzərə al.

JSON formatında cavab ver:
{
  "week": "${new Date().toISOString().split('T')[0]}",
  "topSkills": [
    {
      "skill": "Bacarıq adı",
      "category": "Kateqoriya",
      "demandLevel": "yüksək|orta|aşağı",
      "reasoning": "Niyə bu bacarıq tələb olunur",
      "suggestedLesson": "Tövsiyə olunan dərs başlığı"
    }
  ],
  "emergingTrends": ["trend1", "trend2"],
  "weeklyPlan": {
    "priorityLessons": ["dərs1", "dərs2", "dərs3", "dərs4", "dərs5"],
    "updateExisting": ["köhnə dərsin başlığı"]
  }
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
    model: 'claude-opus-4-6',
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

export async function getPersonalizedPath(userProfile: {
  completedLessons: string[]
  categories: string[]
  level: string
}) {
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
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
