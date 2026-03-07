'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, X, Briefcase } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { JOB_TYPES, JOB_CATEGORIES, EXPERIENCE_LEVELS } from '@/lib/utils';

interface JobFormProps {
  initialData?: any;
  jobId?: string;
}

export default function JobForm({ initialData, jobId }: JobFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    isRemote: initialData?.isRemote || false,
    type: initialData?.type || 'Full-time',
    category: initialData?.category || '',
    experienceLevel: initialData?.experienceLevel || '',
    salaryMin: initialData?.salary?.min || '',
    salaryMax: initialData?.salary?.max || '',
    salaryCurrency: initialData?.salary?.currency || 'USD',
    salaryPeriod: initialData?.salary?.period || 'yearly',
    applicationDeadline: initialData?.applicationDeadline ? new Date(initialData.applicationDeadline).toISOString().split('T')[0] : '',
    skills: (initialData?.skills || []).join(', '),
    benefits: (initialData?.benefits || []).join(', '),
    requirements: initialData?.requirements || [''],
    responsibilities: initialData?.responsibilities || [''],
  });

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const updateList = (field: 'requirements' | 'responsibilities', idx: number, val: string) => {
    const list = [...form[field]];
    list[idx] = val;
    update(field, list);
  };
  const addListItem = (field: 'requirements' | 'responsibilities') => update(field, [...form[field], '']);
  const removeListItem = (field: 'requirements' | 'responsibilities', idx: number) =>
    update(field, form[field].filter((_: any, i: number) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        location: form.location,
        isRemote: form.isRemote,
        type: form.type,
        category: form.category,
        experienceLevel: form.experienceLevel,
        salary: {
          min: form.salaryMin ? Number(form.salaryMin) : undefined,
          max: form.salaryMax ? Number(form.salaryMax) : undefined,
          currency: form.salaryCurrency,
          period: form.salaryPeriod,
        },
        applicationDeadline: form.applicationDeadline || undefined,
        skills: form.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        benefits: form.benefits.split(',').map((s: string) => s.trim()).filter(Boolean),
        requirements: form.requirements.filter(Boolean),
        responsibilities: form.responsibilities.filter(Boolean),
      };

      const url = jobId ? `/api/jobs/${jobId}` : '/api/jobs';
      const method = jobId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(jobId ? 'Job updated successfully!' : 'Job posted! Awaiting admin approval.');
      router.push('/employer/jobs');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="card p-6 space-y-5">
        <h2 className="font-display text-lg font-semibold text-slate-900">Basic Information</h2>
        <div>
          <label className="label">Job Title *</label>
          <input value={form.title} onChange={(e) => update('title', e.target.value)} required placeholder="e.g. Senior Frontend Developer" className="input-field" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Category *</label>
            <select value={form.category} onChange={(e) => update('category', e.target.value)} required className="input-field">
              <option value="">Select category</option>
              {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Job Type *</label>
            <select value={form.type} onChange={(e) => update('type', e.target.value)} required className="input-field">
              {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Experience Level *</label>
            <select value={form.experienceLevel} onChange={(e) => update('experienceLevel', e.target.value)} required className="input-field">
              <option value="">Select level</option>
              {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Location *</label>
            <input value={form.location} onChange={(e) => update('location', e.target.value)} required placeholder="e.g. New York, NY" className="input-field" />
          </div>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={form.isRemote} onChange={(e) => update('isRemote', e.target.checked)} className="w-4 h-4 rounded text-ink-600" />
          <span className="text-sm font-medium text-slate-700">This is a remote position</span>
        </label>
      </div>

      {/* Description */}
      <div className="card p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-slate-900">Job Description *</h2>
        <textarea value={form.description} onChange={(e) => update('description', e.target.value)} required rows={8} placeholder="Describe the role, company culture, and what makes this opportunity exciting..." className="input-field resize-none" />
      </div>

      {/* Responsibilities */}
      <div className="card p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-slate-900">Responsibilities</h2>
        {form.responsibilities.map((r: string, i: number) => (
          <div key={i} className="flex gap-2">
            <input value={r} onChange={(e) => updateList('responsibilities', i, e.target.value)} placeholder={`Responsibility ${i + 1}`} className="input-field" />
            {form.responsibilities.length > 1 && (
              <button type="button" onClick={() => removeListItem('responsibilities', i)} className="p-2 text-red-400 hover:text-red-600">
                <X size={18} />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addListItem('responsibilities')} className="flex items-center gap-2 text-sm text-ink-600 hover:text-ink-800 font-medium">
          <Plus size={16} /> Add responsibility
        </button>
      </div>

      {/* Requirements */}
      <div className="card p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-slate-900">Requirements</h2>
        {form.requirements.map((r: string, i: number) => (
          <div key={i} className="flex gap-2">
            <input value={r} onChange={(e) => updateList('requirements', i, e.target.value)} placeholder={`Requirement ${i + 1}`} className="input-field" />
            {form.requirements.length > 1 && (
              <button type="button" onClick={() => removeListItem('requirements', i)} className="p-2 text-red-400 hover:text-red-600">
                <X size={18} />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addListItem('requirements')} className="flex items-center gap-2 text-sm text-ink-600 hover:text-ink-800 font-medium">
          <Plus size={16} /> Add requirement
        </button>
      </div>

      {/* Salary */}
      <div className="card p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-slate-900">Salary & Compensation</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="label">Min Salary</label>
            <input type="number" value={form.salaryMin} onChange={(e) => update('salaryMin', e.target.value)} placeholder="50000" className="input-field" />
          </div>
          <div>
            <label className="label">Max Salary</label>
            <input type="number" value={form.salaryMax} onChange={(e) => update('salaryMax', e.target.value)} placeholder="80000" className="input-field" />
          </div>
          <div>
            <label className="label">Currency</label>
            <select value={form.salaryCurrency} onChange={(e) => update('salaryCurrency', e.target.value)} className="input-field">
              {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Period</label>
            <select value={form.salaryPeriod} onChange={(e) => update('salaryPeriod', e.target.value)} className="input-field">
              <option value="yearly">Yearly</option>
              <option value="monthly">Monthly</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Skills & Benefits */}
      <div className="card p-6 space-y-5">
        <h2 className="font-display text-lg font-semibold text-slate-900">Skills & Benefits</h2>
        <div>
          <label className="label">Required Skills <span className="text-slate-400 font-normal">(comma-separated)</span></label>
          <input value={form.skills} onChange={(e) => update('skills', e.target.value)} placeholder="React, TypeScript, Node.js, MongoDB" className="input-field" />
        </div>
        <div>
          <label className="label">Benefits & Perks <span className="text-slate-400 font-normal">(comma-separated)</span></label>
          <input value={form.benefits} onChange={(e) => update('benefits', e.target.value)} placeholder="Health insurance, 401k, Remote work, Stock options" className="input-field" />
        </div>
        <div>
          <label className="label">Application Deadline</label>
          <input type="date" value={form.applicationDeadline} onChange={(e) => update('applicationDeadline', e.target.value)} className="input-field" />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <Spinner size="sm" /> : <Briefcase size={18} />}
          {loading ? 'Saving...' : (jobId ? 'Update Job' : 'Post Job')}
        </button>
      </div>
    </form>
  );
}
