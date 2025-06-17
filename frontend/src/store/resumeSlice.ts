import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ResumeData, ATSScore, TemplateSettings } from '../types';

interface ResumeState {
  resumes: ResumeData[];
  activeResumeId: string | null;
  templates: TemplateSettings[];
  activeTemplateId: string | null;
  atsScores: Record<string, ATSScore>;
  loading: boolean;
  error: string | null;
}

const initialState: ResumeState = {
  resumes: [],
  activeResumeId: null,
  templates: [],
  activeTemplateId: null,
  atsScores: {},
  loading: false,
  error: null,
};

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    // Resume CRUD operations
    setResumes: (state, action: PayloadAction<ResumeData[]>) => {
      state.resumes = action.payload;
    },
    addResume: (state, action: PayloadAction<ResumeData>) => {
      state.resumes.push(action.payload);
    },
    updateResume: (state, action: PayloadAction<ResumeData>) => {
      const index = state.resumes.findIndex(resume => resume.id === action.payload.id);
      if (index !== -1) {
        state.resumes[index] = action.payload;
      }
    },
    deleteResume: (state, action: PayloadAction<string>) => {
      state.resumes = state.resumes.filter(resume => resume.id !== action.payload);
      if (state.activeResumeId === action.payload) {
        state.activeResumeId = null;
      }
      delete state.atsScores[action.payload];
    },
    setActiveResume: (state, action: PayloadAction<string | null>) => {
      state.activeResumeId = action.payload;
    },

    // Template management
    setTemplates: (state, action: PayloadAction<TemplateSettings[]>) => {
      state.templates = action.payload;
    },
    addTemplate: (state, action: PayloadAction<TemplateSettings>) => {
      state.templates.push(action.payload);
    },
    updateTemplate: (state, action: PayloadAction<TemplateSettings>) => {
      const index = state.templates.findIndex(template => template.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
    },
    deleteTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter(template => template.id !== action.payload);
      if (state.activeTemplateId === action.payload) {
        state.activeTemplateId = null;
      }
    },
    setActiveTemplate: (state, action: PayloadAction<string | null>) => {
      state.activeTemplateId = action.payload;
    },

    // ATS score management
    updateATSScore: (state, action: PayloadAction<{ resumeId: string; score: ATSScore }>) => {
      state.atsScores[action.payload.resumeId] = action.payload.score;
    },
    
    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Utility actions
    duplicateResume: (state, action: PayloadAction<string>) => {
      const resumeToDuplicate = state.resumes.find(resume => resume.id === action.payload);
      if (resumeToDuplicate) {
        const newResume: ResumeData = {
          ...resumeToDuplicate,
          id: crypto.randomUUID(),
          title: `${resumeToDuplicate.title} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.resumes.push(newResume);
      }
    },
  },
});

export const {
  setResumes,
  addResume,
  updateResume,
  deleteResume,
  setActiveResume,
  setTemplates,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  setActiveTemplate,
  updateATSScore,
  setLoading,
  setError,
  duplicateResume,
} = resumeSlice.actions;

export default resumeSlice.reducer;