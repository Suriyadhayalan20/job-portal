import { formatDate, formatSalary, timeAgo } from '../lib/utils';

export { formatDate, formatSalary, timeAgo };

export const truncateText = (text: string, length: number) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
};

export const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        applied: 'bg-blue-100 text-blue-700',
        reviewed: 'bg-amber-100 text-amber-700',
        rejected: 'bg-red-100 text-red-700',
        accepted: 'bg-emerald-100 text-emerald-700',
        pending: 'bg-yellow-100 text-yellow-700',
        approved: 'bg-emerald-100 text-emerald-700',
    };
    return colors[status.toLowerCase()] || 'bg-slate-100 text-slate-600';
};
