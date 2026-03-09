import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { jobId, resume, resumeUrl, coverLetter } = body;
        const finalResume = resume || resumeUrl;

        if (!jobId || !finalResume) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // Check if job exists and is approved
        const job = await Job.findById(jobId);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }
        if (job.status !== 'approved') {
            return NextResponse.json({ error: 'Job is not available for applications' }, { status: 400 });
        }

        // Check if user already applied
        const existingApplication = await Application.findOne({ jobId, userId: session.user.id });
        if (existingApplication) {
            return NextResponse.json({ error: 'You have already applied for this job' }, { status: 409 });
        }

        const application = await Application.create({
            jobId,
            userId: session.user.id,
            employer: job.employer,
            resume: finalResume,
            resumeUrl: finalResume, // Store in both for now
            coverLetter,
            status: 'applied'
        });

        // Increment application count on job
        await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

        return NextResponse.json({ message: 'Application submitted successfully', application }, { status: 201 });
    } catch (error: any) {
        console.error('Application Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');

        let query: any = {};
        if (jobId) {
            const job = await Job.findById(jobId);
            if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

            if (job.employer.toString() !== session.user.id && session.user.role !== 'admin') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            query.jobId = jobId;
        } else if (session.user.role !== 'admin') {
            // Only filter by userId if NOT an admin
            query.userId = session.user.id;
        }

        const applications = await Application.find(query)
            .populate('jobId', 'title company location')
            .populate('userId', 'name email avatar')
            .sort({ createdAt: -1 });

        return NextResponse.json({ applications });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
