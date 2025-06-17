import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ResumeData } from '../../types';
import SectionEditor from './SectionEditor';

interface ResumeFormProps {
  data: Partial<ResumeData>;
  onChange: (data: Partial<ResumeData>) => void;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ data, onChange }) => {
  const handleSectionChange = (section: keyof ResumeData, value: any) => {
    onChange({ ...data, [section]: value });
  };

  const addListItem = (section: 'experience' | 'education' | 'projects') => {
    let newItem;
    
    if (section === 'experience') {
      newItem = {
        id: crypto.randomUUID(),
        title: 'Software Engineer',
        company: 'Tech Company',
        location: 'San Francisco, CA',
        startDate: '2022-01',
        endDate: 'Present',
        highlights: ['Developed new features', 'Collaborated with cross-functional teams'],
        keywords: ['React', 'TypeScript', 'Node.js'],
      };
    } else if (section === 'education') {
      newItem = {
        id: crypto.randomUUID(),
        institution: 'University Name',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        location: 'Boston, MA',
        gpa: '3.8',
        startDate: '2018-09',
        endDate: '2022-05',
        highlights: ['Graduated with honors', 'Relevant coursework: Data Structures, Algorithms']
      };
    } else { // projects
      newItem = {
        id: crypto.randomUUID(),
        name: 'Project Name',
        description: 'A brief description of the project and its purpose.',
        url: 'https://github.com/yourusername/project',
        highlights: ['Key feature or achievement', 'Another key accomplishment'],
        keywords: ['React', 'Firebase', 'Material UI'],
      };
    }

    handleSectionChange(section, [...(data[section] || []), newItem]);
  };

  const removeListItem = (section: 'experience' | 'education' | 'projects', id: string) => {
    handleSectionChange(
      section,
      (data[section] || []).filter(item => item.id !== id)
    );
  };

  return (
    <div className="space-y-8">
      <SectionEditor
        title="Personal Information"
        data={data.personalInfo}
        onChange={value => handleSectionChange('personalInfo', value)}
        fields={[
          { name: 'firstName', label: 'First Name', type: 'text', required: true },
          { name: 'lastName', label: 'Last Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'phone', label: 'Phone', type: 'tel', required: true },
          { name: 'location', label: 'Location', type: 'text', required: true },
          { name: 'title', label: 'Professional Title', type: 'text', required: true },
          { name: 'summary', label: 'Professional Summary', type: 'textarea' },
          { name: 'website', label: 'Website', type: 'url' },
          { name: 'linkedin', label: 'LinkedIn', type: 'url' },
          { name: 'github', label: 'GitHub', type: 'url' },
        ]}
      />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Experience</h2>
          <button
            type="button"
            onClick={() => addListItem('experience')}
            className="flex items-center px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Experience
          </button>
        </div>
        {data.experience?.map((exp) => (
          <div key={exp.id} className="relative">
            <button
              type="button"
              onClick={() => removeListItem('experience', exp.id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <SectionEditor
              data={exp}
              onChange={value => {
                handleSectionChange(
                  'experience',
                  data.experience?.map(e => (e.id === exp.id ? value : e))
                );
              }}
              fields={[
                { name: 'title', label: 'Job Title', type: 'text', required: true },
                { name: 'company', label: 'Company', type: 'text', required: true },
                { name: 'location', label: 'Location', type: 'text', required: true },
                { name: 'startDate', label: 'Start Date', type: 'month', required: true },
                { name: 'endDate', label: 'End Date', type: 'month' },
                { name: 'highlights', label: 'Highlights', type: 'list' },
                { name: 'keywords', label: 'Keywords', type: 'tags' },
              ]}
            />
          </div>
        ))}
      </div>

      {/* Education Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Education</h2>
          <button
            type="button"
            onClick={() => addListItem('education')}
            className="flex items-center px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Education
          </button>
        </div>
        {data.education?.map((edu) => (
          <div key={edu.id} className="relative">
            <button
              type="button"
              onClick={() => removeListItem('education', edu.id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <SectionEditor
              data={edu}
              onChange={value => {
                handleSectionChange(
                  'education',
                  data.education?.map(e => (e.id === edu.id ? value : e))
                );
              }}
              fields={[
                { name: 'institution', label: 'Institution', type: 'text', required: true },
                { name: 'degree', label: 'Degree', type: 'text', required: true },
                { name: 'field', label: 'Field of Study', type: 'text', required: true },
                { name: 'location', label: 'Location', type: 'text', required: true },
                { name: 'gpa', label: 'GPA', type: 'number' },
                { name: 'startDate', label: 'Start Date', type: 'month', required: true },
                { name: 'endDate', label: 'End Date', type: 'month', required: true },
                { name: 'highlights', label: 'Additional Highlights', type: 'list' }
              ]}
            />
          </div>
        ))}
      </div>

      {/* Projects Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Projects</h2>
          <button
            type="button"
            onClick={() => addListItem('projects')}
            className="flex items-center px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Project
          </button>
        </div>
        {data.projects?.map((project) => (
          <div key={project.id} className="relative">
            <button
              type="button"
              onClick={() => removeListItem('projects', project.id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <SectionEditor
              data={project}
              onChange={value => {
                handleSectionChange(
                  'projects',
                  data.projects?.map(p => (p.id === project.id ? value : p))
                );
              }}
              fields={[
                { name: 'name', label: 'Project Name', type: 'text', required: true },
                { name: 'url', label: 'Project URL', type: 'url' },
                { name: 'description', label: 'Project Description', type: 'textarea', required: true },
                { name: 'keywords', label: 'Technologies Used', type: 'tags' },
                { name: 'highlights', label: 'Key Features & Achievements', type: 'list' }
              ]}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeForm;
