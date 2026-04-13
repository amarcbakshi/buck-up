'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { PcCommitment } from '@/lib/types'

type CommitmentWithCount = PcCommitment & { signatory_count: number }

export default function PrecommitmentPage() {
  const [commitments, setCommitments] = useState<CommitmentWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('pc_commitments')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: sigs } = await supabase
        .from('pc_signatories')
        .select('commitment_id')

      if (data) {
        const withCounts = data.map((c) => ({
          ...c,
          signatory_count: sigs?.filter((s) => s.commitment_id === c.id).length ?? 0,
        }))
        setCommitments(withCounts)
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Pre-Commitment Platform</h1>
          <p className="text-zinc-400 max-w-2xl">
            Public commitments change the game-theoretic calculus. The cost of commitment is lowest before the threat materializes. Once signed and visible, the calculus inverts — comply and everyone sees you broke the pact. Resistance becomes the default.
          </p>
        </div>
        <Link
          href="/precommitment/new"
          className="bg-amber-500 text-black font-medium px-4 py-2 rounded hover:bg-amber-400 transition-colors whitespace-nowrap ml-6 mt-1"
        >
          + Create a Commitment
        </Link>
      </div>

      {loading ? (
        <div className="text-zinc-500">Loading...</div>
      ) : commitments.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">✍️</div>
          <p className="text-zinc-400 mb-6">No public commitments yet. Create the first one for your group or industry.</p>
          <Link href="/precommitment/new" className="bg-amber-500 text-black font-medium px-6 py-2 rounded hover:bg-amber-400 transition-colors">
            Create a Commitment
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {commitments.map((c) => (
            <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                      {c.group_type}
                    </span>
                    <span className="text-xs text-amber-500">
                      {c.signatory_count} {c.signatory_count === 1 ? 'signatory' : 'signatories'}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-white mb-2">{c.title}</h2>
                  <p className="text-zinc-400 text-sm line-clamp-2">{c.description}</p>
                </div>
                <Link
                  href={`/precommitment/${c.id}`}
                  className="ml-6 bg-zinc-800 text-white px-4 py-2 rounded hover:bg-zinc-700 transition-colors text-sm whitespace-nowrap mt-1"
                >
                  View &amp; Sign →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
