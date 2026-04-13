'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { MdpPact } from '@/lib/types'

type PactWithCount = MdpPact & { member_count: number }

export default function MutualDefensePage() {
  const [pacts, setPacts] = useState<PactWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: pactsData } = await supabase.from('mdp_pacts').select('*').order('created_at', { ascending: false })
      const { data: members } = await supabase.from('mdp_members').select('pact_id')
      if (pactsData) {
        setPacts(pactsData.map((p) => ({
          ...p,
          member_count: members?.filter((m) => m.pact_id === p.id).length ?? 0,
        })))
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mutual Defense Pact</h1>
          <p className="text-zinc-400 max-w-2xl">
            Pre-established collective commitments. The mechanism: distributing the individual cost of resistance across the group, making the individual cost of participation low enough that economic calculation no longer dominates. Only works if the pact is credible, pre-established, and well-understood before anyone needs to invoke it.
          </p>
        </div>
        <Link
          href="/mutual-defense/new"
          className="bg-amber-500 text-black font-medium px-4 py-2 rounded hover:bg-amber-400 transition-colors whitespace-nowrap ml-6 mt-1"
        >
          + Create a Pact
        </Link>
      </div>

      {loading ? (
        <div className="text-zinc-500">Loading...</div>
      ) : pacts.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🤝</div>
          <p className="text-zinc-400 mb-6">No pacts established yet. Create the first mutual defense network for your industry.</p>
          <Link href="/mutual-defense/new" className="bg-amber-500 text-black font-medium px-6 py-2 rounded hover:bg-amber-400 transition-colors">
            Create a Pact
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {pacts.map((pact) => (
            <div key={pact.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{pact.industry}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${pact.is_active ? 'bg-green-900/50 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                      {pact.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-amber-500">{pact.member_count} {pact.member_count === 1 ? 'member' : 'members'}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-white mb-2">{pact.title}</h2>
                  <p className="text-zinc-400 text-sm mb-3 line-clamp-2">{pact.description}</p>
                  <div className="bg-zinc-800/50 rounded-lg px-4 py-3">
                    <p className="text-xs text-zinc-500 mb-1">Activates when:</p>
                    <p className="text-zinc-300 text-sm line-clamp-2">{pact.trigger_conditions}</p>
                  </div>
                </div>
                <Link
                  href={`/mutual-defense/${pact.id}`}
                  className="ml-6 bg-zinc-800 text-white px-4 py-2 rounded hover:bg-zinc-700 transition-colors text-sm whitespace-nowrap mt-1"
                >
                  View &amp; Join →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
