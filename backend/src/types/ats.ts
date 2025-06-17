export interface ATSScore {
  overall: number;
  sections: {
    keywords: {
      score: number;
      matches: string[];
      missing: string[];
    };
    format: {
      score: number;
      issues: string[];
    };
    content: {
      score: number;
      suggestions: string[];
    };
  };
  jobMatch: {
    score: number;
    title: string;
    company: string;
    requiredSkills: {
      matched: string[];
      missing: string[];
    };
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    section: string;
    message: string;
    action: string;
  }>;
}
