import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Users, Eye } from 'lucide-react';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import { timeAgo, formatSalary } from '@/lib/utils';
import EmployerJobActions from '@/components/employer/EmployerJobActions';

async function getEmployerJobs(employerId: string) {
  await dbConnect();
  return Job.find({ employer: employerId }).sort({ createdAt: -1 }).lean();
}

export default async function EmployerJobsPage() {
  const session = await getServerSession(authOptions);
  const jobs = await getEmployerJobs(session!.user.id);

  const statusColors: Record<string, string> = {
    approved: 'badge-green', pending: 'badge-yellow', rejected: 'badge-red', closed: 'badge-gray',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">My Job Postings</h1>
          <p className="text-slate-500 mt-1">{jobs.length} total jobs</p>
        </div>
        <Link href="/employer/jobs/new" className="btn-primary flex items-center gap-2">
          <PlusCircle size={18} /> Post New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PlusCircle size={28} className="text-slate-400" />
          </div>
          <h3 className="font-display text-xl font-semibold text-slate-900 mb-2">No jobs yet</h3>
          <p className="text-slate-500 mb-6">Post your first job to start attracting candidates</p>
          <Link href="/employer/jobs/new" className="btn-primary inline-flex">Post a Job</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job: any) => (
            <div key={job._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-display font-semibold text-slate-900">{job.title}</h3>
                    <span className={statusColors[job.status] || 'badge-gray'}>{job.status}</span>
                    {job.featured && <span className="badge badge-yellow">⭐ Featured</span>}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                    <span>{job.location}</span>
                    <span>{job.type}</span>
                    {(job.salary?.min || job.salary?.max) && (
                      <span className="text-emerald-600 font-medium">
                        {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                      </span>
                    )}
                    <span>Posted {timeAgo(job.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Eye size={14} /> {job.views || 0}
                  </div>
                  <Link href={`/employer/applicants/${job._id}`} className="flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-800 font-medium">
                    <Users size={14} /> {job.applicationCount || 0}
                  </Link>
                  <Link href={`/employer/jobs/${job._id}/edit`} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-700 transition-colors">
                    <Edit size={16} />
                  </Link>
                  <EmployerJobActions jobId={job._id.toString()} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
