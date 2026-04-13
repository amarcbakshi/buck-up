'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface NormalizationTracker {
  id: string;
  name: string;
  description: string;
  organization: string;
  compliance_level: number;
  created_at: string;
}

export default function NormalizationTrackerDetail() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;

  const [item, setItem] = useState<NormalizationTracker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organization: '',
    compliance_level: 1,
  });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('normalization_tracker')
          .select('*')
          .eq('id', orgId)
          .single();

        if (supabaseError) throw supabaseError;
        setItem(data);
        setFormData({
          name: data.name,
          description: data.description,
          organization: data.organization,
          compliance_level: data.compliance_level,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load item');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [orgId]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'compliance_level' ? parseInt(value, 10) : value,
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error: supabaseError } = await supabase
        .from('normalization_tracker')
        .update(formData)
        .eq('id', orgId);

      if (supabaseError) throw supabaseError;
      setIsEditing(false);
      setItem({ ...item!, ...formData });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      setLoading(true);
      const { error: supabaseError } = await supabase
        .from('normalization_tracker')
        .delete()
        .eq('id', orgId);

      if (supabaseError) throw supabaseError;
      router.push('/normalization-tracker');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      setLoading(false);
    }
  };

  if (loading && !item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-red-400">Item not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button
        onClick={() => router.push('/normalization-tracker')}
        className="text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        ← Back to Normalization Tracker
      </button>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6 text-red-100">
          {error}
        </div>
      )}

      {!isEditing ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">{item.name}</h1>
              <p className="text-zinc-400 mt-2">{item.description}</p>
            </div>
            <div
              className="px-4 py-2 rounded text-sm font-medium text-white"
              style={{ backgroundColor: complianceColors[item.compliance_level as keyof typeof complianceColors] }}
            >
              {getComplianceLevel(item.compliance_level)}
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-6 mb-6">
            <p className="text-sm text-zinc-500 mb-2">Organization</p>
            <p className="text-white font-medium">{item.organization}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-amber-500 text-black font-medium px-4 py-2 rounded hover:bg-amber-400 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white font-medium px-4 py-2 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <div className="mb-6">
            <label className="block text-white font-medium mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-white font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-white font-medium mb-2">Organization</label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-white font-medium mb-2">Compliance Level</label>
            <select
              name="compliance_level"
              value={formData.compliance_level}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value={1}>Minimal</option>
              <option value={2}>Low</option>
              <option value={3}>Moderate</option>
              <option value={4}>High</option>
              <option value={5}>Critical</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-amber-500 text-black font-medium px-4 py-2 rounded hover:bg-amber-400 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-zinc-800 text-white font-medium px-4 py-2 rounded hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
