import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div className={cn('animate-spin rounded-full border-2 border-slate-200 border-t-ink-600', sizeMap[size], className)} />
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
