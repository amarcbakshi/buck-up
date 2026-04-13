'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface NormalizationTracker {
  id: string;
  name: string;
  description: string;
  organization: string;
  compliance_level: number;
  created_at: string;
}

export default function NormalizationTrackerList() {
  const router = useRouter();
  const [items, setItems] = useState<NormalizationTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('normalization_tracker')
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;
        setItems(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const complianceColors = {
    1: '#22c55e',
    2: '#84cc16',
    3: '#f59e0b',
    4: '#f97316',
    5: '#ef4444',
  };

  const getComplianceLevel = (level: number) => {
    const levels = ['', 'Minimal', 'Low', 'Moderate', 'High', 'Critical'];
    return levels[level] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-zinc-400">Loading normalization tracker items...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Normalization Tracker</h1>
        <p className="text-zinc-400 text-lg">Monitor and track normalization of anti-democratic practices</p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6 text-red-100">
          {error}
        </div>
      )}

      <button
        onClick={() => router.push('/normalization-tracker/new')}
        className="bg-amber-500 text-black font-medium px-4 py-2 rounded hover:bg-amber-400 transition-colors disabled:opacity-50 mb-6"
      >
        + New Entry
      </button>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
            <p className="text-zinc-400">No normalization tracker entries yet</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/normalization-tracker/${item.id}`)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 cursor-pointer hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                  <p className="text-zinc-400 mt-1">{item.description}</p>
                  <div className="mt-3 text-sm text-zinc-500">
                    Organization: <span className="text-zinc-300">{item.organization}</span>
                  </div>
                </div>
                <div
                  className="px-3 py-1 rounded text-sm font-medium text-white"
                  style={{ backgroundColor: complianceColors[item.compliance_level as keyof typeof complianceColors] }}
                >
                  {getComplianceLevel(item.compliance_level)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
