import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ArrowLeft, Mail, MapPin, FileText, ExternalLink, Calendar, MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import Application from '@/models/Application';
import { formatDate, fixResumeUrl } from '@/lib/utils';

async function getData(jobId: string, employerId: string) {
  await dbConnect();
  const job = await Job.findOne({ _id: jobId, employer: employerId }).lean();
  if (!job) return null;

  const applications = await Application.find({ jobId })
    .populate('userId', 'name email avatar')
    .sort({ createdAt: -1 })
    .lean();

  return { job, applications };
}

const statusColors: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-700',
  reviewed: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  accepted: 'bg-emerald-100 text-emerald-700',
};

export default async function ApplicantsPage({ params }: { params: { jobId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'employer') {
    redirect('/auth/login');
  }

  const data = await getData(params.jobId, session.user.id);
  if (!data) notFound();

  const { job, applications } = data as any;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      <Link href="/employer/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-ink-600 transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">{job.title}</h1>
          <div className="flex items-center gap-2 text-slate-500 mt-2">
            <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full mx-1"></span>
            <span>{applications.length} applicant{applications.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <Link href={`/jobs/${job._id}`} target="_blank" className="btn-secondary text-sm flex items-center gap-2 py-2 px-4 shadow-sm border-slate-200">
          View Posting <ExternalLink size={14} />
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="card p-16 text-center bg-white border-2 border-dashed border-slate-200 shadow-none">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Users size={32} className="text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No applicants yet</h2>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto">Applications will appear here as candidates follow your posting.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {applications.map((app: any) => (
            <div key={app._id} className="card p-0 bg-white border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col md:flex-row">
                {/* Applicant Info Side */}
                <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-ink-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md">
                      {app.userId?.name?.[0] || '?'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{app.userId?.name || 'Unknown Applicant'}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5"><Mail size={12} /> {app.userId?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-1.5"><Calendar size={14} /> Applied on</span>
                      <span className="font-medium text-slate-900">{formatDate(app.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-1.5"><FileText size={14} /> Resume</span>
                      <a href={fixResumeUrl(app.resume || app.resumeUrl)} target="_blank" rel="noopener noreferrer" className="text-ink-600 font-bold hover:underline flex items-center gap-1">
                        View <ExternalLink size={12} />
                      </a>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[app.status] || 'bg-slate-100 text-slate-600'}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 uppercase tracking-tight">
                      <MessageSquare size={14} className="text-ink-600" /> Cover Letter
                    </h4>
                    <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 border-dashed max-h-[160px] overflow-y-auto whitespace-pre-wrap">
                      {app.coverLetter || "No cover letter provided."}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button className="flex-1 btn-secondary text-sm py-2 bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100">Shortlist</button>
                    <button className="flex-1 btn-secondary text-sm py-2 bg-red-50 text-red-700 border-red-100 hover:bg-red-100">Reject</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
