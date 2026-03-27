'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, FileText, ExternalLink, Mail, User, Briefcase } from 'lucide-react';
import { formatDate, fixResumeUrl } from '@/lib/utils';
import Link from 'next/link';

export default function AdminApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await fetch('/api/applications');
                if (!res.ok) throw new Error('Failed to fetch applications');
                const data = await res.json();
                setApplications(data.applications || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-ink-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium tracking-wide">Loading all applications...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card p-12 text-center bg-red-50 border-red-100 max-w-2xl mx-auto mt-20">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Data</h2>
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">System Applications</h1>
                <p className="text-slate-500 mt-1">Review all {applications.length} submissons across the platform</p>
            </div>

            <div className="card overflow-hidden border-none shadow-xl bg-white ring-1 ring-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Applicant</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Job Position</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Applied Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Resume</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {applications.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="text-slate-300 mb-2">
                                            <FileText size={40} className="mx-auto opacity-20" />
                                        </div>
                                        <p className="text-slate-400 font-medium">No applications found in the system.</p>
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app) => (
                                    <tr key={app._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold border border-slate-200 group-hover:bg-ink-100 group-hover:text-ink-600 transition-colors">
                                                    {app.userId?.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{app.userId?.name}</p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1"><Mail size={10} /> {app.userId?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <Briefcase size={14} className="text-ink-500" />
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-sm truncate max-w-[180px]">{app.jobId?.title}</p>
                                                    <p className="text-xs text-slate-400">{app.jobId?.company?.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm text-slate-600 font-medium">{formatDate(app.createdAt)}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                        ${app.status === 'applied' ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100' :
                                                    app.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' :
                                                        app.status === 'rejected' ? 'bg-red-50 text-red-600 ring-1 ring-red-100' :
                                                            'bg-amber-50 text-amber-600 ring-1 ring-amber-100'}
                      `}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <a
                                                href={fixResumeUrl(app.resume || app.resumeUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 inline-flex items-center gap-1.5 text-xs font-bold text-ink-600 hover:text-white hover:bg-ink-600 border border-ink-100 rounded-lg transition-all"
                                            >
                                                VIEW <ExternalLink size={12} />
                                            </a>
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
