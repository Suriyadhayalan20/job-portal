import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'employer' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const job = await Job.findById(params.id);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    if (session.user.role === 'employer' && job.employer.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const applications = await Application.find({ jobId: params.id })
      .populate('userId', 'name email avatar phone location bio resumeUrl')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ applications, job });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
