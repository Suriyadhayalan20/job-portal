import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Briefcase, Users, Eye, Clock } from 'lucide-react';
import StatsCard from '@/components/ui/StatsCard';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import Application from '@/models/Application';
import { timeAgo } from '@/lib/utils';

async function getEmployerStats(employerId: string) {
  await dbConnect();
  const [totalJobs, activeJobs, pendingJobs, totalApplications, recentJobs] = await Promise.all([
    Job.countDocuments({ employer: employerId }),
    Job.countDocuments({ employer: employerId, status: 'approved' }),
    Job.countDocuments({ employer: employerId, status: 'pending' }),
    Application.countDocuments({ employer: employerId }),
    Job.find({ employer: employerId }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  return { totalJobs, activeJobs, pendingJobs, totalApplications, recentJobs };
}

export default async function EmployerDashboard() {
  const session = await getServerSession(authOptions);
  const stats = await getEmployerStats(session!.user.id);

  const statusColors: Record<string, string> = {
    approved: 'badge-green', pending: 'badge-yellow', rejected: 'badge-red', closed: 'badge-gray',
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Employer Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {session?.user.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Jobs" value={stats.totalJobs} icon={Briefcase} color="blue" />
        <StatsCard title="Active Jobs" value={stats.activeJobs} icon={Eye} color="green" />
        <StatsCard title="Pending Review" value={stats.pendingJobs} icon={Clock} color="amber" />
        <StatsCard title="Applications" value={stats.totalApplications} icon={Users} color="purple" />
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-slate-900">Recent Job Postings</h2>
          <Link href="/employer/jobs" className="text-sm text-ink-600 hover:text-ink-800 font-medium">View all →</Link>
        </div>

        {stats.recentJobs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 mb-4">No jobs posted yet</p>
            <Link href="/employer/jobs/new" className="btn-primary text-sm">Post your first job</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentJobs.map((job: any) => (
              <div key={job._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{job.title}</p>
                  <p className="text-sm text-slate-500">{job.location} · {timeAgo(job.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={statusColors[job.status] || 'badge-gray'}>{job.status}</span>
                  <div className="text-sm text-slate-500 flex items-center gap-1">
                    <Users size={14} /> {job.applicationCount || 0}
                  </div>
                  <Link href={`/employer/applicants/${job._id}`} className="text-ink-600 hover:text-ink-800 text-sm font-medium">View →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-6 bg-gradient-to-r from-ink-600 to-ink-700 text-white border-none">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold">Ready to find talent?</h3>
            <p className="text-ink-200 text-sm mt-1">Post a new job and reach thousands of qualified candidates</p>
          </div>
          <Link href="/employer/jobs/new" className="bg-white text-ink-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-ink-50 transition-colors text-sm flex-shrink-0">
            Post a Job
          </Link>
        </div>
      </div>
    </div>
  );
}
