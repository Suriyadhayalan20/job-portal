import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Clock, Briefcase, TrendingUp, DollarSign, Calendar, Users, Building2, Globe, ArrowLeft, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/layout/Footer';
import ApplyButton from '@/components/ApplyButton';
import { formatDate, formatSalary, timeAgo } from '@/lib/utils';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';

import mongoose from 'mongoose';

async function getJob(id: string) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return { error: 'invalid_id' };
    }
    
    await dbConnect();
    const job = await Job.findById(id).populate('employer', 'name email company avatar').lean();
    
    if (!job) return null;
    if ((job as any).status !== 'approved') return { error: 'not_approved' };
    
    // Background update views (don't await to speed up page load)
    Job.findByIdAndUpdate(id, { $inc: { views: 1 } }).catch(console.error);
    
    return job;
  } catch (error) {
    console.error('Error fetching job:', error);
    return { error: 'db_error' };
  }
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const result = await getJob(params.id);
  
  if (!result || (result as any).error) {
    notFound();
  }

  const job = result as any;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job header */}
            <div className="card p-8">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  {job.company?.logo ? (
                    <img src={job.company.logo} alt={job.company.name} className="w-14 h-14 object-contain rounded-xl" />
                  ) : (
                    <span className="font-display text-2xl font-bold text-slate-500">{job.company?.name?.[0]}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="font-display text-2xl font-bold text-slate-900">{job.title}</h1>
                  <p className="text-lg text-slate-600 mt-1">{job.company?.name}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="badge badge-blue">{job.type}</span>
                    {job.isRemote && <span className="badge badge-green">Remote</span>}
                    <span className="badge badge-gray">{job.category}</span>
                    <span className="badge badge-purple">{job.experienceLevel}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                {[
                  { icon: MapPin, label: 'Location', value: job.location },
                  { icon: DollarSign, label: 'Salary', value: formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency) },
                  { icon: Clock, label: 'Posted', value: timeAgo(job.createdAt) },
                  { icon: Users, label: 'Applicants', value: `${job.applicationCount || 0} applied` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <Icon size={16} className="text-ink-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-sm font-medium text-slate-800">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="card p-8">
              <h2 className="font-display text-xl font-semibold text-slate-900 mb-4">Job Description</h2>
              <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <div className="card p-8">
                <h2 className="font-display text-xl font-semibold text-slate-900 mb-4">Responsibilities</h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle size={16} className="text-ink-500 mt-0.5 flex-shrink-0" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className="card p-8">
                <h2 className="font-display text-xl font-semibold text-slate-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div className="card p-8">
                <h2 className="font-display text-xl font-semibold text-slate-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: string) => (
                    <span key={skill} className="badge badge-blue text-sm px-3 py-1.5">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits?.length > 0 && (
              <div className="card p-8">
                <h2 className="font-display text-xl font-semibold text-slate-900 mb-4">Benefits & Perks</h2>
                <div className="grid grid-cols-2 gap-2">
                  {job.benefits.map((benefit: string) => (
                    <div key={benefit} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="text-amber-500">✦</span> {benefit}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Apply card */}
            <div className="card p-6 sticky top-20">
              <h3 className="font-display font-semibold text-slate-900 mb-2">Interested in this role?</h3>
              {job.applicationDeadline && (
                <p className="text-sm text-slate-500 mb-4 flex items-center gap-1.5">
                  <Calendar size={14} />
                  Apply by {formatDate(job.applicationDeadline)}
                </p>
              )}
              <ApplyButton jobId={job._id.toString()} jobTitle={job.title} />
            </div>

            {/* Company info */}
            <div className="card p-6">
              <h3 className="font-display font-semibold text-slate-900 mb-4">About the Company</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <span className="font-display text-lg font-bold text-slate-500">{job.company?.name?.[0]}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{job.company?.name}</p>
                  {job.company?.industry && <p className="text-xs text-slate-500">{job.company.industry}</p>}
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                {job.company?.size && (
                  <div className="flex items-center gap-2"><Building2 size={14} className="text-slate-400" /> {job.company.size} employees</div>
                )}
                {job.company?.website && (
                  <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-ink-600 hover:text-ink-800">
                    <Globe size={14} /> Visit website
                  </a>
                )}
              </div>
            </div>

            {/* Job overview */}
            <div className="card p-6">
              <h3 className="font-display font-semibold text-slate-900 mb-4">Job Overview</h3>
              <div className="space-y-3 text-sm">
                {[
                  { icon: Calendar, label: 'Date Posted', value: formatDate(job.createdAt) },
                  { icon: TrendingUp, label: 'Experience', value: job.experienceLevel },
                  { icon: Briefcase, label: 'Job Type', value: job.type },
                  { icon: MapPin, label: 'Location', value: job.location },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-ink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-ink-600" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">{label}</p>
                      <p className="text-slate-800 font-medium">{value}</p>
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
