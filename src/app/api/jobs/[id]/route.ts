import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const job = await Job.findById(params.id).populate('employer', 'name email company avatar');
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    // Increment views
    await Job.findByIdAndUpdate(params.id, { $inc: { views: 1 } });

    return NextResponse.json({ job });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const job = await Job.findById(params.id);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const isOwner = job.employer.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const updatedJob = await Job.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });

    return NextResponse.json({ message: 'Job updated', job: updatedJob });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const job = await Job.findById(params.id);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const isOwner = job.employer.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await Job.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
