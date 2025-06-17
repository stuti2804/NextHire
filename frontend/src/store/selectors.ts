import { RootState } from './store';
import { ResumeSection } from '../types/resume';

export const selectSections = (state: RootState): ResumeSection[] => state.builder.sections;
export const selectActiveSection = (state: RootState): string | null => state.builder.activeSection;
export const selectIsDirty = (state: RootState): boolean => state.builder.isDirty;
export const selectSectionById = (id: string) => (state: RootState): ResumeSection | undefined => 
  state.builder.sections.find(section => section.id === id);
