'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { supabase } from '@/lib/supabase'
import { BACKBONE_DIMENSIONS } from '@/lib/types'
import type { BsAssessment } from '@/lib/types'

const RECS: Record<string, string> = {
  atomization_score: 'Build collective response infrastructure before a crisis — communication trees, decision authorities, and clear protocols for when a member is individually targeted.',
  normalization_score: 'Establish a baseline document of your current positions and review it quarterly. Track every concession, however small, against the original baseline.',
  elite_capture_score: 'Distribute leadership through federated structures. No single person should be a coordination chokepoint. Develop deputies for every critical role.',
  economic_dependence_score: 'Audit revenue streams for government or pressure-vulnerable dependence. Build strike funds, mutual aid, and alternative revenue before you need them.',
  cross_group_score: 'Identify 3–5 allied organizations and establish regular contact now. Pre-crisis relationship-building is the precondition for post-crisis solidarity.',
  practiced_readiness_score: 'Run non-political collective action rehearsals — fundraisers, advocacy campaigns, coordinated communications — so that protocols exist before the political moment arrives.',
  identity_binding_score: 'Invest in rituals, symbols, and stories that make professional integrity a core identity, not just a norm. Make defection a status threat, not just a policy violation.',
}

export default function AssessmentResultsPage() {
  const { id } = useParams<{ id: string }>()
  const [assessment, setAssessment] = useState<BsAssessment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('bs_assessments').select('*').eq('id', id).single()
      .then(({ data }) => {
        if (data) setAssessment(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-10 text-zinc-500">Loading...</div>
  if (!assessment) return <div className="max-w-3xl mx-auto px-4 py-10 text-zinc-500">Assessment not found.</div>

  const scores = BACKBONE_DIMENSIONS.map((d) => ({
    ...d,
    score: (assessment[d.key as keyof BsAssessment] as number) ?? 0,
    note: assessment.notes?.[d.key] ?? '',
  }))

  const avg = Math.round(scores.reduce((s, d) => s + d.score, 0) / scores.length * 10) / 10
  const avgColor = avg >= 4 ? '#22c55e' : avg >= 3 ? '#f59e0b' : '#ef4444'
  const avgLabel = avg >= 4 ? 'Hardened' : avg >= 3 ? 'Moderate Exposure' : 'High Vulnerability'

  const radarData = scores.map((d) => ({
    dimension: d.label.replace(' Resistance', '').replace(' Awareness', '').replace(' Binding', '').replace('Cross-Group ', 'Cross-Group').replace('Practiced ', 'Practiced'),
    score: d.score,
    fullMark: 5,
  }))

  const weakDimensions = scores.filter((d) => d.score <= 2)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/backbone-scorecard" className="text-zinc-500 hover:text-zinc-300 text-sm mb-6 inline-block">
        ← Back to scorecards
      </Link>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{assessment.organization_name}</h1>
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{assessment.industry}</span>
            </div>
            <p className="text-zinc-500 text-sm">Assessed {new Date(assessment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold" style={{ color: avgColor }}>{avg}</p>
            <p className="text-zinc-400 text-sm">/5 — {avgLabel}</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#3f3f46" />
            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
            <Radar name="Score" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#fff' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 mb-8">
        {scores.map((d) => {
          const color = d.score >= 4 ? '#22c55e' : d.score >= 3 ? '#f59e0b' : '#ef4444'
          return (
            <div key={d.key} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-white">{d.label}</h3>
                <span className="text-lg font-bold" style={{ color }}>{d.score}/5</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-2">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${(d.score / 5) * 100}%`, backgroundColor: color }} />
              </div>
              <p className="text-zinc-500 text-xs">{d.description}</p>
              {d.note && <p className="text-zinc-400 text-xs mt-2 italic">&ldquo;{d.note}&rdquo;</p>}
            </div>
          )
        })}
      </div>

      {weakDimensions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Hardening Recommendations</h2>
          <div className="space-y-4">
            {weakDimensions.map((d) => (
              <div key={d.key} className="bg-red-950/30 border border-red-900/50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-400 font-semibold text-sm">⚠ {d.label}</span>
                  <span className="text-red-500 text-xs">Score: {d.score}/5</span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">{RECS[d.key]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
