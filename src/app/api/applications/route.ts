import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 5MB allowed.' }, { status: 400 });
    }

    // Convert file to base64 for Cloudinary SDK upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload using Cloudinary SDK (signed — no preset needed)
    const uploadResult = await cloudinary.uploader.upload(fileBase64, {
      folder: 'resumes',
      resource_type: 'raw',
      allowed_formats: ['pdf', 'doc', 'docx'],
    });

    const resumeUrl = uploadResult.secure_url;

    await dbConnect();
    const job = await Job.findById(jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const existingApp = await Application.findOne({ jobId, userId: session.user.id });
    if (existingApp) {
      return NextResponse.json({ error: 'You have already applied for this job' }, { status: 409 });
    }

    const application = await Application.create({
      jobId,
      userId: session.user.id,
      employer: job.employer,
      resume: resumeUrl,
      resumeUrl,
      coverLetter,
      status: 'applied',
    });

    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    return NextResponse.json({
      message: 'Application submitted successfully',
      application,
      url: resumeUrl,
    }, { status: 201 });

  } catch (error: any) {
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
