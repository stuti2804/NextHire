import React from 'react';
import { FolderGit2, Globe, Tag, Calendar, Plus, X } from 'lucide-react';
import type { Project } from '../../../types';

interface ProjectsFormProps {
  data: Project;
  onChange: (data: Project) => void;
  onDelete?: () => void;
}

const ProjectsForm: React.FC<ProjectsFormProps> = ({ data, onChange, onDelete }) => {
  const handleChange = (field: keyof Project, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addHighlight = () => {
    handleChange('highlights', [...data.highlights, '']);
  };

  const removeHighlight = (index: number) => {
    const newHighlights = [...data.highlights];
    newHighlights.splice(index, 1);
    handleChange('highlights', newHighlights);
  };

  const handleKeywords = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k);
    handleChange('keywords', keywords);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      {onDelete && (
        <div className="flex justify-end">
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800"
          >
            Delete Project
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Project Name</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FolderGit2 className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={data.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Project Name"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Project URL</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              value={data.url || ''}
              onChange={(e) => handleChange('url', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://github.com/username/project"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Project Description</label>
        <textarea
          value={data.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Brief description of the project..."
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Technologies Used</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Tag className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={data.keywords.join(', ')}
            onChange={(e) => handleKeywords(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="React, Node.js, MongoDB"
          />
        </div>
        <p className="text-sm text-gray-500">Separate technologies with commas</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">Key Features & Achievements</label>
          <button
            type="button"
            onClick={addHighlight}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Feature
          </button>
        </div>
        <div className="space-y-3">
          {data.highlights.map((highlight, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={highlight}
                onChange={(e) => {
                  const newHighlights = [...data.highlights];
                  newHighlights[index] = e.target.value;
                  handleChange('highlights', newHighlights);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe a key feature or achievement..."
              />
              <button
                type="button"
                onClick={() => removeHighlight(index)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsForm;
