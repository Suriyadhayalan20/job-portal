import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'jobseeker') {
      return NextResponse.json({ error: 'Only job seekers can apply' }, { status: 401 });
    }

    await dbConnect();
    const job = await Job.findById(params.id);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    if (job.status !== 'approved') return NextResponse.json({ error: 'Job is not available' }, { status: 400 });

    const existingApp = await Application.findOne({ jobId: params.id, userId: session.user.id });
    if (existingApp) return NextResponse.json({ error: 'You have already applied for this job' }, { status: 409 });

    const body = await request.json();
    const application = await Application.create({
      jobId: params.id,
      userId: session.user.id,
      coverLetter: body.coverLetter,
      resumeUrl: body.resumeUrl || body.resume, // Support both just in case
      status: 'applied'
    });

    await Job.findByIdAndUpdate(params.id, { $inc: { applicationCount: 1 } });

    return NextResponse.json({ message: 'Application submitted successfully', application }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const application = await Application.findOne({ jobId: params.id, userId: session.user.id });
    return NextResponse.json({ applied: !!application, application });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
