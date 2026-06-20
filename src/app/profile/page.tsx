import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Navbar from '@/components/Navbar';
import Footer from '@/components/layout/Footer';
import { User as UserIcon, Mail, Phone, MapPin, FileText, Briefcase } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login');

  await dbConnect();
  const user = await User.findById(session.user.id).lean() as any;
  if (!user) redirect('/auth/login');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <h1 className="font-display text-3xl font-bold text-slate-900">My Profile</h1>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-ink-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-ink-100 text-ink-700 rounded-full">
                {user.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail size={15} className="text-slate-400" />
              {user.email}
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={15} className="text-slate-400" />
                {user.phone}
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin size={15} className="text-slate-400" />
                {user.location}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <UserIcon size={15} className="text-slate-400" />
              Member since {formatDate(user.createdAt)}
            </div>
          </div>

          {user.bio && (
            <p className="text-sm text-slate-600 border-t border-slate-100 pt-4">{user.bio}</p>
          )}
        </div>

        {/* Resume (job seekers) */}
        {user.role === 'jobseeker' && user.resume && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-ink-600" /> Resume
            </h3>
            <a
              href={user.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-600 hover:underline text-sm font-medium"
            >
              View Resume
            </a>
          </div>
        )}

        {/* Company info (employers) */}
        {user.role === 'employer' && user.company?.name && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Briefcase size={16} className="text-ink-600" /> Company
            </h3>
            <p className="font-semibold text-slate-900">{user.company.name}</p>
            {user.company.industry && (
              <p className="text-sm text-slate-500">{user.company.industry}</p>
            )}
            {user.company.website && (
              <a href={user.company.website} target="_blank" rel="noopener noreferrer" className="text-ink-600 hover:underline text-sm">
                {user.company.website}
              </a>
            )}
            {user.company.description && (
              <p className="text-sm text-slate-600 pt-2 border-t border-slate-100">{user.company.description}</p>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
