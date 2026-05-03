import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Handle multipart/form-data
        const formData = await request.formData();
        const jobId = formData.get('jobId') as string;
        const coverLetter = formData.get('coverLetter') as string;
        const file = formData.get('file') as File | null;

        if (!jobId) {
            return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
        }

        let resumeUrl = '';

        // If a file is provided, upload it to Cloudinary
        if (file) {
            // Validation: Max size 5MB
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                return NextResponse.json({ error: 'File size too large. Maximum size is 5MB.' }, { status: 400 });
            }

            // Validation: Only allow PDF, DOC, DOCX
            const allowedExtensions = ['.pdf', '.doc', '.docx'];
            const fileName = file.name;
            const fileExtension = `.${fileName.split('.').pop()?.toLowerCase()}`;

            if (!allowedExtensions.includes(fileExtension)) {
                return NextResponse.json({ error: 'Invalid file type. Only PDF, DOC, and DOCX are allowed.' }, { status: 400 });
            }

            // Convert file to buffer for Cloudinary
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Upload to Cloudinary
            const uploadResult: any = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'resumes',
                        resource_type: 'auto', // As requested
                        public_id: `${Date.now()}_${fileName.replace(/\s+/g, '_').replace(/\.[^/.]+$/, '')}`,
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(buffer);
            });

            resumeUrl = uploadResult.secure_url;
        } else {
            // Fallback for cases where URL might be sent (though we prefer File now)
            resumeUrl = formData.get('resumeUrl') as string;
        }

        if (!resumeUrl) {
            return NextResponse.json({ error: 'Resume is required' }, { status: 400 });
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
            resume: resumeUrl,
            resumeUrl: resumeUrl,
            coverLetter,
            status: 'applied'
        });

        // Increment application count on job
        await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

        return NextResponse.json({ 
            message: 'Application submitted successfully', 
            application,
            url: resumeUrl // Return uploaded file URL as requested
        }, { status: 201 });

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
