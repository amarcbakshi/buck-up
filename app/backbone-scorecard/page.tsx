'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { BsAssessment } from '@/lib/types'

function avgScore(a: BsAssessment) {
  const scores = [
    a.atomization_score, a.normalization_score, a.elite_capture_score,
    a.economic_dependence_score, a.cross_group_score, a.practiced_readiness_score, a.identity_binding_score,
  ].filter(Boolean) as number[]
  if (!scores.length) return 0
  return Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10
}

function scoreColor(avg: number) {
  if (avg >= 4) return '#22c55e'
  if (avg >= 3) return '#f59e0b'
  return '#ef4444'
}

export default function BackboneScorecardPage() {
  const [assessments, setAssessments] = useState<BsAssessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('bs_assessments').select('*').eq('is_public', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setAssessments(data)
        setLoading(false)
      })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Backbone Scorecard</h1>
          <p className="text-zinc-400 max-w-2xl">
            Seven dimensions of organizational resilience, each scored 1–5. Understand where your group is hardened and where it&apos;s exposed — before a crisis forces the question.
          </p>
        </div>
        <Link
          href="/backbone-scorecard/new"
          className="bg-amber-500 text-black font-medium px-4 py-2 rounded hover:bg-amber-400 transition-colors whitespace-nowrap ml-6 mt-1"
        >
          + Assess Your Organization
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Atomization Resistance', desc: 'Collective vs. individual response' },
          { label: 'Elite Capture Resistance', desc: 'Distributed leadership' },
          { label: 'Economic Independence', desc: 'Revenue diversification' },
          { label: 'Normalization Awareness', desc: 'Tracking baseline drift' },
          { label: 'Cross-Group Connectivity', desc: 'Solidarity networks' },
          { label: 'Practiced Readiness', desc: 'Rehearsed collective action' },
          { label: 'Identity Binding', desc: 'Integrity as core identity' },
        ].map((d) => (
          <div key={d.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-white text-sm font-medium mb-1">{d.label}</p>
            <p className="text-zinc-500 text-xs">{d.desc}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-zinc-500">Loading...</div>
      ) : assessments.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🦴</div>
          <p className="text-zinc-400 mb-6">No public assessments yet. Run the scorecard for your organization.</p>
          <Link href="/backbone-scorecard/new" className="bg-amber-500 text-black font-medium px-6 py-2 rounded hover:bg-amber-400 transition-colors">
            Assess Your Organization
          </Link>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Public Assessments</h2>
          <div className="grid gap-4">
            {assessments.map((a) => {
              const avg = avgScore(a)
              const color = scoreColor(avg)
              return (
                <Link key={a.id} href={`/backbone-scorecard/${a.id}`}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-600 transition-colors flex items-center justify-between group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">{a.organization_name}</h3>
                      <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{a.industry}</span>
                    </div>
                    <p className="text-zinc-500 text-sm">{new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right ml-6">
                    <p className="text-2xl font-bold" style={{ color }}>{avg}</p>
                    <p className="text-zinc-500 text-xs">/ 5.0</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
