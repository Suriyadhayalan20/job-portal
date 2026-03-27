import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';

    const query: any = {};
    if (status) query.status = status;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('employer', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      jobs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as any).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { jobId, status } = body;

    const job = await Job.findByIdAndUpdate(jobId, { status }, { new: true });
    if (!job)
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    return NextResponse.json({ message: `Job ${status}`, job });
  } catch (error) {
    return NextResponse.json(
      { error: (error as any).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}