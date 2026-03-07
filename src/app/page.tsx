import Link from 'next/link';
import { Briefcase, Users, Building2, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/layout/Footer';
import SearchBar from '@/components/jobs/SearchBar';
import JobCard from '@/components/JobCard';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

async function getStats() {
  try {
    await dbConnect();
    const [jobCount, userCount, employerCount] = await Promise.all([
      Job.countDocuments({ status: 'approved' }),
      User.countDocuments({ role: 'jobseeker' }),
      User.countDocuments({ role: 'employer' }),
    ]);
    return { jobCount, userCount, employerCount };
  } catch {
    return { jobCount: 0, userCount: 0, employerCount: 0 };
  }
}

async function getFeaturedJobs() {
  try {
    await dbConnect();
    return await Job.find({ status: 'approved' })
      .sort({ featured: -1, createdAt: -1 })
      .limit(6)
      .lean();
  } catch {
    return [];
  }
}

const CATEGORIES = [
  { name: 'Technology', icon: '💻', count: '2,400+' },
  { name: 'Design', icon: '🎨', count: '890+' },
  { name: 'Marketing', icon: '📈', count: '1,200+' },
  { name: 'Finance', icon: '💰', count: '760+' },
  { name: 'Healthcare', icon: '🏥', count: '930+' },
  { name: 'Education', icon: '📚', count: '450+' },
];

export default async function HomePage() {
  const [stats, featuredJobs] = await Promise.all([getStats(), getFeaturedJobs()]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-ink-950 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #5061ff22 0%, transparent 50%), radial-gradient(circle at 80% 20%, #7a91ff11 0%, transparent 40%)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-ink-600/20 text-ink-300 text-sm px-4 py-1.5 rounded-full border border-ink-500/30 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {stats.jobCount.toLocaleString()}+ active jobs available
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-ink-400 to-purple-400">Dream Job</span> Today
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
              Connect with top companies. Discover opportunities that match your skills and ambitions.
            </p>
            <SearchBar className="max-w-2xl mx-auto" />

            <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-slate-400">
              {['Remote', 'Full-time', 'Internship', 'Contract'].map((tag) => (
                <Link key={tag} href={`/jobs?type=${tag}`} className="hover:text-ink-300 transition-colors flex items-center gap-1">
                  <ArrowRight size={12} /> {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Briefcase, label: 'Active Jobs', value: stats.jobCount.toLocaleString() + '+', color: 'text-ink-600' },
            { icon: Users, label: 'Job Seekers', value: stats.userCount.toLocaleString() + '+', color: 'text-emerald-600' },
            { icon: Building2, label: 'Companies', value: stats.employerCount.toLocaleString() + '+', color: 'text-purple-600' },
            { icon: TrendingUp, label: 'Placements', value: '95%', color: 'text-amber-600' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card p-6 text-center">
              <Icon size={24} className={`${color} mx-auto mb-2`} />
              <div className="font-display text-2xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-slate-900">Browse by Category</h2>
          <p className="text-slate-500 mt-2">Explore opportunities across industries</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(({ name, icon, count }) => (
            <Link key={name} href={`/jobs?category=${name}`}
              className="card p-5 text-center hover:border-ink-200 hover:ring-2 hover:ring-ink-100 group cursor-pointer"
            >
              <div className="text-3xl mb-2">{icon}</div>
              <div className="font-medium text-slate-800 text-sm group-hover:text-ink-700">{name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{count} jobs</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <section className="bg-slate-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl font-bold text-slate-900">Latest Opportunities</h2>
                <p className="text-slate-500 mt-2">Hand-picked jobs from top employers</p>
              </div>
              <Link href="/jobs" className="btn-outline hidden sm:flex items-center gap-2 text-sm py-2">
                View all jobs <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredJobs.map((job: any) => <JobCard key={job._id} job={job} />)}
            </div>
            <div className="text-center mt-10 sm:hidden">
              <Link href="/jobs" className="btn-primary inline-flex items-center gap-2">View all jobs <ArrowRight size={14} /></Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-8 bg-ink-600 text-white border-none">
            <h3 className="font-display text-2xl font-bold mb-3">Looking for a Job?</h3>
            <p className="text-ink-200 mb-6">Create your profile, upload your resume, and start applying to thousands of jobs.</p>
            <ul className="space-y-2 mb-8">
              {['Free to use', 'Apply with one click', 'Track your applications'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-ink-100">
                  <CheckCircle size={16} className="text-ink-300" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/auth/register" className="inline-flex bg-white text-ink-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-ink-50 transition-colors">
              Get started free
            </Link>
          </div>

          <div className="card p-8 bg-slate-900 text-white border-none">
            <h3 className="font-display text-2xl font-bold mb-3">Hiring Talent?</h3>
            <p className="text-slate-400 mb-6">Post your jobs and reach thousands of qualified candidates in your industry.</p>
            <ul className="space-y-2 mb-8">
              {['Reach 10,000+ candidates', 'Easy applicant management', 'Quick approval process'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle size={16} className="text-emerald-400" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/auth/register?role=employer" className="inline-flex bg-ink-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-ink-700 transition-colors">
              Post a job today
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
