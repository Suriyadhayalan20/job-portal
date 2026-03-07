'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2, AlertCircle, Eye } from 'lucide-react';
import Link from 'next/link';

interface Job {
  _id: string;
  title: string;
  company: {
    name: string;
    logo?: string;
  };
  location: string;
  type: string;
  employer?: {
    name: string;
    email: string;
  };
  status: string;
  createdAt: string;
}

export default function AdminJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/jobs?status=pending');
      if (!res.ok) throw new Error('Failed to fetch pending jobs');
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleAction = async (jobId: string, action: 'approve' | 'reject') => {
    try {
      setProcessing(jobId);
      const res = await fetch(`/api/admin/jobs/${action}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${action} job`);
      }

      toast.success(`Job ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchJobs(); // Refresh the list
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(null);
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-ink-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading pending jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center bg-red-50 border-red-100">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-red-900 mb-2">Error Loading Jobs</h2>
        <p className="text-red-700 mb-6">{error}</p>
        <button onClick={fetchJobs} className="btn-primary bg-red-600 hover:bg-red-700">Try Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Pending Approvals</h1>
          <p className="text-slate-500 mt-1">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} waiting for review
          </p>
        </div>
        <button
          onClick={fetchJobs}
          className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Refresh List
        </button>
      </div>

      <div className="card overflow-hidden border-none shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Title</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Posted By</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No pending jobs found. Great job!
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 truncate max-w-[200px]" title={job.title}>
                        {job.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600 truncate max-w-[150px]">
                        {job.company?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600 text-sm">{job.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge badge-blue">{job.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-slate-900 font-medium">{job.employer?.name || 'Unknown'}</div>
                        <div className="text-slate-500 italic text-xs">{job.employer?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge badge-yellow capitalize">{job.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/jobs/${job._id}`}
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-ink-600 hover:bg-ink-50 rounded-lg transition-all"
                          title="View Preview"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() => handleAction(job._id, 'approve')}
                          disabled={!!processing}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Approve Job"
                        >
                          {processing === job._id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <CheckCircle size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => handleAction(job._id, 'reject')}
                          disabled={!!processing}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Reject Job"
                        >
                          {processing === job._id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <XCircle size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
