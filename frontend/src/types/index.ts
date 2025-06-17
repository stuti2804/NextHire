export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  summary: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | 'Present';
  highlights: string[];
  keywords: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: number;
  highlights?: string[];
}

export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  keywords: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  highlights: string[];
  keywords: string[];
  startDate?: string;
  endDate?: string;
}

export interface ResumeData {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications?: {
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }[];
  languages?: {
    language: string;
    proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
  }[];
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  title?: string;
  company?: string;
  location?: string;
  phone?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
    jobAlerts: boolean;
  };
  subscription: {
    plan: 'free' | 'premium' | 'enterprise';
    validUntil: string;
  };
}

export interface TemplateSettings {
  id: string;
  name: string;
  fontSize: {
    heading: number;
    subheading: number;
    body: number;
  };
  spacing: {
    sectionGap: number;
    itemGap: number;
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
    accent: string;
  };
  layout: {
    columns: 1 | 2;
    sidebarPosition?: 'left' | 'right';
    sidebarWidth?: number;
  };
}

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
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    section: string;
    message: string;
    action: string;
  }[];
}
