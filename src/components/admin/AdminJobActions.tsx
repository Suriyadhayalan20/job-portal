'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminJobActions({ jobId, currentStatus }: { jobId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success(`Job ${status}`);
      router.refresh();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async () => {
    if (!confirm('Delete this job?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Job deleted');
      router.refresh();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {currentStatus !== 'approved' && (
        <button onClick={() => updateStatus('approved')} disabled={loading} title="Approve"
          className="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors">
          <CheckCircle size={16} />
        </button>
      )}
      {currentStatus !== 'rejected' && (
        <button onClick={() => updateStatus('rejected')} disabled={loading} title="Reject"
          className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
          <XCircle size={16} />
        </button>
      )}
      <button onClick={deleteJob} disabled={loading} title="Delete"
        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
        <Trash2 size={16} />
      </button>
    </div>
  );
}
