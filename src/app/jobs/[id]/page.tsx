'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Clock, Briefcase, TrendingUp, DollarSign, Calendar, Users, Building2, Globe, ArrowLeft, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/layout/Footer';
import ApplyButton from '@/components/ApplyButton';
import { formatDate, formatSalary, timeAgo } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';

export default function JobDetailPage() {
    const params = useParams();
    const jobId = params?.id as string;
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            if (!jobId) return;
            try {
                const res = await fetch(`/api/jobs/${jobId}`);
                if (!res.ok) {
                    setError(true);
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                if (data.job) {
                    setJob(data.job);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [jobId]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Spinner size="lg" />
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center px-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Briefcase size={32} className="text-slate-300" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Job not found</h1>
                        <p className="text-slate-500 mt-2 max-w-xs mx-auto">The job posting you are looking for may have expired or was removed.</p>
                        <Link href="/jobs" className="btn-primary mt-6 inline-flex items-center gap-2">
                            <ArrowLeft size={16} /> Back to jobs
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50/30">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <Link href="/jobs" className="inline-flex items-center gap-2 text-slate-500 hover:text-ink-600 text-sm mb-8 transition-all font-medium">
                    <ArrowLeft size={16} /> Back to explore jobs
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Job header */}
                        <div className="card p-8 border-none shadow-xl bg-white ring-1 ring-slate-100">
                            <div className="flex flex-col sm:flex-row items-start gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100 shadow-sm overflow-hidden">
                                    {job?.company?.logo ? (
                                        <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-display text-3xl font-bold text-ink-600">{job?.company?.name?.[0] || 'J'}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="badge bg-ink-50 text-ink-700 border-ink-100 uppercase tracking-wider text-[10px] font-black">{job?.type}</span>
                                        {job?.isRemote && <span className="badge bg-emerald-50 text-emerald-700 border-emerald-100 uppercase tracking-wider text-[10px] font-black">Remote</span>}
                                        <span className="badge bg-slate-100 text-slate-600 border-slate-200 uppercase tracking-wider text-[10px] font-black">{job?.category}</span>
                                    </div>
                                    <h1 className="font-display text-3xl font-bold text-slate-900 leading-tight mb-2">{job?.title}</h1>
                                    <p className="text-xl text-slate-600 font-medium">{job?.company?.name}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-slate-50">
                                {[
                                    { icon: MapPin, label: 'Location', value: job?.location },
                                    { icon: DollarSign, label: 'Salary', value: formatSalary(job?.salary?.min, job?.salary?.max, job?.salary?.currency) },
                                    { icon: Clock, label: 'Posted', value: timeAgo(job?.createdAt) },
                                    { icon: Users, label: 'Applicants', value: `${job?.applicationCount || 0} applied` },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Icon size={14} />
                                            <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="card p-8 border-none shadow-lg bg-white ring-1 ring-slate-50">
                            <h2 className="font-display text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-ink-600 rounded-full" />
                                Job Description
                            </h2>
                            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap text-base">
                                {job?.description}
                            </div>
                        </div>

                        {/* Responsibilities */}
                        {job?.responsibilities?.length > 0 && (
                            <div className="card p-8 border-none shadow-lg bg-white ring-1 ring-slate-50">
                                <h2 className="font-display text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-purple-600 rounded-full" />
                                    Key Responsibilities
                                </h2>
                                <ul className="space-y-4">
                                    {job.responsibilities.map((r: string, i: number) => (
                                        <li key={i} className="flex items-start gap-4 text-slate-700 group">
                                            <div className="mt-1 w-5 h-5 rounded-full bg-ink-50 flex items-center justify-center flex-shrink-0 group-hover:bg-ink-600 transition-colors">
                                                <CheckCircle size={12} className="text-ink-600 group-hover:text-white transition-colors" />
                                            </div>
                                            <span className="text-base font-medium">{r}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Requirements */}
                        {job?.requirements?.length > 0 && (
                            <div className="card p-8 border-none shadow-lg bg-white ring-1 ring-slate-50">
                                <h2 className="font-display text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-emerald-600 rounded-full" />
                                    Qualifications & Requirements
                                </h2>
                                <ul className="space-y-4">
                                    {job.requirements.map((r: string, i: number) => (
                                        <li key={i} className="flex items-start gap-4 text-slate-700 group">
                                            <div className="mt-1 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 transition-colors">
                                                <CheckCircle size={12} className="text-emerald-600 group-hover:text-white transition-colors" />
                                            </div>
                                            <span className="text-base font-medium">{r}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Skills */}
                        {job?.skills?.length > 0 && (
                            <div className="card p-8 border-none shadow-lg bg-white ring-1 ring-slate-50">
                                <h2 className="font-display text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-amber-500 rounded-full" />
                                    Technical Skills
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {job.skills.map((skill: string) => (
                                        <span key={skill} className="px-5 py-2.5 bg-slate-50 text-slate-700 font-bold text-sm rounded-xl border border-slate-100 hover:border-ink-200 hover:bg-ink-50 transition-all cursor-default">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Apply card */}
                        <div className="card p-8 sticky top-24 border-none shadow-2xl bg-white ring-1 ring-slate-100">
                            <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Apply for this position</h3>
                            <p className="text-sm text-slate-500 mb-6 leading-relaxed">Submit your application today. We typically respond to candidates within 3-5 business days.</p>
                            
                            {job?.applicationDeadline && (
                                <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3">
                                    <Calendar size={18} className="text-amber-600" />
                                    <div className="text-xs">
                                        <p className="font-bold text-amber-900 uppercase tracking-tight">Deadline approaching</p>
                                        <p className="text-amber-700 mt-0.5">Apply before {formatDate(job.applicationDeadline)}</p>
                                    </div>
                                </div>
                            )}
                            
                            <ApplyButton jobId={job?._id?.toString() || jobId} jobTitle={job?.title || 'this job'} />
                            
                            <div className="mt-6 flex items-center justify-center gap-6">
                                <button className="text-xs font-bold text-slate-400 hover:text-ink-600 transition-colors uppercase tracking-widest">Share Job</button>
                                <button className="text-xs font-bold text-slate-400 hover:text-ink-600 transition-colors uppercase tracking-widest">Save for later</button>
                            </div>
                        </div>

                        {/* Company info */}
                        <div className="card p-6 border-none shadow-lg bg-white ring-1 ring-slate-50">
                            <h3 className="font-display font-bold text-slate-900 mb-4">Employer Information</h3>
                            <div className="flex items-center gap-4 mb-6 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                                    <span className="font-display text-lg font-bold text-ink-600">{job?.company?.name?.[0]}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{job?.company?.name}</p>
                                    {job?.company?.industry && <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{job.company.industry}</p>}
                                </div>
                            </div>
                            <div className="space-y-4 text-sm text-slate-600">
                                {job?.company?.size && (
                                    <div className="flex items-center gap-3 font-medium">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 text-slate-400"><Building2 size={16} /></div>
                                        <span>{job.company.size} employees</span>
                                    </div>
                                )}
                                {job?.company?.website && (
                                    <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-ink-600 hover:text-ink-800 font-bold transition-all">
                                        <div className="w-8 h-8 rounded-lg bg-ink-50 flex items-center justify-center flex-shrink-0 text-ink-600"><Globe size={16} /></div>
                                        <span>Visit company website</span>
                                    </a>
                                ) || (
                                    <div className="flex items-center gap-3 text-slate-400 italic">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0"><Globe size={16} /></div>
                                        <span>No website available</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Job overview */}
                        <div className="card p-6 border-none shadow-lg bg-white ring-1 ring-slate-50">
                            <h3 className="font-display font-bold text-slate-900 mb-5">Job Snapshot</h3>
                            <div className="space-y-4">
                                {[
                                    { icon: Calendar, label: 'Date Posted', value: formatDate(job?.createdAt) },
                                    { icon: TrendingUp, label: 'Experience', value: job?.experienceLevel },
                                    { icon: Briefcase, label: 'Job Type', value: job?.type },
                                    { icon: MapPin, label: 'Location', value: job?.location },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-ink-100 transition-colors">
                                            <Icon size={16} className="text-slate-400 group-hover:text-ink-600 transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">{label}</p>
                                            <p className="text-slate-800 font-bold text-sm">{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
