import JobForm from '@/components/employer/JobForm';

export default function NewJobPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Post a New Job</h1>
        <p className="text-slate-500 mt-1">Fill in the details below. Your job will be reviewed before going live.</p>
      </div>
      <JobForm />
    </div>
  );
}
