import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatSalary(min?: number, max?: number, currency = 'USD'): string {
  if (!min && !max) return 'Not specified';
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Remote'] as const;
export const JOB_CATEGORIES = [
  'Technology', 'Design', 'Marketing', 'Sales', 'Finance', 'Healthcare',
  'Education', 'Engineering', 'Legal', 'Operations', 'Customer Support', 'Other',
] as const;
export const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Manager', 'Director', 'Executive'] as const;

/**
 * Fixes Cloudinary raw PDF URLs to ensure they display correctly in the browser
 * by adding the fl_inline flag.
 */
export function fixResumeUrl(url: string | undefined | null): string {
    if (!url) return '#';
    
    // Only apply fix to Cloudinary 'raw' URLs that contain '/upload/'
    if (url.includes('cloudinary.com') && url.includes('/raw/upload/')) {
        // If it already has the flag, don't add it again
        if (url.includes('/fl_inline/')) return url;
        
        return url.replace('/upload/', '/upload/fl_inline/');
    }
    
    return url;
}

