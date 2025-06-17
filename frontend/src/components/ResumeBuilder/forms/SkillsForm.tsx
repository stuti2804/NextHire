import React from 'react';
import { Lightbulb, Tag, Plus, X } from 'lucide-react';
import type { Skill } from '../../../types';

interface SkillsFormProps {
  data: Skill;
  onChange: (data: Skill) => void;
  onDelete?: () => void;
}

const SkillsForm: React.FC<SkillsFormProps> = ({ data, onChange, onDelete }) => {
  const handleChange = (field: keyof Skill, value: any) => {
    onChange({ ...data, [field]: value });
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
            Delete Skill
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Skill Name</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lightbulb className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={data.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., JavaScript"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Proficiency Level</label>
          <select
            value={data.level}
            onChange={(e) => handleChange('level', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Related Keywords</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Tag className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={data.keywords.join(', ')}
            onChange={(e) => handleKeywords(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="React, Redux, Hooks"
          />
        </div>
        <p className="text-sm text-gray-500">Add related technologies or specific aspects of this skill</p>
      </div>
    </div>
  );
};

export default SkillsForm;
