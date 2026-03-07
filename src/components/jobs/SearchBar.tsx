'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { JOB_CATEGORIES, JOB_TYPES, EXPERIENCE_LEVELS } from '@/lib/utils';

interface SearchBarProps {
  showFilters?: boolean;
  className?: string;
}

export default function SearchBar({ showFilters = false, className }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experienceLevel') || '');

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    if (category) params.set('category', category);
    if (type) params.set('type', type);
    if (experienceLevel) params.set('experienceLevel', experienceLevel);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className={className}>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Job title, keyword, company..."
            className="input-field pl-11"
          />
        </div>
        <div className="flex-1 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, state, or remote..."
            className="input-field pl-11"
          />
        </div>
        {showFilters && (
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="btn-secondary flex items-center gap-2 flex-shrink-0"
          >
            <SlidersHorizontal size={16} />
            Filters
            {(category || type || experienceLevel) && (
              <span className="w-2 h-2 rounded-full bg-ink-600" />
            )}
          </button>
        )}
        <button type="submit" className="btn-primary flex-shrink-0">Search Jobs</button>
      </form>

      {showFilters && filtersOpen && (
        <div className="mt-4 p-5 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
          <div>
            <label className="label">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
              <option value="">All Categories</option>
              {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Job Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="input-field">
              <option value="">All Types</option>
              {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Experience Level</label>
            <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="input-field">
              <option value="">All Levels</option>
              {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="sm:col-span-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setCategory(''); setType(''); setExperienceLevel(''); }}
              className="btn-secondary text-sm py-2"
            >
              Clear filters
            </button>
            <button type="button" onClick={() => handleSearch()} className="btn-primary text-sm py-2">
              Apply filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
