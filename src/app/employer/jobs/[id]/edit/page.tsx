import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import JobForm from '@/components/employer/JobForm';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';

async function getJob(id: string, employerId: string) {
  await dbConnect();
  const job = await Job.findOne({ _id: id, employer: employerId }).lean();
  return job;
}

export default async function EditJobPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const job = await getJob(params.id, session!.user.id);
  if (!job) notFound();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Edit Job</h1>
        <p className="text-slate-500 mt-1">Update your job posting</p>
      </div>
      <JobForm initialData={job} jobId={params.id} />
    </div>
  );
}
