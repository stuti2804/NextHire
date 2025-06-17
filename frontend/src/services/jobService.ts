import api from './api';

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  postedDate: string;
  source: string;
  relevanceScore?: number;
  matchScore?: number;
  recommended?: boolean;
}

const jobService = {
  searchJobs: async (keywords: string[]) => {
    const response = await api.post<JobListing[]>('/jobs/search', { keywords });
    return response.data;
  },
  
  getSavedJobs: async () => {
    const response = await api.get<JobListing[]>('/jobs/saved');
    return response.data;
  },
  
  saveJob: async (jobData: JobListing) => {
    const response = await api.post<JobListing>('/jobs/save', jobData);
    return response.data;
  },
  
  unsaveJob: async (jobId: string) => {
    await api.delete(`/jobs/saved/${jobId}`);
  },

  getRecommendedJobs: async (resumeId: string) => {
    const response = await api.get<JobListing[]>(`/jobs/recommended/${resumeId}`);
    return response.data;
  }
};

export default jobService;
