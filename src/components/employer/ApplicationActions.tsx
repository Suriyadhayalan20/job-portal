'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface ApplicationActionsProps {
  applicationId: string;
  currentStatus: string;
}

const statusOptions = [
  { value: 'applied', label: 'Applied', style: 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100' },
  { value: 'reviewed', label: 'Reviewed', style: 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100' },
  { value: 'accepted', label: 'Shortlist', style: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' },
  { value: 'rejected', label: 'Reject', style: 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100' },
];

export default function ApplicationActions({ applicationId, currentStatus }: ApplicationActionsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    if (newStatus === status) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setStatus(newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2 mt-6 flex-wrap">
      <button
        disabled={loading || status === 'accepted'}
        onClick={() => updateStatus('accepted')}
        className={`flex-1 btn-secondary text-sm py-2 ${status === 'accepted' ? 'opacity-50 cursor-not-allowed' : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'}`}
      >
        {status === 'accepted' ? 'Shortlisted ✓' : 'Shortlist'}
      </button>
      <button
        disabled={loading || status === 'rejected'}
        onClick={() => updateStatus('rejected')}
        className={`flex-1 btn-secondary text-sm py-2 ${status === 'rejected' ? 'opacity-50 cursor-not-allowed' : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'}`}
      >
        {status === 'rejected' ? 'Rejected ✗' : 'Reject'}
      </button>
      {status !== 'applied' && (
        <button
          disabled={loading}
          onClick={() => updateStatus('reviewed')}
          className="flex-1 btn-secondary text-sm py-2 bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100"
        >
          Mark Reviewed
        </button>
      )}
    </div>
  );
}
