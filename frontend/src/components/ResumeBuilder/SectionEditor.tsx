import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'month' | 'textarea' | 'list' | 'tags' | 'number';
  required?: boolean;
}

interface SectionEditorProps {
  title?: string;
  data: any;
  onChange: (data: any) => void;
  fields: Field[];
}

const SectionEditor: React.FC<SectionEditorProps> = ({ title, data, onChange, fields }) => {
  const [newItem, setNewItem] = useState('');

  const handleInputChange = (name: string, value: any) => {
    onChange({ ...data, [name]: value });
  };

  const handleListAdd = (name: string) => {
    if (!newItem.trim()) return;
    const currentList = Array.isArray(data[name]) ? data[name] : [];
    handleInputChange(name, [...currentList, newItem.trim()]);
    setNewItem('');
  };

  const handleListRemove = (name: string, index: number) => {
    const newList = [...(data[name] || [])];
    newList.splice(index, 1);
    handleInputChange(name, newList);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={data[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
              />
            ) : field.type === 'list' || field.type === 'tags' ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder={`Add ${field.label.toLowerCase()}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleListAdd(field.name)}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(data[field.name] || []).map((item: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md"
                    >
                      <span className="text-sm">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleListRemove(field.name, index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <input
                type={field.type}
                value={data[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                required={field.required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionEditor;
