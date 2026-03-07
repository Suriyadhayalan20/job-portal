'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Briefcase, Menu, X, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const { data: session } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Updated dashboard links based on structural changes
    const dashboardHref = session?.user.role === 'admin'
        ? '/admin'
        : session?.user.role === 'employer'
            ? '/employer/dashboard'
            : '/jobs';

    return (
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 bg-ink-600 rounded-lg flex items-center justify-center group-hover:bg-ink-700 transition-colors">
                            <Briefcase size={18} className="text-white" />
                        </div>
                        <span className="font-display text-xl font-bold text-slate-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-ink-700 to-purple-700">TalentBridge</span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link href="/jobs" className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                            Browse Jobs
                        </Link>
                        {session && (
                            <Link href="/post-job" className="btn-primary text-sm py-2 px-4 ml-2 bg-gradient-to-r from-ink-600 to-purple-600 hover:from-ink-700 hover:to-purple-700 border-none shadow-sm transition-all duration-200 hover:shadow-md">
                                Post Job
                            </Link>
                        )}
                    </div>

                    {/* Auth */}
                    <div className="hidden md:flex items-center gap-3">
                        {session ? (
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors"
                                >
                                    <div className="w-8 h-8 bg-ink-100 rounded-full flex items-center justify-center border border-ink-100">
                                        <span className="text-ink-700 text-sm font-semibold">{session.user.name?.[0]?.toUpperCase()}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 max-w-[120px] truncate">{session.user.name}</span>
                                    <ChevronDown size={14} className={cn('text-slate-500 transition-transform duration-300', dropdownOpen && 'rotate-180')} />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 animate-slide-up ring-4 ring-black/5">
                                        <div className="px-4 py-2 border-b border-slate-50 mb-1">
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Signed in as</p>
                                            <p className="text-sm font-bold text-slate-900 truncate">{session.user.email}</p>
                                        </div>
                                        <Link href={dashboardHref} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-ink-50 hover:text-ink-700 transition-colors">
                                            <LayoutDashboard size={16} /> Dashboard
                                        </Link>
                                        <Link href={`/profile`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-ink-50 hover:text-ink-700 transition-colors">
                                            <User size={16} /> My Profile
                                        </Link>
                                        <div className="border-t border-slate-50 my-2" />
                                        <button
                                            onClick={() => { signOut({ callbackUrl: '/' }); setDropdownOpen(false); }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut size={16} /> Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Link href="/auth/login" className="btn-secondary text-sm py-2 px-5 font-bold">Sign in</Link>
                                <Link href="/auth/register" className="btn-primary text-sm py-2 px-5 font-bold shadow-lg shadow-ink-200">Get started</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu Toggle */}
                    <button className="md:hidden p-2 rounded-xl bg-slate-50 border border-slate-100" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X size={20} className="text-red-500" /> : <Menu size={20} className="text-slate-600" />}
                    </button>
                </div>

                {/* Mobile dropdown */}
                {menuOpen && (
                    <div className="md:hidden border-t border-slate-100 py-6 space-y-4 animate-slide-up">
                        <div className="space-y-1">
                            <Link href="/jobs" className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl text-base font-medium" onClick={() => setMenuOpen(false)}>
                                <Briefcase size={20} /> Browse Jobs
                            </Link>
                            {session && (
                                <>
                                    <Link href={dashboardHref} className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl text-base font-medium" onClick={() => setMenuOpen(false)}>
                                        <LayoutDashboard size={20} /> Dashboard
                                    </Link>
                                    <Link href="/post-job" className="flex items-center gap-3 px-4 py-3 text-ink-700 font-bold bg-ink-50 rounded-xl text-base" onClick={() => setMenuOpen(false)}>
                                        Post a Job
                                    </Link>
                                </>
                            )}
                        </div>

                        {session ? (
                            <div className="pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-base font-bold"
                                >
                                    <LogOut size={20} /> Sign out
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 px-2 pt-2">
                                <Link href="/auth/login" className="btn-secondary text-center py-3 font-bold" onClick={() => setMenuOpen(false)}>Sign in</Link>
                                <Link href="/auth/register" className="btn-primary text-center py-3 font-bold" onClick={() => setMenuOpen(false)}>Register</Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
