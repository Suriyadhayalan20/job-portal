export const openResume = (url?: string) => {
    if (!url) return;
    window.open(`/api/view-resume?url=${encodeURIComponent(url)}`, '_blank');
};
