'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type DrOrg = {
  id: string
  name: string
  type: string
  grade: string
  grade_label: string
  summary: string
  score_public_statements: number
  score_legal_action: number
  score_client_alignment: number
  score_internal_policy: number
  score_financial_exposure: number
  sources: string[]
  key_events: { date: string; description: string; type: 'positive' | 'negative' | 'neutral' }[]
  last_researched_at: string
  created_at: string
}

const GRADE_STYLES: Record<string, { text: string; bg: string; border: string; barColor: string }> = {
  A: { text: 'text-green-400', bg: 'bg-green-950/40', border: 'border-green-800/50', barColor: 'bg-green-500' },
  B: { text: 'text-lime-400', bg: 'bg-lime-950/40', border: 'border-lime-800/50', barColor: 'bg-lime-500' },
  C: { text: 'text-yellow-400', bg: 'bg-yellow-950/40', border: 'border-yellow-800/50', barColor: 'bg-yellow-500' },
  D: { text: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-800/50', barColor: 'bg-orange-500' },
  F: { text: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-900/50', barColor: 'bg-red-500' },
}

const DIMENSIONS = [
  { key: 'score_public_statements', label: 'Public Stance', description: 'Publicly stated position on threats to democratic institutions and rule of law' },
  { key: 'score_legal_action', label: 'Legal Action', description: 'Whether the organization used its legal tools to push back, challenge orders, or file suits' },
  { key: 'score_client_alignment', label: 'Client Decisions', description: 'Whether client relationships were dropped, maintained, or added based on political pressure' },
  { key: 'score_internal_policy', label: 'Internal Policy', description: 'Changes to DEI, personnel, or institutional practices under political pressure' },
  { key: 'score_financial_exposure', label: 'Financial Choices', description: 'Pro bono pledges, donations, or financial commitments made to administration-favored causes' },
]

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-3 flex-1 rounded-sm ${i <= score ? color : 'bg-zinc-800'}`}
          />
        ))}
      </div>
      <span className="text-zinc-400 text-sm w-8 text-right">{score}/5</span>
    </div>
  )
}

export default function DemocracyRatingDetailPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const [org, setOrg] = useState<DrOrg | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('dr_organizations')
        .select('*')
        .eq('id', orgId)
        .single()
      if (data) setOrg(data)
      setLoading(false)
    }
    load()
  }, [orgId])

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-10 text-zinc-500">Loading...</div>
  if (!org) return <div className="max-w-3xl mx-auto px-4 py-10 text-zinc-500">Organization not found.</div>

  const style = GRADE_STYLES[org.grade] ?? GRADE_STYLES['C']
  const avgScore = (
    [org.score_public_statements, org.score_legal_action, org.score_client_alignment, org.score_internal_policy, org.score_financial_exposure]
      .filter(Boolean)
      .reduce((a, b) => a + b, 0) /
    [org.score_public_statements, org.score_legal_action, org.score_client_alignment, org.score_internal_policy, org.score_financial_exposure].filter(Boolean).length
  ).toFixed(1)

  const events = Array.isArray(org.key_events) ? org.key_events : []
  const sources = Array.isArray(org.sources) ? org.sources : []

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/democracy-rating" className="text-zinc-500 hover:text-zinc-300 text-sm mb-6 inline-block">
        ← Back to ratings
      </Link>

      {/* Header card */}
      <div className={`${style.bg} border ${style.border} rounded-xl p-8 mb-6`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{org.type}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">{org.name}</h1>
            <p className={`font-medium ${style.text}`}>{org.grade_label}</p>
          </div>
          <div className="text-right">
            <div className={`text-7xl font-black ${style.text} leading-none`}>{org.grade}</div>
            <div className="text-zinc-500 text-sm mt-1">{avgScore} / 5.0 avg</div>
          </div>
        </div>
        <p className="text-zinc-300 leading-relaxed">{org.summary}</p>
      </div>

      {/* Dimension scores */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-5">Score Breakdown</h2>
        <div className="space-y-5">
          {DIMENSIONS.map((dim) => {
            const score = (org as Record<string, number>)[dim.key] ?? 0
            return (
              <div key={dim.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-zinc-200 text-sm font-medium">{dim.label}</span>
                </div>
                <ScoreBar score={score} color={style.barColor} />
                <p className="text-zinc-600 text-xs mt-1.5">{dim.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-5 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-medium">Overall Average</span>
            <span className={`text-xl font-bold ${style.text}`}>{avgScore} / 5.0</span>
          </div>
          <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${style.barColor} rounded-full`}
              style={{ width: `${(parseFloat(avgScore) / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      {events.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-5">Key Events</h2>
          <div className="space-y-4">
            {events.map((event, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${
                    event.type === 'positive' ? 'bg-green-500' :
                    event.type === 'negative' ? 'bg-red-500' : 'bg-zinc-500'
                  }`} />
                  {i < events.length - 1 && <div className="w-px flex-1 bg-zinc-800 mt-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-zinc-500 text-xs mb-1">{event.date}</p>
                  <p className="text-zinc-300 text-sm leading-relaxed">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Sources</h2>
          <ul className="space-y-2">
            {sources.map((src, i) => (
              <li key={i}>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-500 hover:text-amber-400 text-sm break-all"
                >
                  {src}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Meta */}
      <p className="text-zinc-700 text-xs text-center">
        Last researched: {new Date(org.last_researched_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </p>
    </div>
  )
}
