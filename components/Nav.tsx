'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tools = [
  { href: '/normalization-tracker', label: 'Normalization Tracker', short: 'Tracker' },
  { href: '/precommitment', label: 'Pre-Commitment Platform', short: 'Commitments' },
  { href: '/backbone-scorecard', label: 'Backbone Scorecard', short: 'Scorecard' },
  { href: '/mutual-defense', label: 'Mutual Defense Pact', short: 'Defense Pact' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-white tracking-tight text-lg">
          Buck Up
        </Link>
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                pathname.startsWith(tool.href)
                  ? 'bg-amber-500 text-black font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span className="hidden md:inline">{tool.short}</span>
              <span className="md:hidden">{tool.short}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
