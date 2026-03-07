'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUserActions({ userId, isActive }: { userId: string; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleActive = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(isActive ? 'User deactivated' : 'User activated');
      router.refresh();
    } catch {
      toast.error('Action failed');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('User deleted');
      router.refresh();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button onClick={toggleActive} disabled={loading} title={isActive ? 'Deactivate' : 'Activate'}
        className={`p-1.5 rounded-lg transition-colors ${isActive ? 'hover:bg-amber-50 text-slate-400 hover:text-amber-600' : 'hover:bg-emerald-50 text-slate-400 hover:text-emerald-600'}`}>
        {isActive ? <UserX size={15} /> : <UserCheck size={15} />}
      </button>
      <button onClick={deleteUser} disabled={loading} title="Delete"
        className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
        <Trash2 size={15} />
      </button>
    </div>
  );
}
