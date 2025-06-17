import React from 'react';
import { GraduationCap, Building, MapPin, Calendar, Plus, X } from 'lucide-react';
import type { Education } from '../../../types';

interface EducationFormProps {
  data: Education;
  onChange: (data: Education) => void;
  onDelete?: () => void;
}

const EducationForm: React.FC<EducationFormProps> = ({ data, onChange, onDelete }) => {
  const handleChange = (field: keyof Education, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addHighlight = () => {
    handleChange('highlights', [...(data.highlights || []), '']);
  };

  const removeHighlight = (index: number) => {
    const newHighlights = [...(data.highlights || [])];
    newHighlights.splice(index, 1);
    handleChange('highlights', newHighlights);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      {onDelete && (
        <div className="flex justify-end">
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800"
          >
            Delete Education
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Institution</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={data.institution}
              onChange={(e) => handleChange('institution', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="University Name"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Degree</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <GraduationCap className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={data.degree}
              onChange={(e) => handleChange('degree', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Bachelor of Science"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Field of Study</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <GraduationCap className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={data.field}
              onChange={(e) => handleChange('field', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Computer Science"
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">GPA</label>
          <input
            type="number"
            value={data.gpa || ''}
            onChange={(e) => handleChange('gpa', parseFloat(e.target.value) || '')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="3.8"
            min="0"
            max="4"
            step="0.1"
          />
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
                value={data.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Optional Highlights Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">Additional Highlights</label>
          <button
            type="button"
            onClick={addHighlight}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Highlight
          </button>
        </div>
        <div className="space-y-3">
          {data.highlights?.map((highlight, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={highlight}
                onChange={(e) => {
                  const newHighlights = [...(data.highlights || [])];
                  newHighlights[index] = e.target.value;
                  handleChange('highlights', newHighlights);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Academic achievements, relevant coursework..."
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

export default EducationForm;
