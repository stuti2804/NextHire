import React from 'react';
import type { ResumeData } from '../../types';
import { BasicTemplate, ModernTemplate, ProfessionalTemplate } from '../ResumeTemplates';

interface ResumePreviewProps {
  data: Partial<ResumeData>;
  template: string;
  scale?: number;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, template, scale = 1 }) => {
  const getTemplate = () => {
    switch (template) {
      case 'modern':
        return ModernTemplate;
      case 'professional':
        return ProfessionalTemplate;
      default:
        return BasicTemplate;
    }
  };

  const Template = getTemplate();

  return (
    <div 
      className="bg-gray-100 p-8 min-h-full"
      style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
    >
      <div className="shadow-lg">
        <Template data={data as ResumeData} />
      </div>
    </div>
  );
};

export default ResumePreview;
