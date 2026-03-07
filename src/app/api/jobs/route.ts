import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || '';
    const location = searchParams.get('location') || '';
    const experienceLevel = searchParams.get('experienceLevel') || '';
    const status = searchParams.get('status') || 'approved';

    const query: any = { status };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (type) query.type = type;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (experienceLevel) query.experienceLevel = experienceLevel;

    const skip = (page - 1) * limit;
    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('employer', 'name email company')
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      jobs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    // Ensure we have the user's email for the createdBy field
    const userEmail = session.user.email;
    const userId = session.user.id;

    // Map the incoming flat body to the Job model structure if necessary,
    // or just ensure mandatory fields are present.
    // The model expects company as an object, but we'll adapt to what's provided.

    const jobData = {
      title: body.title,
      description: body.description,
      location: body.location,
      category: body.category || 'Technology',
      type: body.jobType || body.type || 'Full-time',
      experienceLevel: body.experience || body.experienceLevel || 'Entry Level',
      employer: userId,
      createdBy: userEmail,
      status: 'pending',
      // Ensure company is an object as per model
      company: typeof body.company === 'string'
        ? { name: body.company }
        : (body.company && body.company.name ? body.company : { name: body.company || body.title || 'Company' }),
      // Ensure skills is an array
      skills: typeof body.skills === 'string'
        ? body.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : (Array.isArray(body.skills) ? body.skills : []),
      // Salary handling
      ...(typeof body.salary === 'object' ? { salary: body.salary } : {})
    };

    console.log('Attempting to create job with data:', JSON.stringify(jobData, null, 2));

    const job = await Job.create(jobData);

    return NextResponse.json({ message: 'Job posted successfully', job }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/jobs:', error);
    return NextResponse.json({
      error: error.message || 'Internal Server Error',
      details: error.errors ? Object.keys(error.errors).map(key => error.errors[key].message) : undefined
    }, { status: 500 });
  }
}
