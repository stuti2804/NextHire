export interface Job {
  id?: string;
  title: string;
  company: string;
  description: string;
  location?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  requirements?: string[];
  url: string;
  matchScore?: number;
  postedDate?: Date;
  jobType?: string;
  source?: string;
}

export interface JobSearchParams {
  keywords: string[];
  location?: string;
  radius?: number;
  jobType?: string[];
  datePosted?: string;
  salary?: {
    min?: number;
    max?: number;
  };
}
