import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';

/**
 * Robust Application API:
 * Handles file uploads by converting them to Base64 buffers. 
 * This ensures file integrity and prevents "Failed to load PDF" errors 
 * caused by corrupted stream handling.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const jobId = formData.get('jobId') as string;
    const coverLetter = formData.get('coverLetter') as string;
    const file = formData.get('file') as File;

    if (!jobId || !file) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Convert File to Base64 for 100% safe transit to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // 2. Upload to Cloudinary using 'auto' for document support
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'resumes';

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', fileBase64);
    cloudinaryFormData.append('upload_preset', uploadPreset);
    cloudinaryFormData.append('resource_type', 'auto');

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      { method: 'POST', body: cloudinaryFormData }
    );

    const cloudinaryData = await cloudinaryRes.json();
    
    if (!cloudinaryRes.ok || !cloudinaryData.secure_url) {
      throw new Error(cloudinaryData.error?.message || 'Cloudinary upload failed');
    }

    const resumeUrl = cloudinaryData.secure_url;

    await dbConnect();
    const job = await Job.findById(jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const application = await Application.create({
      jobId,
      userId: session.user.id,
      employer: job.employer,
      resume: resumeUrl,
      resumeUrl: resumeUrl,
      coverLetter,
      status: 'applied'
    });

    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    return NextResponse.json({
      message: 'Application submitted successfully',
      application,
      url: resumeUrl
    }, { status: 201 });

  } catch (error: any) {
    console.error('Application Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
