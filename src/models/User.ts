import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'jobseeker' | 'employer' | 'admin';
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  resume?: string;
  company?: {
    name: string;
    website?: string;
    description?: string;
    logo?: string;
    size?: string;
    industry?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role: { type: String, enum: ['jobseeker', 'employer', 'admin'], default: 'jobseeker' },
    avatar: String,
    phone: String,
    location: String,
    bio: { type: String, maxlength: 500 },
    resume: String,
    company: {
      name: String,
      website: String,
      description: String,
      logo: String,
      size: String,
      industry: String,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
