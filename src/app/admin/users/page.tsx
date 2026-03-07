import dbConnect from '@/lib/db';
import User from '@/models/User';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import AdminUserActions from '@/components/admin/AdminUserActions';

async function getUsers(role?: string) {
  await dbConnect();
  const query: any = {};
  if (role) query.role = role;
  return User.find(query).select('-password').sort({ createdAt: -1 }).limit(100).lean();
}

const roleColors: Record<string, string> = {
  admin: 'badge-purple', employer: 'badge-blue', jobseeker: 'badge-green',
};

export default async function AdminUsersPage({ searchParams }: { searchParams: { role?: string } }) {
  const users = await getUsers(searchParams.role);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Manage Users</h1>
        <p className="text-slate-500 mt-1">{users.length} users found</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[['', 'All Users'], ['jobseeker', 'Job Seekers'], ['employer', 'Employers'], ['admin', 'Admins']].map(([val, label]) => (
          <Link key={val}
            href={val ? `/admin/users?role=${val}` : '/admin/users'}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${(searchParams.role || '') === val ? 'bg-ink-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['User', 'Role', 'Joined', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user: any) => (
                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-ink-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-ink-700 text-sm font-semibold">{user.name?.[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={roleColors[user.role] || 'badge-gray'}>{user.role}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-4">
                    <span className={user.isActive ? 'badge-green' : 'badge-red'}>{user.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <AdminUserActions userId={user._id.toString()} isActive={user.isActive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
