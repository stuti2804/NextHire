import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import type { ResumeTemplateProps } from './types';

const BasicTemplate: React.FC<ResumeTemplateProps> = ({ data }) => {
  return (
    <div className="max-w-[21cm] mx-auto bg-white p-8 shadow-sm text-gray-800">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {data.personalInfo.firstName} {data.personalInfo.lastName}
        </h1>
        <p className="text-lg text-gray-600 mb-4">{data.personalInfo.title}</p>
        <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Mail className="w-4 h-4" />
            {data.personalInfo.email}
          </span>
          <span className="flex items-center gap-1">
            <Phone className="w-4 h-4" />
            {data.personalInfo.phone}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {data.personalInfo.location}
          </span>
          {data.personalInfo.website && (
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              {data.personalInfo.website}
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.personalInfo.summary && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 mb-2">Summary</h2>
          <p className="text-gray-700">{data.personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 mb-2">Experience</h2>
        <div className="space-y-4">
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <h3 className="font-bold text-gray-800">{exp.title}</h3>
              <div className="text-gray-600">
                {exp.company} • {exp.location}
              </div>
              <div className="text-sm text-gray-500">
                {exp.startDate} - {exp.endDate}
              </div>
              <ul className="list-disc list-inside mt-2 text-gray-700">
                {exp.highlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 mb-2">Education</h2>
        <div className="space-y-4">
          {data.education.map((edu) => (
            <div key={edu.id}>
              <h3 className="font-bold text-gray-800">{edu.degree}</h3>
              <div className="text-gray-600">
                {edu.institution} • {edu.location}
              </div>
              <div className="text-sm text-gray-500">
                {edu.startDate} - {edu.endDate}
              </div>
              {edu.gpa && <div className="text-gray-600">GPA: {edu.gpa}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 mb-2">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill) => (
            <span
              key={skill.name}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {skill.name}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BasicTemplate;
