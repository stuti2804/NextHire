export interface ResumeSection {
  id: string;
  type: 'experience' | 'education' | 'skills' | 'summary';
  content: Record<string, any>;
  isValid: boolean;
}

export interface ResumeState {
  sections: ResumeSection[];
  activeSection: string | null;
  isDirty: boolean;
}
