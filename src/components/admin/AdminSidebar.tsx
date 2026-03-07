'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Users, CheckSquare, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/jobs', label: 'Manage Jobs', icon: Briefcase },
  { href: '/admin/applications', label: 'Manage Applications', icon: FileText },
  { href: '/admin/users', label: 'Manage Users', icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-60 flex-shrink-0">
      <div className="card p-2 lg:sticky lg:top-24">
        <div className="px-4 py-3 mb-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin Panel</span>
        </div>
        <nav className="space-y-0.5">
          {links.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active ? 'bg-ink-50 text-ink-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon size={17} /> {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
