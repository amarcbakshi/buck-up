'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const INDUSTRIES = ['Technology', 'Legal', 'Healthcare', 'Academia', 'Media', 'Finance', 'Government', 'Nonprofit', 'Other']

export default function NewCommitmentPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    group_type: 'Technology',
    signer_name: '',
    signer_org: '',
    signer_role: '',
    signer_statement: '',
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.description || !form.signer_name || !form.signer_org) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError('')

    const { data: commitment, error: err1 } = await supabase
      .from('pc_commitments')
      .insert({ title: form.title, description: form.description, group_type: form.group_type })
      .select()
      .single()

    if (err1 || !commitment) {
      setError('Error creating commitment. Please try again.')
      setSubmitting(false)
      return
    }

    await supabase.from('pc_signatories').insert({
      commitment_id: commitment.id,
      name: form.signer_name,
      organization: form.signer_org,
      role: form.signer_role || null,
      statement: form.signer_statement || null,
    })

    router.push(`/precommitment/${commitment.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/precommitment" className="text-zinc-500 hover:text-zinc-300 text-sm mb-4 inline-block">
          ← Back to commitments
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Create a Commitment</h1>
        <p className="text-zinc-400">
          Draft a public commitment for your group or industry. You&apos;ll be the first signatory.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">The Commitment</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. We Will Not Build Surveillance Tools for Mass Deportation"
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Full Text *</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Write the full commitment text here. Be specific about what signatories are committing to do or refuse..."
              rows={8}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Group / Industry *</label>
            <select
              value={form.group_type}
              onChange={(e) => set('group_type', e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500"
            >
              {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Your Signature</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Your Name *</label>
              <input
                type="text"
                value={form.signer_name}
                onChange={(e) => set('signer_name', e.target.value)}
                placeholder="Full name"
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Organization *</label>
              <input
                type="text"
                value={form.signer_org}
                onChange={(e) => set('signer_org', e.target.value)}
                placeholder="Your employer or affiliation"
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Role / Title</label>
            <input
              type="text"
              value={form.signer_role}
              onChange={(e) => set('signer_role', e.target.value)}
              placeholder="e.g. Software Engineer, Partner, Associate Professor"
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Personal Statement (optional)</label>
            <textarea
              value={form.signer_statement}
              onChange={(e) => set('signer_statement', e.target.value)}
              placeholder="Why you're signing this commitment..."
              rows={3}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-amber-500 text-black font-medium px-6 py-2.5 rounded hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          {submitting ? 'Publishing...' : 'Publish Commitment & Sign'}
        </button>
      </form>
    </div>
  )
}
