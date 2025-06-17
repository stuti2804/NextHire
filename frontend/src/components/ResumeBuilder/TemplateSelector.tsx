import React from 'react';
import { Layout } from 'lucide-react';

interface Template {
  id: string;
  name: string;
}

interface TemplateSelectorProps {
  templates: Template[];
  activeTemplate: string;
  onSelect: (templateId: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  activeTemplate,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template.id)}
          className={`p-4 border rounded-lg text-center transition-all ${
            activeTemplate === template.id
              ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 ring-offset-2'
              : 'border-gray-200 hover:border-indigo-600 hover:bg-gray-50'
          }`}
        >
          <Layout className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
          <h3 className="text-sm font-medium text-gray-900">{template.name}</h3>
        </button>
      ))}
    </div>
  );
};

export default TemplateSelector;
