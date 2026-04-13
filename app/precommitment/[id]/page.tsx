'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { PcCommitment, PcSignatory } from '@/lib/types'

export default function CommitmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [commitment, setCommitment] = useState<PcCommitment | null>(null)
  const [signatories, setSignatories] = useState<PcSignatory[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [signed, setSigned] = useState(false)

  const [form, setForm] = useState({ name: '', organization: '', role: '', statement: '' })
  function set(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })) }

  async function loadData() {
    const { data: c } = await supabase.from('pc_commitments').select('*').eq('id', id).single()
    const { data: s } = await supabase.from('pc_signatories').select('*').eq('commitment_id', id).order('created_at', { ascending: false })
    if (c) setCommitment(c)
    if (s) setSignatories(s)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [id])

  async function handleSign(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.organization) return
    setSubmitting(true)
    await supabase.from('pc_signatories').insert({
      commitment_id: id,
      name: form.name,
      organization: form.organization,
      role: form.role || null,
      statement: form.statement || null,
    })
    setForm({ name: '', organization: '', role: '', statement: '' })
    setSigned(true)
    await loadData()
    setSubmitting(false)
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-10 text-zinc-500">Loading...</div>
  if (!commitment) return <div className="max-w-3xl mx-auto px-4 py-10 text-zinc-500">Commitment not found.</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/precommitment" className="text-zinc-500 hover:text-zinc-300 text-sm mb-6 inline-block">
        ← Back to commitments
      </Link>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{commitment.group_type}</span>
          <span className="text-xs text-amber-500">{signatories.length} {signatories.length === 1 ? 'signatory' : 'signatories'}</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-6">{commitment.title}</h1>
        <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{commitment.description}</p>
        <p className="text-zinc-500 text-sm mt-6">
          Published {new Date(commitment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Signatories */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Signatories ({signatories.length})</h2>
        {signatories.length === 0 ? (
          <p className="text-zinc-500 text-sm">No signatories yet. Be the first.</p>
        ) : (
          <div className="space-y-3">
            {signatories.map((s) => (
              <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-5 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">{s.name}</p>
                    <p className="text-zinc-400 text-sm">{s.role ? `${s.role}, ` : ''}{s.organization}</p>
                    {s.statement && <p className="text-zinc-500 text-sm mt-2 italic">&ldquo;{s.statement}&rdquo;</p>}
                  </div>
                  <p className="text-zinc-600 text-xs whitespace-nowrap ml-4 mt-1">
                    {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sign form */}
      {signed ? (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center">
          <p className="text-amber-400 font-medium text-lg mb-1">You&apos;ve signed this commitment.</p>
          <p className="text-zinc-400 text-sm">Share this page to add more signatories.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-5">Add Your Name</h2>
          <form onSubmit={handleSign} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
                  placeholder="Full name"
                  className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Organization *</label>
                <input type="text" value={form.organization} onChange={(e) => set('organization', e.target.value)}
                  placeholder="Your employer or affiliation"
                  className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Role / Title</label>
              <input type="text" value={form.role} onChange={(e) => set('role', e.target.value)}
                placeholder="e.g. Software Engineer, Partner"
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Personal Statement (optional)</label>
              <textarea value={form.statement} onChange={(e) => set('statement', e.target.value)}
                placeholder="Why you're signing..."
                rows={3}
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
            </div>
            <button type="submit" disabled={submitting || !form.name || !form.organization}
              className="bg-amber-500 text-black font-medium px-6 py-2 rounded hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Signing...' : 'Sign This Commitment'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
