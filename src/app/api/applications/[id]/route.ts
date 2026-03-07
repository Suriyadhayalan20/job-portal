import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'employer' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const application = await Application.findById(params.id);
    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    if (session.user.role === 'employer' && application.employer.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await Application.findByIdAndUpdate(
      params.id,
      { status: body.status, notes: body.notes },
      { new: true }
    ).populate('userId', 'name email avatar');

    return NextResponse.json({ message: 'Application updated', application: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
