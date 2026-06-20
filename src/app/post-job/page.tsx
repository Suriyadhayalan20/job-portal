'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Briefcase } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/layout/Footer';
import { Spinner } from '@/components/ui/Spinner';

export default function PostJobPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        category: 'Technology',
        jobType: 'Full-time',
        salary: '',
        experience: 'Entry Level',
        description: '',
        skills: '',
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/post-job');
        }
    }, [status, router]);

    if (status === 'loading' || status === 'unauthenticated') return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/jobs', {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                const errorMessage = data.details ? data.details.join(', ') : (data.error || 'Failed to post job');
                throw new Error(errorMessage);
            }

            toast.success('Job posted successfully!');
            router.push('/jobs');
        } catch (error: any) {
            console.error('Submission error:', error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-slate-900 to-ink-950 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="font-display text-4xl font-bold mb-4">Post a New Job</h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Reach thousands of qualified candidates and find the perfect fit for your team.
                    </p>
                </div>
            </div>

            {/* Form Section */}
            <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20 w-full">
                <div className="card p-8 shadow-xl border-none">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Job Title */}
                            <div className="md:col-span-2">
                                <label htmlFor="title" className="label">Job Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Senior Frontend Engineer"
                                    className="input-field"
                                />
                            </div>

                            {/* Company Name */}
                            <div>
                                <label htmlFor="company" className="label">Company Name</label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    required
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder="Your Company"
                                    className="input-field"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label htmlFor="location" className="label">Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    required
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Remote, New York, NY"
                                    className="input-field"
                                />
                            </div>

                            {/* Job Type */}
                            <div>
                                <label htmlFor="jobType" className="label">Job Type</label>
                                <select
                                    id="jobType"
                                    name="jobType"
                                    required
                                    value={formData.jobType}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Contract">Contract</option>
                                </select>
                            </div>

                            {/* Category */}
                            <div>
                                <label htmlFor="category" className="label">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    {['Technology', 'Design', 'Marketing', 'Sales', 'Finance', 'Healthcare', 'Education', 'Engineering', 'Other'].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Experience Level */}
                            <div>
                                <label htmlFor="experience" className="label">Experience Level</label>
                                <select
                                    id="experience"
                                    name="experience"
                                    required
                                    value={formData.experience}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="Entry Level">Entry Level</option>
                                    <option value="Mid Level">Mid Level</option>
                                    <option value="Senior Level">Senior Level</option>
                                    <option value="Lead">Lead</option>
                                    <option value="Executive">Executive</option>
                                </select>
                            </div>

                            {/* Salary Range */}
                            <div className="md:col-span-2">
                                <label htmlFor="salary" className="label">Salary Range</label>
                                <input
                                    type="text"
                                    id="salary"
                                    name="salary"
                                    required
                                    value={formData.salary}
                                    onChange={handleChange}
                                    placeholder="e.g. $80,000 - $120,000"
                                    className="input-field"
                                />
                            </div>

                            {/* Job Description */}
                            <div className="md:col-span-2">
                                <label htmlFor="description" className="label">Job Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    required
                                    rows={6}
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Provide a detailed description of the role and responsibilities..."
                                    className="input-field resize-none"
                                />
                            </div>

                            {/* Skills */}
                            <div className="md:col-span-2">
                                <label htmlFor="skills" className="label">Skills</label>
                                <input
                                    type="text"
                                    id="skills"
                                    name="skills"
                                    required
                                    value={formData.skills}
                                    onChange={handleChange}
                                    placeholder="e.g. React, TypeScript, Node.js (comma separated)"
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-4 text-lg bg-gradient-to-r from-ink-600 to-purple-600 hover:from-ink-700 hover:to-purple-700 border-none flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Spinner size="sm" />
                                ) : (
                                    <>
                                        <Briefcase size={20} />
                                        Post Job
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
