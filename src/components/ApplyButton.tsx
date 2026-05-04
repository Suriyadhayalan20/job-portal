'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Send, CheckCircle } from 'lucide-react';
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
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!session) {
            router.push(`/auth/login?callbackUrl=/jobs/${jobId}`);
            return;
        }

        if (!resumeFile) {
            toast.error('Please upload your resume');
            return;
        }

        setLoading(true);
        try {
            // We now send the file to our backend API which handles the Cloudinary upload
            // with the correct 'auto' resource type for PDF stability.
            const formData = new FormData();
            formData.append('file', resumeFile);
            formData.append('jobId', jobId);
            formData.append('coverLetter', coverLetter);

            const res = await fetch('/api/applications', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit application');

            setIsSuccess(true);
            toast.success(`Successfully applied to ${jobTitle}`);
            
            setTimeout(() => {
                router.push('/jobs');
            }, 2000);
        } catch (error: any) {
            console.error('Application Submission Error:', error);
            toast.error(error.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center animate-fade-in shadow-sm">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-bold text-emerald-900 text-lg">Application Sent!</h3>
                <p className="text-sm text-emerald-700 mt-1">Your profile has been shared with the employer.</p>
                <p className="text-xs text-emerald-600 mt-4 font-medium italic">Redirecting to jobs board...</p>
            </div>
        );
    }

    if (!showForm) {
        return (
            <button
                onClick={() => {
                    if (!session) router.push(`/auth/login?callbackUrl=/jobs/${jobId}`);
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
        <div className="card p-6 border-none bg-white shadow-2xl ring-1 ring-slate-100 animate-slide-up">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50">
                <h3 className="font-display font-bold text-slate-900">Apply for Job</h3>
                <button 
                    onClick={() => setShowForm(false)} 
                    className="text-slate-400 hover:text-red-500 transition-colors text-sm font-medium"
                >
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <ResumeUpload
                    onFileSelect={(file) => setResumeFile(file)}
                />

                <div>
                    <label className="label text-slate-700 font-bold mb-1.5">Cover Letter (Optional)</label>
                    <textarea
                        className="input-field min-h-[140px] resize-none focus:ring-2 focus:ring-ink-500/20 focus:border-ink-500 bg-slate-50 border-slate-200"
                        placeholder="Tell the employer why you're a great fit..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 bg-ink-600 hover:bg-ink-700 shadow-md transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Spinner size="sm" />
                            <span>Processing...</span>
                        </>
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
