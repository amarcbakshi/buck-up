'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const INDUSTRIES = ['Technology', 'Legal', 'Healthcare', 'Academia', 'Media', 'Finance', 'Government', 'Nonprofit', 'Other']

export default function NewPactPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    trigger_conditions: '',
    response_commitment: '',
    industry: 'Technology',
    member_name: '',
    member_org: '',
    member_role: '',
    member_statement: '',
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.description || !form.trigger_conditions || !form.response_commitment) {
      setError('Please fill in all pact fields.')
      return
    }
    if (!form.member_name || !form.member_org) {
      setError('Please provide your name and organization.')
      return
    }
    setSubmitting(true)
    setError('')

    const { data: pact, error: err1 } = await supabase.from('mdp_pacts').insert({
      title: form.title,
      description: form.description,
      trigger_conditions: form.trigger_conditions,
      response_commitment: form.response_commitment,
      industry: form.industry,
    }).select().single()

    if (err1 || !pact) {
      setError('Error creating pact. Please try again.')
      setSubmitting(false)
      return
    }

    await supabase.from('mdp_members').insert({
      pact_id: pact.id,
      name: form.member_name,
      organization: form.member_org,
      role: form.member_role || null,
      commitment_statement: form.member_statement || null,
    })

    router.push(`/mutual-defense/${pact.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/mutual-defense" className="text-zinc-500 hover:text-zinc-300 text-sm mb-4 inline-block">
          ← Back to pacts
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Create a Mutual Defense Pact</h1>
        <p className="text-zinc-400">Define the trigger conditions and collective response. You&apos;ll be the founding member.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">The Pact</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Pact Title *</label>
            <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Tech Workers Cross-Employment Pact"
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Description *</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="What is this pact for? Who is it aimed at protecting?"
              rows={3}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Trigger Conditions *</label>
            <textarea value={form.trigger_conditions} onChange={(e) => set('trigger_conditions', e.target.value)}
              placeholder="Describe exactly what situation activates this pact. Be specific — vague triggers are unreliable..."
              rows={4}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">What Members Commit to Do *</label>
            <textarea value={form.response_commitment} onChange={(e) => set('response_commitment', e.target.value)}
              placeholder="What specific action will members take when the pact is activated? e.g. 'Publicly offer to take the abandoned client within 72 hours...'"
              rows={4}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Industry *</label>
            <select value={form.industry} onChange={(e) => set('industry', e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500">
              {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Your Membership</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Your Name *</label>
              <input type="text" value={form.member_name} onChange={(e) => set('member_name', e.target.value)}
                placeholder="Full name"
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Organization *</label>
              <input type="text" value={form.member_org} onChange={(e) => set('member_org', e.target.value)}
                placeholder="Your employer or affiliation"
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Role / Title</label>
            <input type="text" value={form.member_role} onChange={(e) => set('member_role', e.target.value)}
              placeholder="e.g. Software Engineer, Partner"
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Personal Commitment Statement (optional)</label>
            <textarea value={form.member_statement} onChange={(e) => set('member_statement', e.target.value)}
              placeholder="Why you're founding this pact..."
              rows={2}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={submitting}
          className="bg-amber-500 text-black font-medium px-6 py-2.5 rounded hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full">
          {submitting ? 'Establishing Pact...' : 'Establish Pact & Join'}
        </button>
      </form>
    </div>
  )
}
