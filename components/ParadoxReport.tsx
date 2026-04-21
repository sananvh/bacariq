'use client'

import { DIMENSIONS, type DimensionKey } from '@/lib/assessment-questions'

// ─── Mastery level config ───────────────────────────────────────────────────

type MasteryLevel = 'apply' | 'good' | 'develop' | 'priority'

function scoreToLevel(score: number): MasteryLevel {
  if (score >= 75) return 'apply'
  if (score >= 55) return 'good'
  if (score >= 35) return 'develop'
  return 'priority'
}

const LEVEL_CONFIG: Record<MasteryLevel, {
  label: string; color: string; textColor: string; bg: string; border: string; dot: string
}> = {
  apply:    { label: 'Güclü Tərəf',          color: '#059669', textColor: '#065f46', bg: '#ecfdf5', border: '#6ee7b7', dot: '#10b981' },
  good:     { label: 'İnkişaf Faydalıdır',   color: '#0284c7', textColor: '#0c4a6e', bg: '#f0f9ff', border: '#7dd3fc', dot: '#38bdf8' },
  develop:  { label: 'İnkişaf Lazımdır',     color: '#d97706', textColor: '#78350f', bg: '#fffbeb', border: '#fcd34d', dot: '#f59e0b' },
  priority: { label: 'Prioritet İnkişaf',    color: '#dc2626', textColor: '#991b1b', bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444' },
}

// ─── Paradox pairs ──────────────────────────────────────────────────────────

interface ParadoxPair {
  key: string
  label: string
  subtitle: string
  guidance: string
  importance: 'Yüksək' | 'Orta'
  dimX: DimensionKey
  dimY: DimensionKey
  quadrants: { topRight: string; topLeft: string; bottomRight: string; bottomLeft: string }
  narratives: { bothHigh: string; highX: string; highY: string; bothLow: string }
}

const PARADOX_PAIRS: ParadoxPair[] = [
  {
    key: 'kl',
    label: 'Kommunikativ Liderlik',
    subtitle: 'Effektiv ifadə + komanda idarəetməsi',
    guidance: '"Aydın danışmaq qurur, düzgün liderlik isə böyüdür."',
    importance: 'Yüksək',
    dimX: 'L',
    dimY: 'K',
    quadrants: {
      topRight: 'Transformasiyaçı Lider',
      topLeft: 'Güclü Danışan',
      bottomRight: 'Avtoritar',
      bottomLeft: 'İnkişaf Potensialı',
    },
    narratives: {
      bothHigh:
        'Həm fikirlərini aydın çatdırmaqda, həm də komandanı ilham vermək üçün liderlik etməkdə güclüsünüz. Bu birləşmə sizi transformasiyaçı lider olmaq yolunda yerləşdirir.',
      highX:
        'Güclü liderlik instinktiniz var. Kommunikasiya bacarığını daha da inkişaf etdirmək bu potensiali ikiqat artıracaq — insanlar həm hərəkət edəcək, həm sizi anlayacaq.',
      highY:
        'Fikirlərini mükəmməl şəkildə ifadə edirsiniz. Liderlik bacarıqlarını gücləndirmək isə bu kommunikasiya gücünüzü daha geniş bir komandaya çatdırmağa imkan verəcək.',
      bothLow:
        'Həm kommunikasiya, həm liderlik sahəsində inkişaf potensialınız var. Bu iki bacarığı birlikdə inkişaf etdirmək karyeranızda əhəmiyyətli sıçrayış yarada bilər.',
    },
  },
  {
    key: 'ad',
    label: 'Analitik Danışıqlar',
    subtitle: 'Məlumat əsaslı düşüncə + razılaşma sənəti',
    guidance: '"Faktlar güc verir, danışıqlar isə nəticə gətirir."',
    importance: 'Yüksək',
    dimX: 'D',
    dimY: 'A',
    quadrants: {
      topRight: 'Strateji Danışıqçı',
      topLeft: 'Faktlara Yönəlmiş',
      bottomRight: 'İnstinktiv Razılaşan',
      bottomLeft: 'İnkişaf Sahəsi',
    },
    narratives: {
      bothHigh:
        'Həm analitik düşüncə, həm danışıq bacarığı sahəsində güclüsünüz. Bu sinergiya sizə məlumat əsaslı strategiyalar qurmaq və bunları danışıqlar masasına uğurla gətirmək imkanı verir.',
      highX:
        'Güclü danışıq bacarığınız var. Analitik düşüncəni daha çox inkişaf etdirmək isə danışıqlarda faktlara əsaslanan möhkəm mövqe tutmağa imkan verəcək.',
      highY:
        'Mükəmməl analitik düşünürsünüz. Danışıq bacarıqlarını artırmaq isə bu analizi real nəticəyə çevirmək üçün kritik bir addım olacaq.',
      bothLow:
        'Həm analitik, həm danışıq sahəsində inkişaf potensialınız var. Bu iki bacarığı birlikdə gücləndirmək iş həyatında sizə güclü üstünlük verəcək.',
    },
  },
  {
    key: 'sc',
    label: 'Şəxsi Strateji',
    subtitle: 'Özünü idarə etmək + karyera hədəflərini planlamaq',
    guidance: '"Özünü idarə etmək karyeranı istiqamətləndirməyin əsasıdır."',
    importance: 'Yüksək',
    dimX: 'C',
    dimY: 'S',
    quadrants: {
      topRight: 'Strateji Fərd',
      topLeft: 'Disiplinli İcraçı',
      bottomRight: 'Karyera Görüntüsü',
      bottomLeft: 'İnkişaf Potensialı',
    },
    narratives: {
      bothHigh:
        'Həm özünüzü mükəmməl idarə edirsiniz, həm də karyera hədəflərinizi aydın görürsünüz. Bu birləşmə sizi həm effektiv, həm istiqamətlənmiş bir peşəkar edir.',
      highX:
        'Karyera baxışınız güclüdür. Özünü idarəetmə bacarıqlarını daha da inkişaf etdirmək, bu hədəflərə daha sabit və disiplinli bir yolla çatmağa imkan verəcək.',
      highY:
        'Özünüzü çox yaxşı idarə edirsiniz. Karyera hədəflərini daha aydın müəyyənləşdirmək isə bu disiplini doğru istiqamətə yönəltməyə kömək edəcək.',
      bothLow:
        'Həm şəxsi effektivlik, həm karyera planlaması sahəsində inkişaf potensialınız var. Bu iki sahəni gücləndirib bir-biri ilə əlaqələndirmək böyük dəyişiklik yarada bilər.',
    },
  },
]

// ─── Quadrant chart ─────────────────────────────────────────────────────────

function QuadrantChart({
  scoreX, scoreY, dimX, dimY, quadrants,
}: {
  scoreX: number; scoreY: number
  dimX: DimensionKey; dimY: DimensionKey
  quadrants: ParadoxPair['quadrants']
}) {
  const SIZE = 156
  const dotLeft = (scoreX / 100) * SIZE
  const dotTop  = (1 - scoreY / 100) * SIZE

  const levelX = scoreToLevel(scoreX)
  const levelY = scoreToLevel(scoreY)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5 items-center">
        {/* Y-axis label */}
        <div className="flex items-center justify-center shrink-0" style={{ width: 16, height: SIZE }}>
          <span style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontSize: 9,
            fontWeight: 700,
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {DIMENSIONS[dimY].label}
          </span>
        </div>

        {/* Chart */}
        <div className="relative rounded-xl overflow-hidden shrink-0"
          style={{ width: SIZE, height: SIZE, border: '1px solid #e5e7eb' }}>
          {/* Quadrant fills */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="relative" style={{ background: '#fef9c3', borderRight: '1px dashed #d1d5db', borderBottom: '1px dashed #d1d5db' }}>
              <span className="absolute top-1.5 left-1.5 text-[7px] font-bold text-amber-800 leading-tight" style={{ maxWidth: 56 }}>
                {quadrants.topLeft}
              </span>
            </div>
            <div className="relative" style={{ background: '#dcfce7', borderBottom: '1px dashed #d1d5db' }}>
              <span className="absolute top-1.5 right-1.5 text-[7px] font-bold text-emerald-800 leading-tight text-right" style={{ maxWidth: 56 }}>
                {quadrants.topRight}
              </span>
            </div>
            <div className="relative" style={{ background: '#fee2e2', borderRight: '1px dashed #d1d5db' }}>
              <span className="absolute bottom-1.5 left-1.5 text-[7px] font-bold text-red-800 leading-tight" style={{ maxWidth: 56 }}>
                {quadrants.bottomLeft}
              </span>
            </div>
            <div className="relative" style={{ background: '#fef9c3' }}>
              <span className="absolute bottom-1.5 right-1.5 text-[7px] font-bold text-amber-800 leading-tight text-right" style={{ maxWidth: 56 }}>
                {quadrants.bottomRight}
              </span>
            </div>
          </div>

          {/* User dot */}
          <div className="absolute" style={{
            left: dotLeft,
            top: dotTop,
            width: 13,
            height: 13,
            borderRadius: '50%',
            background: '#3b82f6',
            border: '2.5px solid white',
            boxShadow: '0 0 0 2px rgba(59,130,246,0.35), 0 2px 8px rgba(59,130,246,0.4)',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
          }} />
        </div>
      </div>

      {/* X-axis label */}
      <div style={{ paddingLeft: 20 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {DIMENSIONS[dimX].label}
        </span>
      </div>

      {/* Score bars */}
      <div className="space-y-1.5" style={{ paddingLeft: 20 }}>
        {([
          { dim: dimY, score: scoreY, level: levelY },
          { dim: dimX, score: scoreX, level: levelX },
        ] as const).map(({ dim, score, level }) => {
          const cfg = LEVEL_CONFIG[level]
          return (
            <div key={dim} className="flex items-center gap-2">
              <span className="text-[9px] text-gray-400 font-semibold shrink-0" style={{ width: 56, textAlign: 'right' }}>
                {DIMENSIONS[dim].label}
              </span>
              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${score}%`, background: cfg.color }} />
              </div>
              <span className="text-[9px] font-black shrink-0" style={{ width: 24, textAlign: 'right', color: cfg.color }}>
                {score}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Paradox card ───────────────────────────────────────────────────────────

function ParadoxCard({ pair, scores }: { pair: ParadoxPair; scores: Record<DimensionKey, number> }) {
  const scoreX = scores[pair.dimX]
  const scoreY = scores[pair.dimY]

  // Mastery: average weighted by balance
  const avg = (scoreX + scoreY) / 2
  const balance = 1 - Math.abs(scoreX - scoreY) / 100
  const mastery = Math.round(avg * (0.82 + 0.18 * balance))

  const level = scoreToLevel(mastery)
  const cfg = LEVEL_CONFIG[level]

  const narrative =
    scoreX >= 55 && scoreY >= 55 ? pair.narratives.bothHigh
    : scoreX >= 55               ? pair.narratives.highX
    : scoreY >= 55               ? pair.narratives.highY
    :                              pair.narratives.bothLow

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* Top color bar */}
      <div className="h-1" style={{ background: cfg.color }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="min-w-0">
            <p className="font-extrabold text-gray-900 text-sm leading-snug">{pair.label}</p>
            <p className="text-gray-400 text-[11px] mt-0.5">{pair.subtitle}</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xl font-black leading-none" style={{ color: cfg.color }}>{mastery}%</div>
            <div
              className="text-[9px] font-bold uppercase tracking-wide mt-0.5 px-1.5 py-0.5 rounded-full"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
            >
              {cfg.label}
            </div>
          </div>
        </div>

        {/* Guidance */}
        <p className="text-[11px] italic text-gray-400 mb-4">{pair.guidance}</p>

        {/* Importance badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Əhəmiyyət:</span>
          <span className="text-[10px] font-bold text-gray-700">{pair.importance}</span>
        </div>

        {/* Chart */}
        <div className="flex justify-center mb-4">
          <QuadrantChart
            scoreX={scoreX}
            scoreY={scoreY}
            dimX={pair.dimX}
            dimY={pair.dimY}
            quadrants={pair.quadrants}
          />
        </div>

        {/* Narrative */}
        <div
          className="rounded-xl p-3 mt-auto"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          <p className="text-[11px] leading-relaxed" style={{ color: cfg.textColor }}>
            {narrative}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Dimension row ───────────────────────────────────────────────────────────

function DimensionRow({ dimKey, score }: { dimKey: DimensionKey; score: number }) {
  const dim = DIMENSIONS[dimKey]
  const level = scoreToLevel(score)
  const cfg = LEVEL_CONFIG[level]

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base shrink-0" style={{ background: dim.bgColor }}>
        {dim.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-semibold text-gray-800">{dim.label}</span>
          <span className="text-sm font-black" style={{ color: cfg.color }}>{score}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, background: cfg.color }}
          />
        </div>
      </div>
      <div
        className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
      >
        {cfg.label}
      </div>
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function ParadoxReport({ scores, name }: { scores: Record<DimensionKey, number>; name?: string }) {
  const values = Object.values(scores)
  const overallMastery = Math.round(values.reduce((a, b) => a + b, 0) / values.length)
  const overallLevel = scoreToLevel(overallMastery)
  const overallCfg = LEVEL_CONFIG[overallLevel]

  const sortedDims = (Object.keys(scores) as DimensionKey[]).sort((a, b) => scores[b] - scores[a])

  return (
    <div className="space-y-8">
      {/* ── Overall Mastery ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Top gradient bar */}
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${overallCfg.color}, ${overallCfg.dot})` }} />

        <div className="p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                Bacarıq Masteri Səviyyəsi
              </p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black leading-none" style={{ color: overallCfg.color }}>
                  {overallMastery}%
                </span>
                <div>
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-1"
                    style={{ background: overallCfg.bg, color: overallCfg.color, border: `1px solid ${overallCfg.border}` }}
                  >
                    {overallCfg.label}
                  </div>
                  {name && (
                    <p className="text-gray-400 text-xs">{name} üçün profil analizi</p>
                  )}
                </div>
              </div>
            </div>

            {/* Mini radar-like summary */}
            <div className="flex gap-2 flex-wrap">
              {sortedDims.map((dim, i) => {
                const lvl = scoreToLevel(scores[dim])
                const c = LEVEL_CONFIG[lvl]
                return (
                  <div key={dim} className="flex flex-col items-center gap-1">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
                      style={{ background: c.bg, color: c.color, border: `1.5px solid ${c.border}` }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-[9px] text-gray-400 font-semibold">{scores[dim]}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Dimension rows */}
          <div className="divide-y divide-gray-50">
            {sortedDims.map((key) => (
              <DimensionRow key={key} dimKey={key} score={scores[key]} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Synergy Analysis ── */}
      <div>
        <div className="mb-5">
          <h2 className="text-xl font-extrabold text-gray-900">Sinergiya Profili</h2>
          <p className="text-gray-500 text-sm mt-1">
            Güclü peşəkarlar bir-birini tamamlayan bacarıqları balansda saxlayır.
            Aşağıda 3 əsas sinergiya sahəsindəki mövqeyiniz göstərilir.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {PARADOX_PAIRS.map(pair => (
            <ParadoxCard key={pair.key} pair={pair} scores={scores} />
          ))}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="bg-gray-50 rounded-2xl px-6 py-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Rəng Açıqlaması</p>
        <div className="flex flex-wrap gap-4">
          {(Object.entries(LEVEL_CONFIG) as [MasteryLevel, typeof LEVEL_CONFIG[MasteryLevel]][]).map(([, cfg]) => (
            <div key={cfg.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: cfg.color }} />
              <span className="text-xs text-gray-600 font-medium">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
