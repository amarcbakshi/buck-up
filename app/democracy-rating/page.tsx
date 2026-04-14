'use client'
import { useEffect, useState } from 'react'
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
  last_researched_at: string
  created_at: string
}

const GRADE_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  A: { bg: 'bg-green-950/30', border: 'border-green-800/50', text: 'text-green-400', badge: 'bg-green-900/50 text-green-400 border border-green-700/50' },
  B: { bg: 'bg-lime-950/30', border: 'border-lime-800/50', text: 'text-lime-400', badge: 'bg-lime-900/50 text-lime-400 border border-lime-700/50' },
  C: { bg: 'bg-yellow-950/30', border: 'border-yellow-800/50', text: 'text-yellow-400', badge: 'bg-yellow-900/50 text-yellow-400 border border-yellow-700/50' },
  D: { bg: 'bg-orange-950/30', border: 'border-orange-800/50', text: 'text-orange-400', badge: 'bg-orange-900/50 text-orange-400 border border-orange-700/50' },
  F: { bg: 'bg-red-950/30', border: 'border-red-900/50', text: 'text-red-400', badge: 'bg-red-900/50 text-red-400 border border-red-700/50' },
}

function avgScore(org: DrOrg) {
  const scores = [
    org.score_public_statements,
    org.score_legal_action,
    org.score_client_alignment,
    org.score_internal_policy,
    org.score_financial_exposure,
  ].filter(Boolean)
  if (!scores.length) return 0
  return scores.reduce((a, b) => a + b, 0) / scores.length
}

export default function DemocracyRatingPage() {
  const [orgs, setOrgs] = useState<DrOrg[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('All')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('dr_organizations')
        .select('*')
        .order('grade', { ascending: true })
        .order('name', { ascending: true })
      if (data) setOrgs(data)
      setLoading(false)
    }
    load()
  }, [])

  const grades = ['All', 'A', 'B', 'C', 'D', 'F']
  const filtered = filter === 'All' ? orgs : orgs.filter((o) => o.grade === filter)

  const gradeGroups: Record<string, DrOrg[]> = {}
  for (const org of filtered) {
    if (!gradeGroups[org.grade]) gradeGroups[org.grade] = []
    gradeGroups[org.grade].push(org)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Pro-Democracy Ratings</h1>
            <p className="text-zinc-400 max-w-2xl">
              How much have organizations capitulated to Trump? Ratings based on public statements,
              legal action, client alignment, internal policy changes, and financial exposure decisions.
              Researched and updated continuously.
            </p>
          </div>
          <Link
            href="/democracy-rating/submit"
            className="bg-amber-500 text-black font-medium px-4 py-2 rounded hover:bg-amber-400 transition-colors whitespace-nowrap ml-6 mt-1 text-sm"
          >
            + Submit an Org
          </Link>
        </div>

        {/* Grade filter */}
        <div className="flex gap-2 mt-6">
          {grades.map((g) => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                filter === g
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {g === 'All' ? 'All' : `Grade ${g}`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-zinc-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-zinc-500">No organizations found.</div>
      ) : (
        <div className="space-y-10">
          {['A', 'B', 'C', 'D', 'F'].map((grade) => {
            const group = gradeGroups[grade]
            if (!group || group.length === 0) return null
            const style = GRADE_STYLES[grade]
            return (
              <div key={grade}>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-2xl font-black ${style.text}`}>{grade}</span>
                  <span className="text-zinc-500 text-sm">{group[0]?.grade_label}</span>
                  <span className="text-zinc-700 text-xs">({group.length} org{group.length !== 1 ? 's' : ''})</span>
                </div>
                <div className="space-y-3">
                  {group.map((org) => (
                    <Link key={org.id} href={`/democracy-rating/${org.id}`} className="block">
                      <div className={`${style.bg} border ${style.border} rounded-xl p-5 hover:brightness-110 transition-all`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1.5">
                              <span className={`text-lg font-black ${style.text}`}>{org.grade}</span>
                              <h2 className="text-white font-semibold">{org.name}</h2>
                              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{org.type}</span>
                            </div>
                            <p className={`text-xs font-medium mb-2 ${style.text}`}>{org.grade_label}</p>
                            <p className="text-zinc-400 text-sm line-clamp-2">{org.summary}</p>
                          </div>
                          <div className="ml-6 text-right flex-shrink-0">
                            <div className={`text-3xl font-black ${style.text}`}>{org.grade}</div>
                            <div className="text-zinc-600 text-xs mt-1">{avgScore(org).toFixed(1)}/5</div>
                          </div>
                        </div>

                        {/* Score bars */}
                        <div className="mt-4 grid grid-cols-5 gap-2">
                          {[
                            { label: 'Public Stance', score: org.score_public_statements },
                            { label: 'Legal Action', score: org.score_legal_action },
                            { label: 'Clients', score: org.score_client_alignment },
                            { label: 'Internal', score: org.score_internal_policy },
                            { label: 'Financial', score: org.score_financial_exposure },
                          ].map(({ label, score }) => (
                            <div key={label}>
                              <div className="text-zinc-600 text-xs mb-1">{label}</div>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <div
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-sm ${
                                      i <= score ? style.text.replace('text-', 'bg-') : 'bg-zinc-800'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-10 border-t border-zinc-800 pt-6">
        <p className="text-zinc-600 text-xs">
          Ratings based on publicly available reporting as of April 2026. Scores across five dimensions: public statements &amp; stance, legal action taken, client alignment decisions, internal policy changes, and financial exposure choices. All sources linked on each organization&apos;s page.
        </p>
      </div>
    </div>
  )
}
