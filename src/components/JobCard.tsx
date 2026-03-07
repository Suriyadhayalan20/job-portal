import Link from 'next/link';
import { MapPin, Clock, Briefcase, TrendingUp, Star, Users } from 'lucide-react';
import { formatSalary, timeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Job } from '@/types/job';

interface JobCardProps {
    job: Job;
    compact?: boolean;
}

const typeColors: Record<string, string> = {
    'Full-time': 'badge-blue',
    'Part-time': 'badge-purple',
    'Contract': 'badge-yellow',
    'Freelance': 'badge-green',
    'Internship': 'badge-gray',
    'Remote': 'badge-green',
};

export default function JobCard({ job, compact }: JobCardProps) {
    return (
        <Link href={`/jobs/${job._id}`}>
            <div className={cn('card p-6 cursor-pointer group hover:shadow-xl transition-all duration-300', job.featured && 'ring-2 ring-ink-200')}>
                {job.featured && (
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold mb-3">
                        <Star size={12} fill="currentColor" /> Featured
                    </div>
                )}

                <div className="flex items-start gap-4">
                    {/* Company logo */}
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-ink-100 transition-colors">
                        {job.company?.logo ? (
                            <img src={job.company.logo} alt={job.company.name} className="w-10 h-10 rounded-lg object-contain" />
                        ) : (
                            <span className="font-display font-bold text-lg text-slate-500 group-hover:text-ink-600 transition-colors">
                                {job.company?.name?.[0] || '?'}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h3 className="font-display font-semibold text-slate-900 group-hover:text-ink-700 transition-colors truncate">
                                    {job.title}
                                </h3>
                                <p className="text-sm text-slate-500 mt-0.5">{job.company?.name}</p>
                            </div>
                            <span className={cn('flex-shrink-0', typeColors[job.type] || 'badge-gray')}>{job.type}</span>
                        </div>

                        {!compact && (
                            <p className="text-sm text-slate-600 mt-2 line-clamp-2">{job.description?.replace(/<[^>]*>/g, '').slice(0, 120)}...</p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-medium"><MapPin size={12} className="text-slate-400" />{job.location}</span>
                            <span className="flex items-center gap-1 font-medium"><TrendingUp size={12} className="text-slate-400" />{job.experienceLevel}</span>
                            <span className="flex items-center gap-1 font-medium"><Clock size={12} className="text-slate-400" />{timeAgo(job.createdAt)}</span>
                            {(job as any).applicationCount > 0 && (
                                <span className="flex items-center gap-1 font-medium text-ink-600"><Users size={12} />{job.applicationCount} applicants</span>
                            )}
                        </div>

                        {job.salary?.min || job.salary?.max ? (
                            <div className="mt-4 text-sm font-bold text-emerald-600">
                                {formatSalary(job.salary.min, job.salary.max, job.salary.currency || 'USD')}
                                <span className="text-slate-400 font-normal ml-1">/{job.salary.period || 'year'}</span>
                            </div>
                        ) : null}

                        {!compact && job.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-4">
                                {job.skills.slice(0, 3).map((skill: string) => (
                                    <span key={skill} className="badge badge-gray bg-slate-50 border-slate-100 text-slate-500">{skill}</span>
                                ))}
                                {job.skills.length > 3 && <span className="badge badge-gray bg-slate-50 border-slate-100 text-slate-500">+{job.skills.length - 3}</span>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
