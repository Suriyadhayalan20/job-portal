import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Job from '@/models/Job';

// Force dynamic behavior to prevent build-time static generation issues
export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
    try {
        // 1. Establish database connection inside the request handler
        await connectDB();

        // 2. Check Authentication & Authorization
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized: Admin access required' },
                { status: 401 }
            );
        }

        // 3. Parse and validate request body
        const { jobId } = await request.json();

        if (!jobId) {
            return NextResponse.json(
                { error: 'Job ID is required' },
                { status: 400 }
            );
        }

        // 4. Update the job status
        const job = await Job.findByIdAndUpdate(
            jobId,
            { status: 'approved' },
            { new: true }
        );

        if (!job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        // 5. Return successful response
        return NextResponse.json({
            message: 'Job approved successfully',
            job
        }, { status: 200 });

    } catch (error: any) {
        console.error('API Error (/api/admin/jobs/approve):', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
