import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/layout/Footer';
import JobCard from '@/components/JobCard';
import SearchBar from '@/components/jobs/SearchBar';
import { LoadingPage } from '@/components/ui/Spinner';
import { Briefcase } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  searchParams: {
    search?: string;
    category?: string;
    type?: string;
    location?: string;
    experienceLevel?: string;
    page?: string;
  };
}

async function getJobs(params: PageProps['searchParams']) {
  try {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category) query.set('category', params.category);
    if (params.type) query.set('type', params.type);
    if (params.location) query.set('location', params.location);
    if (params.experienceLevel) query.set('experienceLevel', params.experienceLevel);
    query.set('page', params.page || '1');
    query.set('limit', '12');

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/jobs?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) return { jobs: [], pagination: null };
    return res.json();
  } catch {
    return { jobs: [], pagination: null };
  }
}

export default async function JobsPage({ searchParams }: PageProps) {
  const { jobs, pagination } = await getJobs(searchParams);
  const currentPage = parseInt(searchParams.page || '1');

  const activeFilters = [
    searchParams.search && `"${searchParams.search}"`,
    searchParams.category,
    searchParams.type,
    searchParams.location && `in ${searchParams.location}`,
    searchParams.experienceLevel,
  ].filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-ink-950 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold mb-2">Browse All Jobs</h1>
          <p className="text-slate-400 mb-8">
            {pagination?.total ? `${pagination.total.toLocaleString()} opportunities available` : 'Find your perfect role'}
          </p>
          <SearchBar showFilters className="max-w-4xl" />
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-slate-500">Showing results for:</span>
            {activeFilters.map((f) => (
              <span key={f} className="badge badge-blue">{f}</span>
            ))}
            <Link href="/jobs" className="text-sm text-red-500 hover:text-red-700 ml-2">Clear all</Link>
          </div>
        )}

        <Suspense fallback={<LoadingPage />}>
          {jobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {jobs.map((job: any) => <JobCard key={job._id} job={job} />)}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {currentPage > 1 && (
                    <Link href={`/jobs?${new URLSearchParams({ ...searchParams, page: String(currentPage - 1) })}`}
                      className="btn-secondary py-2 px-4 text-sm">← Prev</Link>
                  )}
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map((p) => (
                    <Link key={p} href={`/jobs?${new URLSearchParams({ ...searchParams, page: String(p) })}`}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${p === currentPage ? 'bg-ink-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                      {p}
                    </Link>
                  ))}
                  {currentPage < pagination.pages && (
                    <Link href={`/jobs?${new URLSearchParams({ ...searchParams, page: String(currentPage + 1) })}`}
                      className="btn-secondary py-2 px-4 text-sm">Next →</Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase size={28} className="text-slate-400" />
              </div>
              <h3 className="font-display text-xl font-semibold text-slate-900 mb-2">No jobs found</h3>
              <p className="text-slate-500 mb-6">Try adjusting your search or filters</p>
              <Link href="/jobs" className="btn-primary">Clear search</Link>
            </div>
          )}
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
