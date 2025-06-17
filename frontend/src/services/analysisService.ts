import api from './api';

export interface AnalysisResult {
  score: number;
  feedback: string;
  suggestions: string[];
  keywordMatches: string[];
}

export interface ResumeAnalysisData {
  wordCount: number;
  keywordsDensity: Record<string, number>;
  suggestions: string[];
}

export interface JobMatchData {
  matchScore: number;
  missingKeywords: string[];
  suggestions: string[];
}

export interface UserStatsData {
  totalResumes: number;
  averageScore: number;
  applicationSuccess: number;
}

// Define interface matching the sample format (used for display purposes)
export interface GeminiAnalysisData {
  basicInfo: {
    name: string;
    email: string;
    mobile: string;
    address: string;
  };
  skills: {
    currentSkills: string[];
    recommendedSkills: string[];
  };
  courseRecommendations: Array<{
    platform: string;
    course_name: string;
    link: string;
  }>;
  appreciation: string[];
  resumeTips: string[];
  atsScore: number;
  aiResumeSummary: string;
  matchingJobRoles: string[];
  atsKeywords: string[];
  projectSuggestions: {
    improvementTips: string[];
    newProjectRecommendations: string[];
  };
  relevantSkillsScore: Array<{
    skill: string;
    score: number;
  }>;
  jobLevelScore: Array<{
    level: string;
    score: number;
  }>;
  careerGrowthTrajectory: Array<{
    currentRole: string;
    nextRole: string;
    futureRoles: string[];
    suggestions: string[];
  }>;
}

const analysisService = {
  // Get resume analysis for a specific resume
  getResumeAnalysis: async (resumeId: string) => {
    const response = await api.get<ResumeAnalysisData>(`/resumes/${resumeId}/analysis`);
    return response.data;
  },
  
  // Get job match analysis for a resume against a job description
  getJobMatch: async (resumeId: string, jobDescription: string) => {
    const response = await api.post<JobMatchData>(`/resumes/${resumeId}/job-match`, {
      jobDescription
    });
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await api.get<UserStatsData>('/resumes/stats/user');
    return response.data;
  },
  
  // Enhanced analysis that uses the existing backend routes but returns data in the Gemini format
  getEnhancedAnalysis: async (resumeId: string) => {
    try {
      // Fetch the resume with all analysis data
      const resumeResponse = await api.get(`/resumes/${resumeId}`);
      const resumeData = resumeResponse.data;
      
      // If the resume doesn't have analysis or is missing key fields, return null
      if (!resumeData.hasAnalysis) {
        throw new Error('Resume analysis not available');
      }
      
      // Return the resume data in the format expected by the UI
      const enhancedData: GeminiAnalysisData = {
        basicInfo: resumeData.basicInfo || {
          name: '',
          email: '',
          mobile: '',
          address: ''
        },
        skills: resumeData.skills || {
          currentSkills: [],
          recommendedSkills: []
        },
        courseRecommendations: resumeData.courseRecommendations || [],
        appreciation: resumeData.appreciation || [],
        resumeTips: resumeData.resumeTips || [],
        atsScore: resumeData.atsScore || 0,
        aiResumeSummary: resumeData.aiResumeSummary || '',
        matchingJobRoles: resumeData.matchingJobRoles || [],
        atsKeywords: resumeData.atsKeywords || [],
        projectSuggestions: resumeData.projectSuggestions || {
          improvementTips: [],
          newProjectRecommendations: []
        },
        relevantSkillsScore: resumeData.relevantSkillsScore || [],
        jobLevelScore: resumeData.jobLevelScore || [],
        careerGrowthTrajectory: resumeData.careerGrowthTrajectory || []
      };
      
      return enhancedData;
    } catch (error) {
      console.error('Error fetching enhanced analysis:', error);
      throw error;
    }
  },
  
  // Get keyword suggestions from a job description
  getKeywordSuggestions: async (jobDescription: string) => {
    // This endpoint doesn't exist in the API documentation
    // We could use the job match endpoint instead or modify based on actual backend capability
    const response = await api.post<JobMatchData>('/resumes/job-match', { jobDescription });
    return response.data.missingKeywords || [];
  },

  // Export analytics as PDF
  exportAnalyticsAsPDF: async (resumeId: string, format: string = 'pdf') => {
    // The correct endpoint based on API documentation would be /resumes/:id/export
    const response = await api.get(`/resumes/${resumeId}/export?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default analysisService;
