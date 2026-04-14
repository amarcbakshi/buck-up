import Link from 'next/link'

const tools = [
  {
    href: '/normalization-tracker',
    title: 'Normalization Tracker',
    icon: '📉',
    description: 'Track when organizations made concessions under pressure. Visualize the drift over time — making the boiling frog dynamic visible and durable.',
    tag: 'Counters: Gradual Normalization',
  },
  {
    href: '/precommitment',
    title: 'Pre-Commitment Platform',
    icon: '✍️',
    description: 'Groups publish public commitments before a crisis arrives. Once signed and visible, the calculus inverts — defection becomes costly, resistance becomes the default.',
    tag: 'Counters: Atomization & Elite Capture',
  },
  {
    href: '/backbone-scorecard',
    title: 'Backbone Scorecard',
    icon: '🦴',
    description: 'Assess your organization across seven resilience dimensions: atomization resistance, normalization awareness, elite capture exposure, economic independence, and more.',
    tag: 'Counters: All failure modes',
  },
  {
    href: '/mutual-defense',
    title: 'Mutual Defense Pact',
    icon: '🤝',
    description: 'Create and join pre-established collective commitments. When one member is targeted, the whole network responds — distributing the individual cost of resistance across the group.',
    tag: 'Counters: Economic Dependence & Isolation',
  },
  {
    href: '/democracy-rating',
    title: 'Pro-Democracy Ratings',
    icon: '⚖️',
    description: 'Letter grades (A–F) for organizations based on how they\'ve responded to authoritarian pressure. Researched from public reporting. Starting with law firms — who fought, who capitulated, and what happened next.',
    tag: 'Accountability: Who Buckled',
  },
]

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="mb-16 max-w-3xl">
        <div className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm px-3 py-1 rounded-full mb-6">
          Based on the &ldquo;In Formation&rdquo; framework
        </div>
        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">Buck Up</h1>
        <p className="text-xl text-zinc-300 mb-4 leading-relaxed">
          Tools for organizational resilience in the face of authoritarian pressure.
        </p>
        <p className="text-zinc-400 leading-relaxed mb-4">
          The formation pipeline runs forward — apolitical front doors become political power through recurring contact, shared identity, and collective action. But adversaries understand this logic too. Authoritarian pressure rarely attacks groups as groups. It atomizes individuals, normalizes concessions one at a time, captures leadership, and exploits economic dependence until the group no longer knows it has been compromised.
        </p>
        <p className="text-zinc-400 leading-relaxed">
          These tools address each attack surface. The common thread: effective hardening is almost always built <em className="text-zinc-200">before</em> the crisis, not during it — and accountability requires naming who buckled and who held.
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-7 hover:border-amber-500/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{tool.icon}</span>
              <span className="text-xs text-amber-500/70 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">
                {tool.tag}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
              {tool.title}
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">{tool.description}</p>
            <div className="mt-4 text-amber-500 text-sm font-medium">Open tool →</div>
          </Link>
        ))}
      </div>

      <div className="border-t border-zinc-800 pt-10 text-zinc-500 text-sm max-w-2xl">
        <p>
          <strong className="text-zinc-400">The design principle:</strong> resilience should be built into formation itself, not retrofitted after a threat appears. Framework by Upendra Naig — &ldquo;In Formation&rdquo; and &ldquo;Bucking Up Groups in the Face of Threat.&rdquo;
        </p>
      </div>
    </div>
  )
}
