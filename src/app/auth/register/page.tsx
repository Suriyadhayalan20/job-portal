'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/Spinner';

import { Suspense } from 'react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') as 'jobseeker' | 'employer' || 'jobseeker';

  const [role, setRole] = useState<'jobseeker' | 'employer'>(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    companyName: '', companyWebsite: '', companySize: '', companyIndustry: '',
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (role === 'employer' && !form.companyName) { toast.error('Company name is required'); return; }

    setLoading(true);
    try {
      const payload: any = { name: form.name, email: form.email, password: form.password, role };
      if (role === 'employer') {
        payload.company = {
          name: form.companyName,
          website: form.companyWebsite,
          size: form.companySize,
          industry: form.companyIndustry,
        };
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Account created! Please sign in.');
      router.push('/auth/login');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-ink-950 to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 60%, #5061ff33 0%, transparent 60%)' }} />
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-ink-600 rounded-xl flex items-center justify-center">
            <Briefcase size={22} className="text-white" />
          </div>
          <span className="font-display text-2xl font-bold">TalentBridge</span>
        </Link>
        <div className="relative z-10">
          <h2 className="font-display text-4xl font-bold leading-tight mb-4">
            {role === 'employer' ? 'Find the talent\nyou need' : 'Kick-start your\ncareer journey'}
          </h2>
          <p className="text-slate-400 text-lg">
            {role === 'employer'
              ? 'Post jobs and connect with qualified candidates instantly.'
              : 'Join thousands of professionals finding their dream jobs.'}
          </p>
        </div>
        <p className="text-slate-600 text-sm relative z-10">© 2024 TalentBridge</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-ink-600 rounded-lg flex items-center justify-center">
                <Briefcase size={20} className="text-white" />
              </div>
              <span className="font-display text-2xl font-bold text-slate-900">TalentBridge</span>
            </Link>
          </div>

          <div className="card p-8">
            <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
            <p className="text-slate-500 text-sm mb-6">Join TalentBridge today — it&apos;s free</p>

            {/* Role selector */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
              {(['jobseeker', 'employer'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === r ? 'bg-white text-ink-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {r === 'jobseeker' ? '👤 Job Seeker' : '🏢 Employer'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full name</label>
                  <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} required placeholder="John Doe" className="input-field" />
                </div>
                <div>
                  <label className="label">Email address</label>
                  <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required placeholder="john@example.com" className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      required placeholder="Min. 6 characters"
                      className="input-field pr-11"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm password</label>
                  <input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required placeholder="Re-enter password" className="input-field" />
                </div>
              </div>

              {role === 'employer' && (
                <div className="space-y-4 border-t border-slate-100 pt-4 mt-4">
                  <p className="text-sm font-medium text-slate-700">Company Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Company name *</label>
                      <input value={form.companyName} onChange={(e) => update('companyName', e.target.value)} placeholder="Acme Corp" className="input-field" />
                    </div>
                    <div>
                      <label className="label">Website</label>
                      <input value={form.companyWebsite} onChange={(e) => update('companyWebsite', e.target.value)} placeholder="https://acme.com" className="input-field" />
                    </div>
                    <div>
                      <label className="label">Company size</label>
                      <select value={form.companySize} onChange={(e) => update('companySize', e.target.value)} className="input-field">
                        <option value="">Select size</option>
                        {['1-10', '11-50', '51-200', '201-500', '500+'].map((s) => <option key={s} value={s}>{s} employees</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Industry</label>
                      <input value={form.companyIndustry} onChange={(e) => update('companyIndustry', e.target.value)} placeholder="e.g. Technology" className="input-field" />
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
                {loading ? <Spinner size="sm" /> : <UserPlus size={18} />}
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-ink-600 font-semibold hover:text-ink-800">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Spinner size="lg" /></div>}>
      <RegisterContent />
    </Suspense>
  );
}
