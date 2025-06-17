import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ResumeSection, ResumeState } from '../types/resume';

const initialState: ResumeState = {
  sections: [],
  activeSection: null,
  isDirty: false,
};

export const builderSlice = createSlice({
  name: 'builder',
  initialState,
  reducers: {
    addSection: (state, action: PayloadAction<ResumeSection>) => {
      state.sections.push(action.payload);
      state.isDirty = true;
    },
    removeSection: (state, action: PayloadAction<string>) => {
      state.sections = state.sections.filter(section => section.id !== action.payload);
      state.isDirty = true;
    },
    updateSection: (state, action: PayloadAction<{ id: string; content: Record<string, any> }>) => {
      const section = state.sections.find(s => s.id === action.payload.id);
      if (section) {
        section.content = action.payload.content;
        state.isDirty = true;
      }
    },
    setActiveSection: (state, action: PayloadAction<string | null>) => {
      state.activeSection = action.payload;
    },
    validateSection: (state, action: PayloadAction<{ id: string; isValid: boolean }>) => {
      const section = state.sections.find(s => s.id === action.payload.id);
      if (section) {
        section.isValid = action.payload.isValid;
      }
    },
    resetDirtyState: (state) => {
      state.isDirty = false;
    }
  }
});

export const { 
  addSection,
  removeSection,
  updateSection,
  setActiveSection,
  validateSection,
  resetDirtyState
} = builderSlice.actions;

export default builderSlice.reducer;
