'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { MdpPact, MdpMember, MdpActivation } from '@/lib/types'

export default function PactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [pact, setPact] = useState<MdpPact | null>(null)
  const [members, setMembers] = useState<MdpMember[]>([])
  const [activations, setActivations] = useState<MdpActivation[]>([])
  const [loading, setLoading] = useState(true)
  const [joinSubmitting, setJoinSubmitting] = useState(false)
  const [threatSubmitting, setThreatSubmitting] = useState(false)
  const [joined, setJoined] = useState(false)
  const [showThreatForm, setShowThreatForm] = useState(false)

  const [joinForm, setJoinForm] = useState({ name: '', organization: '', role: '', statement: '' })
  const [threatForm, setThreatForm] = useState({ affected_member: '', situation_description: '' })

  function setJoin(field: string, v: string) { setJoinForm((f) => ({ ...f, [field]: v })) }
  function setThreat(field: string, v: string) { setThreatForm((f) => ({ ...f, [field]: v })) }

  async function loadData() {
    const { data: p } = await supabase.from('mdp_pacts').select('*').eq('id', id).single()
    const { data: m } = await supabase.from('mdp_members').select('*').eq('pact_id', id).order('created_at', { ascending: false })
    const { data: a } = await supabase.from('mdp_activations').select('*').eq('pact_id', id).order('created_at', { ascending: false })
    if (p) setPact(p)
    if (m) setMembers(m)
    if (a) setActivations(a)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [id])

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!joinForm.name || !joinForm.organization) return
    setJoinSubmitting(true)
    await supabase.from('mdp_members').insert({
      pact_id: id,
      name: joinForm.name,
      organization: joinForm.organization,
      role: joinForm.role || null,
      commitment_statement: joinForm.statement || null,
    })
    setJoined(true)
    await loadData()
    setJoinSubmitting(false)
  }

  async function handleThreat(e: React.FormEvent) {
    e.preventDefault()
    if (!threatForm.affected_member || !threatForm.situation_description) return
    setThreatSubmitting(true)
    await supabase.from('mdp_activations').insert({
      pact_id: id,
      affected_member: threatForm.affected_member,
      situation_description: threatForm.situation_description,
      status: 'active',
    })
    setThreatForm({ affected_member: '', situation_description: '' })
    setShowThreatForm(false)
    await loadData()
    setThreatSubmitting(false)
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-10 text-zinc-500">Loading...</div>
  if (!pact) return <div className="max-w-3xl mx-auto px-4 py-10 text-zinc-500">Pact not found.</div>

  const activeThreats = activations.filter((a) => a.status === 'active')
  const resolvedThreats = activations.filter((a) => a.status === 'resolved')

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/mutual-defense" className="text-zinc-500 hover:text-zinc-300 text-sm mb-6 inline-block">
        ← Back to pacts
      </Link>

      {/* Pact header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{pact.industry}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${pact.is_active ? 'bg-green-900/50 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
            {pact.is_active ? 'Active' : 'Inactive'}
          </span>
          <span className="text-xs text-amber-500">{members.length} {members.length === 1 ? 'member' : 'members'}</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">{pact.title}</h1>
        <p className="text-zinc-300 leading-relaxed mb-6">{pact.description}</p>

        <div className="grid gap-4">
          <div className="bg-zinc-800/60 rounded-lg p-4">
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">Pact activates when</p>
            <p className="text-zinc-200 text-sm leading-relaxed">{pact.trigger_conditions}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <p className="text-xs text-amber-500/70 mb-2 uppercase tracking-wide">Members commit to</p>
            <p className="text-zinc-200 text-sm leading-relaxed">{pact.response_commitment}</p>
          </div>
        </div>
      </div>

      {/* Active threats */}
      {activeThreats.length > 0 && (
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-red-400 mb-4">🚨 Active Threats ({activeThreats.length})</h2>
          <div className="space-y-4">
            {activeThreats.map((a) => (
              <div key={a.id} className="bg-zinc-900/80 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-white">{a.affected_member}</p>
                  <p className="text-zinc-500 text-xs">{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">{a.situation_description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Members ({members.length})</h2>
        </div>
        {members.length === 0 ? (
          <p className="text-zinc-500 text-sm">No members yet. Join to establish the network.</p>
        ) : (
          <div className="space-y-3">
            {members.map((m) => (
              <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-5 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">{m.name}</p>
                    <p className="text-zinc-400 text-sm">{m.role ? `${m.role}, ` : ''}{m.organization}</p>
                    {m.commitment_statement && <p className="text-zinc-500 text-xs mt-1 italic">&ldquo;{m.commitment_statement}&rdquo;</p>}
                  </div>
                  <p className="text-zinc-600 text-xs whitespace-nowrap ml-4 mt-1">{new Date(m.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Join form */}
      {!joined ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-5">Join This Pact</h2>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Name *</label>
                <input type="text" value={joinForm.name} onChange={(e) => setJoin('name', e.target.value)}
                  placeholder="Full name"
                  className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Organization *</label>
                <input type="text" value={joinForm.organization} onChange={(e) => setJoin('organization', e.target.value)}
                  placeholder="Your employer or affiliation"
                  className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Role / Title</label>
              <input type="text" value={joinForm.role} onChange={(e) => setJoin('role', e.target.value)}
                placeholder="e.g. Software Engineer, Partner"
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Commitment Statement (optional)</label>
              <textarea value={joinForm.statement} onChange={(e) => setJoin('statement', e.target.value)}
                placeholder="Why you're joining..."
                rows={2}
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
            </div>
            <button type="submit" disabled={joinSubmitting || !joinForm.name || !joinForm.organization}
              className="bg-amber-500 text-black font-medium px-6 py-2 rounded hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {joinSubmitting ? 'Joining...' : 'Join This Pact'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-6 text-center">
          <p className="text-amber-400 font-medium mb-1">You&apos;ve joined this pact.</p>
          <p className="text-zinc-400 text-sm">Share this page to grow the network before it&apos;s needed.</p>
        </div>
      )}

      {/* Report a threat */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Report a Threat</h2>
          {!showThreatForm && (
            <button onClick={() => setShowThreatForm(true)}
              className="bg-red-900/50 border border-red-800 text-red-400 px-4 py-2 rounded hover:bg-red-900 transition-colors text-sm">
              🚨 Activate Pact
            </button>
          )}
        </div>

        {showThreatForm && (
          <form onSubmit={handleThreat} className="bg-red-950/20 border border-red-900/40 rounded-xl p-6 space-y-4">
            <p className="text-red-400 text-sm">This will publicly activate the pact and alert all members.</p>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Affected Member / Organization *</label>
              <input type="text" value={threatForm.affected_member} onChange={(e) => setThreat('affected_member', e.target.value)}
                placeholder="Who is being targeted?"
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Situation Description *</label>
              <textarea value={threatForm.situation_description} onChange={(e) => setThreat('situation_description', e.target.value)}
                placeholder="Describe the threat in detail. Be specific and factual..."
                rows={4}
                className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white w-full focus:outline-none focus:border-amber-500 placeholder:text-zinc-500" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={threatSubmitting || !threatForm.affected_member || !threatForm.situation_description}
                className="bg-red-700 text-white font-medium px-6 py-2 rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {threatSubmitting ? 'Activating...' : 'Activate Pact'}
              </button>
              <button type="button" onClick={() => setShowThreatForm(false)}
                className="bg-zinc-800 text-white px-4 py-2 rounded hover:bg-zinc-700 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {resolvedThreats.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-zinc-500 mb-3">Resolved Threats</h3>
            {resolvedThreats.map((a) => (
              <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 mb-2 opacity-60">
                <div className="flex items-center justify-between">
                  <p className="text-zinc-400 text-sm">{a.affected_member}</p>
                  <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full">Resolved</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
