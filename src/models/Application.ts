import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IApplication extends Document {
  jobId: Types.ObjectId;
  userId: Types.ObjectId;
  employer: Types.ObjectId;
  resume: string;
  resumeUrl?: string; // Kept for backward compatibility during transition
  coverLetter?: string;
  status: 'applied' | 'reviewed' | 'rejected' | 'accepted';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    employer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resume: { type: String, required: true },
    resumeUrl: { type: String }, // Optional during transition
    coverLetter: { type: String, maxlength: 2000 },
    status: {
      type: String,
      enum: ['applied', 'reviewed', 'rejected', 'accepted'],
      default: 'applied',
    },
    notes: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

ApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

const Application: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
export default Application;
