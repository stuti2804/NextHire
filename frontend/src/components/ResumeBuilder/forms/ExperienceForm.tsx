import React from 'react';
import { Building, Briefcase, MapPin, Calendar, Tag, Plus, X } from 'lucide-react';
import type { Experience } from '../../../types';

interface ExperienceFormProps {
  data: Experience;
  onChange: (data: Experience) => void;
  onDelete?: () => void;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({ data, onChange, onDelete }) => {
  const handleChange = (field: keyof Experience, value: any) => {
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

  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...data.highlights];
    newHighlights[index] = value;
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
            Delete Position
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Job Title</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={data.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Senior Software Engineer"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Company</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={data.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Company Name"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={data.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="City, Country"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="month"
                value={data.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="month"
                value={data.endDate === 'Present' ? '' : data.endDate}
                onChange={(e) => handleChange('endDate', e.target.value || 'Present')}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Keywords/Skills</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Tag className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={data.keywords.join(', ')}
            onChange={(e) => handleKeywords(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="React, TypeScript, Node.js"
          />
        </div>
        <p className="text-sm text-gray-500">Separate keywords with commas</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">Key Achievements/Responsibilities</label>
          <button
            type="button"
            onClick={addHighlight}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Achievement
          </button>
        </div>
        <div className="space-y-3">
          {data.highlights.map((highlight, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={highlight}
                onChange={(e) => updateHighlight(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe your achievement..."
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
        {data.highlights.length === 0 && (
          <p className="text-sm text-gray-500">Add achievements to highlight your experience</p>
        )}
      </div>
    </div>
  );
};

export default ExperienceForm;
