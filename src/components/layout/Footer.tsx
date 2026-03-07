import Link from 'next/link';
import { Briefcase, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-ink-600 rounded-lg flex items-center justify-center">
                <Briefcase size={18} className="text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">TalentBridge</span>
            </Link>
            <p className="text-sm leading-relaxed mb-5">Connecting talent with opportunity. Your next great career move starts here.</p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-ink-600 flex items-center justify-center transition-colors">
                  <Icon size={16} className="text-slate-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">For Job Seekers</h4>
            <ul className="space-y-2 text-sm">
              {[['Browse Jobs', '/jobs'], ['Companies', '/companies'], ['Career Advice', '#'], ['Resume Tips', '#']].map(([label, href]) => (
                <li key={label}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">For Employers</h4>
            <ul className="space-y-2 text-sm">
              {[['Post a Job', '/auth/register?role=employer'], ['Employer Dashboard', '/employer'], ['Pricing', '#'], ['Talent Search', '#']].map(([label, href]) => (
                <li key={label}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {[['About Us', '#'], ['Blog', '#'], ['Privacy Policy', '#'], ['Terms of Service', '#']].map(([label, href]) => (
                <li key={label}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">© {new Date().getFullYear()} TalentBridge. All rights reserved.</p>
          <p className="text-xs text-slate-600">Built with Next.js, MongoDB &amp; Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}
