import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Briefcase, Users, Eye, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import Application from '@/models/Application';
import { timeAgo } from '@/lib/utils';
import StatsCard from '@/components/ui/StatsCard';

async function getEmployerData(employerId: string) {
    await dbConnect();
    const jobs = await Job.find({ employer: employerId }).sort({ createdAt: -1 }).lean();

    const jobsWithAppCount = await Promise.all(jobs.map(async (job: any) => {
        const count = await Application.countDocuments({ jobId: job._id });
        return { ...job, applicationCount: count };
    }));

    const totalApplications = await Application.countDocuments({
        jobId: { $in: jobs.map(j => j._id) }
    });

    return {
        jobs: jobsWithAppCount,
        totalApplications,
        activeJobs: jobs.filter(j => (j as any).status === 'approved').length,
        pendingJobs: jobs.filter(j => (j as any).status === 'pending').length
    };
}

export default async function EmployerDashboard() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'employer') {
        return (
            <div className="p-8 text-center bg-white rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold text-slate-800">Employer Access Only</h2>
                <p className="text-slate-500 mt-2">Please log in as an employer to view this dashboard.</p>
                <Link href="/auth/login" className="btn-primary mt-4 inline-block">Go to Login</Link>
            </div>
        );
    }

    const { jobs, totalApplications, activeJobs, pendingJobs } = await getEmployerData(session.user.id);

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div>
                <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">Employer Dashboard</h1>
                <p className="text-slate-500 mt-1">Manage your job postings and applicants</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Jobs Posted" value={jobs.length} icon={Briefcase} color="blue" />
                <StatsCard title="Active Jobs" value={activeJobs} icon={Eye} color="green" />
                <StatsCard title="Pending Review" value={pendingJobs} icon={Clock} color="amber" />
                <StatsCard title="Total Applications" value={totalApplications} icon={Users} color="purple" />
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl font-bold text-slate-900">My Job Postings</h2>
                    <Link href="/post-job" className="btn-primary text-sm flex items-center gap-2">
                        Post a New Job
                    </Link>
                </div>

                {jobs.length === 0 ? (
                    <div className="card p-12 text-center bg-white shadow-md border-none">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Briefcase size={28} className="text-slate-400" />
                        </div>
                        <h3 className="font-display text-xl font-semibold text-slate-900 mb-2">No jobs posted yet</h3>
                        <p className="text-slate-500 mb-6">Start your hiring journey by posting your first job opportunity</p>
                        <Link href="/post-job" className="btn-primary">Post a Job</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {jobs.map((job: any) => (
                            <div key={job._id} className="card p-6 bg-white hover:shadow-xl transition-all duration-300 group border-none">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-display font-bold text-xl text-slate-900 group-hover:text-ink-600 transition-colors">
                                            {job.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-0.5">{job.location} · {timeAgo(job.createdAt)}</p>
                                    </div>
                                    <span className={`badge ${job.status === 'approved' ? 'badge-green' : 'badge-yellow'}`}>
                                        {job.status}
                                    </span>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-ink-600">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium">Applications</p>
                                            <p className="text-lg font-bold text-slate-900">{job.applicationCount}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/employer/applicants/${job._id}`}
                                        className="text-sm font-semibold text-ink-600 hover:text-ink-800 flex items-center gap-1 transition-colors"
                                    >
                                        View Applicants <ArrowRight size={14} />
                                    </Link>
                                </div>

                                <div className="flex gap-2">
                                    <Link href={`/jobs/${job._id}`} className="btn-secondary text-sm flex-1 py-2 shadow-none border-slate-100 bg-slate-50 hover:bg-slate-100">
                                        View Posting
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
