export interface Job {
    _id: string;
    title: string;
    description: string;
    requirements?: string[];
    responsibilities?: string[];
    employer: string | any;
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
    benefits?: string[];
    status: 'pending' | 'approved' | 'rejected' | 'closed';
    featured: boolean;
    views: number;
    applicationCount: number;
    createdAt: string;
    updatedAt: string;
}
