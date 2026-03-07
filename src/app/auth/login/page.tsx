'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/Spinner';

import { Suspense } from 'react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Welcome back!');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-ink-950 to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #5061ff33 0%, transparent 60%)' }} />
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-ink-600 rounded-xl flex items-center justify-center">
            <Briefcase size={22} className="text-white" />
          </div>
          <span className="font-display text-2xl font-bold">TalentBridge</span>
        </Link>

        <div className="relative z-10">
          <h2 className="font-display text-4xl font-bold leading-tight mb-4">
            Your next career move<br />starts here
          </h2>
          <p className="text-slate-400 text-lg">Access thousands of opportunities from world-class companies.</p>
          <div className="mt-10 space-y-4">
            {['10,000+ active job listings', 'Top companies hiring now', 'One-click applications'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-slate-300">
                <div className="w-6 h-6 rounded-full bg-ink-600 flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-sm relative z-10">© 2024 TalentBridge</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-ink-600 rounded-lg flex items-center justify-center">
                <Briefcase size={20} className="text-white" />
              </div>
              <span className="font-display text-2xl font-bold text-slate-900">TalentBridge</span>
            </Link>
          </div>

          <div className="card p-8">
            <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
            <p className="text-slate-500 text-sm mb-8">Sign in to your account to continue</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
                {error === 'CredentialsSignin' ? 'Invalid email or password' : error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="input-field"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="label mb-0">Password</label>
                  <a href="#" className="text-xs text-ink-600 hover:text-ink-800">Forgot password?</a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="input-field pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                {loading ? <Spinner size="sm" /> : <LogIn size={18} />}
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-ink-600 font-semibold hover:text-ink-800">Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Spinner size="lg" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
