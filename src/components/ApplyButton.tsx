'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import ResumeUpload from './ResumeUpload';

interface ApplyButtonProps {
    jobId: string;
    jobTitle: string;
}

export default function ApplyButton({ jobId, jobTitle }: ApplyButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        resumeUrl: '',
        coverLetter: ''
    });
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            router.push('/auth/login?callbackUrl=/jobs/' + jobId);
            return;
        }

        if (!formData.resumeUrl) {
            toast.error('Please upload your resume first');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId,
                    resumeUrl: formData.resumeUrl,
                    coverLetter: formData.coverLetter
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to apply');

            setIsSuccess(true);
            toast.success('Successfully applied to ' + jobTitle);
            setTimeout(() => {
                router.push('/jobs');
            }, 2000);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center animate-fade-in shadow-sm">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="font-bold text-emerald-900">Application Sent!</h3>
                <p className="text-sm text-emerald-700">Redirecting to jobs board...</p>
            </div>
        );
    }

    if (!showForm) {
        return (
            <button
                onClick={() => {
                    if (!session) router.push('/auth/login?callbackUrl=/jobs/' + jobId);
                    else setShowForm(true);
                }}
                className="btn-primary w-full py-4 text-lg bg-gradient-to-r from-ink-600 to-purple-600 border-none flex items-center justify-center gap-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg active:shadow-sm"
            >
                <Send size={20} />
                Apply Now
            </button>
        );
    }

    return (
        <div className="card p-6 border-ink-100 bg-ink-50/30 animate-slide-up shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-ink-100">
                <h3 className="font-display font-bold text-slate-900">Apply for Job</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <ResumeUpload
                    onUpload={(url) => setFormData(prev => ({ ...prev, resumeUrl: url }))}
                />

                <div>
                    <label className="label">Cover Letter (Optional)</label>
                    <textarea
                        className="input-field min-h-[120px] resize-none focus:ring-ink-500 focus:border-ink-500"
                        placeholder="Tell us why you are a good fit for this role..."
                        value={formData.coverLetter}
                        onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2 bg-ink-600 hover:bg-ink-700 shadow-md transition-all duration-200 active:scale-95"
                >
                    {loading ? (
                        <Spinner size="sm" />
                    ) : (
                        <>
                            <Send size={18} />
                            Submit Application
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
