'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, Briefcase, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/employer', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/employer/jobs', label: 'My Jobs', icon: Briefcase },
  { href: '/employer/jobs/new', label: 'Post New Job', icon: PlusCircle },
];

export default function EmployerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-60 flex-shrink-0">
      <div className="card p-2 lg:sticky lg:top-24">
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
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
