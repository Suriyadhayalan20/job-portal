export interface Application {
    _id: string;
    jobId: string | any;
    userId: string | any;
    resumeUrl: string;
    coverLetter?: string;
    status: 'applied' | 'reviewed' | 'rejected' | 'accepted';
    createdAt: string;
    updatedAt: string;
}
