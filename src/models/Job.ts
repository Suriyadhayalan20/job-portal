import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  employer: Types.ObjectId;
  company: {
    name: string;
    logo?: string;
    website?: string;
    size?: string;
    industry?: string;
  };
  location: string;
  isRemote: boolean;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship' | 'Remote';
  category: string;
  experienceLevel: string;
  salary: {
    min?: number;
    max?: number;
    currency: string;
    period: 'yearly' | 'monthly' | 'hourly';
  };
  skills: string[];
  benefits: string[];
  applicationDeadline?: Date;
  status: 'pending' | 'approved' | 'rejected' | 'closed';
  featured: boolean;
  views: number;
  applicationCount: number;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: [true, 'Job title is required'], trim: true, maxlength: 200 },
    description: { type: String, required: [true, 'Job description is required'] },
    requirements: [{ type: String }],
    responsibilities: [{ type: String }],
    employer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company: {
      name: { type: String, required: true },
      logo: String,
      website: String,
      size: String,
      industry: String,
    },
    location: { type: String, required: [true, 'Location is required'] },
    isRemote: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Remote'],
      required: true,
    },
    category: { type: String, required: [true, 'Category is required'] },
    experienceLevel: { type: String, required: [true, 'Experience level is required'] },
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' },
      period: { type: String, enum: ['yearly', 'monthly', 'hourly'], default: 'yearly' },
    },
    skills: [{ type: String }],
    benefits: [{ type: String }],
    applicationDeadline: Date,
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'closed'], default: 'pending' },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    applicationCount: { type: Number, default: 0 },
    createdBy: { type: String },
  },
  { timestamps: true }
);

JobSchema.index({ title: 'text', description: 'text', 'company.name': 'text' });
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ employer: 1 });
JobSchema.index({ category: 1, type: 1 });

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
export default Job;
