'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { BACKBONE_DIMENSIONS } from '@/lib/types'

const INDUSTRIES = ['Technology', 'Legal', 'Healthcare', 'Academia', 'Media', 'Finance', 'Government', 'Nonprofit', 'Other']

export default function NewAssessmentPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [orgName, setOrgName] = useState('')
  const [industry, setIndustry] = useState('Technology')
  const [isPublic, setIsPublic] = useState(true)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})

  function setScore(key: string, value: number) {
    setScores((s) => ({ ...s, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orgName) { setError('Please enter your organization name.'); return }
    if (Object.keys(scores).length < BACKBONE_DIMENSIONS.length) {
      setError('Please score all seven dimensions.')
      return
    }
    setSubmitting(true)
    setError('')

    const { data, error: err } = await supabase.from('bs_assessments').insert({
      organization_name: orgName,
      industry,
      is_public: isPublic,
      atomization_score: scores['atomization_score'],
      normalization_score: scores['normalization_score'],
      elite_capture_score: scores['elite_capture_score'],
      economic_dependence_score: scores['economic_dependence_score'],
      cross_group_score: scores['cross_group_score'],
      practiced_readiness_score: scores['practiced_readiness_score'],
      identity_binding_score: scores['identity_binding_score'],
      notes,
    }).select().single()

    if (err || !data) {
      setError('Error saving assessment. Please try again.')
      setSubmitting(false)
      return
    }
    router.push(`/backbone-scorecard/${data.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/backbone-scorecard" className="text-zinc-500 hover:text-zinc-300 text-sm mb-4 inline-block">
          ← Back to scorecards
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Backbone Scorecard</h1>
        <p className="text-zinc-400">Rate your organization 1–5 on each resilience dimension. 1 = highly vulnerable, 5 = strongly hardened.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Organization</h2>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Organization Name *</label>
            <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)}
              placeholder="Your organization (or describe anonymously)"
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Industry *</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500">
              {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}
              className="accent-amber-500" />
            Make this assessment public (anonymized)
          </label>
        </div>

        {BACKBONE_DIMENSIONS.map((dim) => (
          <div key={dim.key} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-1">{dim.label}</h3>
            <p className="text-zinc-400 text-sm mb-4">{dim.description}</p>

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500 max-w-[40%]">{dim.lowLabel}</span>
              <span className="text-xs text-zinc-500 max-w-[40%] text-right">{dim.highLabel}</span>
            </div>

            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setScore(dim.key, v)}
                  className={`flex-1 py-2 rounded text-sm font-medium transition-colors border ${
                    scores[dim.key] === v
                      ? 'bg-amber-500 border-amber-500 text-black'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Notes (optional)</label>
              <textarea
                value={notes[dim.key] ?? ''}
                onChange={(e) => setNotes((n) => ({ ...n, [dim.key]: e.target.value }))}
                placeholder="What specific evidence informs this score?"
                rows={2}
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full text-sm focus:outline-none focus:border-amber-500 placeholder:text-zinc-600"
              />
            </div>
          </div>
        ))}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={submitting}
          className="bg-amber-500 text-black font-medium px-6 py-2.5 rounded hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full">
          {submitting ? 'Saving...' : 'Generate Scorecard'}
        </button>
      </form>
    </div>
  )
}
