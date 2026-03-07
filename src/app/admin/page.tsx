import { Briefcase, Users, Clock, CheckCircle } from 'lucide-react';
import StatsCard from '@/components/ui/StatsCard';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import User from '@/models/User';
import Application from '@/models/Application';
import { timeAgo } from '@/lib/utils';

async function getAdminStats() {
  await dbConnect();
  const [totalJobs, pendingJobs, approvedJobs, totalUsers, totalApplications, recentJobs] = await Promise.all([
    Job.countDocuments(),
    Job.countDocuments({ status: 'pending' }),
    Job.countDocuments({ status: 'approved' }),
    User.countDocuments(),
    Application.countDocuments(),
    Job.find({ status: 'pending' }).populate('employer', 'name email').sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  return { totalJobs, pendingJobs, approvedJobs, totalUsers, totalApplications, recentJobs };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Jobs" value={stats.totalJobs} icon={Briefcase} color="blue" />
        <StatsCard title="Pending Approval" value={stats.pendingJobs} icon={Clock} color="amber" subtitle="Needs review" />
        <StatsCard title="Active Jobs" value={stats.approvedJobs} icon={CheckCircle} color="green" />
        <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} color="purple" />
      </div>

      {/* Pending jobs */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Pending Job Approvals
            {stats.pendingJobs > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{stats.pendingJobs}</span>
            )}
          </h2>
          <Link href="/admin/jobs?status=pending" className="text-sm text-ink-600 hover:text-ink-800 font-medium">View all →</Link>
        </div>

        {stats.recentJobs.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
            <p>All caught up! No pending jobs to review.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentJobs.map((job: any) => (
              <div key={job._id} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <div>
                  <p className="font-medium text-slate-900">{job.title}</p>
                  <p className="text-sm text-slate-500">by {job.employer?.name} · {timeAgo(job.createdAt)}</p>
                </div>
                <Link href="/admin/jobs?status=pending" className="btn-primary text-sm py-1.5 px-4">Review</Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/admin/jobs?status=pending" className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl group transition-colors">
              <span className="text-sm font-medium text-slate-700">Review pending jobs</span>
              <span className="badge badge-yellow">{stats.pendingJobs} pending</span>
            </Link>
            <Link href="/admin/users" className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl group transition-colors">
              <span className="text-sm font-medium text-slate-700">Manage users</span>
              <span className="badge badge-blue">{stats.totalUsers} users</span>
            </Link>
            <Link href="/admin/jobs" className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl group transition-colors">
              <span className="text-sm font-medium text-slate-700">All job listings</span>
              <span className="badge badge-gray">{stats.totalJobs} total</span>
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-slate-900 mb-4">Platform Stats</h2>
          <div className="space-y-3">
            {[
              { label: 'Total Applications', value: stats.totalApplications, color: 'bg-ink-400' },
              { label: 'Approval Rate', value: `${stats.totalJobs ? Math.round((stats.approvedJobs / stats.totalJobs) * 100) : 0}%`, color: 'bg-emerald-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-sm text-slate-600">{label}</span>
                </div>
                <span className="font-semibold text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
