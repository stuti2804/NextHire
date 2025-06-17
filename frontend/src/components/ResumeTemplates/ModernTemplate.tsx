import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';
import type { ResumeTemplateProps } from './types';

const ModernTemplate: React.FC<ResumeTemplateProps> = ({ data }) => {
  return (
    <div className="max-w-[21cm] mx-auto bg-white shadow-sm text-gray-800">
      {/* Header */}
      <div className="bg-indigo-700 text-white p-8">
        <h1 className="text-4xl font-bold mb-2">
          {data.personalInfo.firstName} {data.personalInfo.lastName}
        </h1>
        <p className="text-xl text-indigo-100 mb-4">{data.personalInfo.title}</p>
        <div className="grid grid-cols-2 gap-4 text-sm text-indigo-100">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {data.personalInfo.email}
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {data.personalInfo.phone}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {data.personalInfo.location}
          </div>
          {data.personalInfo.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {data.personalInfo.website}
            </div>
          )}
          {data.personalInfo.linkedin && (
            <div className="flex items-center gap-2">
              <Linkedin className="w-4 h-4" />
              {data.personalInfo.linkedin}
            </div>
          )}
          {data.personalInfo.github && (
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4" />
              {data.personalInfo.github}
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        {/* Summary */}
        {data.personalInfo.summary && (
          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
          </section>
        )}

        {/* Experience */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">Experience</h2>
          <div className="space-y-6">
            {data.experience.map((exp) => (
              <div key={exp.id} className="relative pl-8 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-indigo-700 before:rounded-full">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{exp.title}</h3>
                    <div className="text-gray-600">{exp.company}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {exp.startDate} - {exp.endDate}
                  </div>
                </div>
                <ul className="mt-2 space-y-2">
                  {exp.highlights.map((highlight, index) => (
                    <li key={index} className="text-gray-700">
                      {highlight}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex flex-wrap gap-2">
                  {exp.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-8">
          {/* Education */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">Education</h2>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="text-lg font-bold text-gray-900">{edu.degree}</h3>
                  <div className="text-gray-600">{edu.institution}</div>
                  <div className="text-sm text-gray-500">
                    {edu.startDate} - {edu.endDate}
                  </div>
                  {edu.gpa && (
                    <div className="text-gray-600 mt-1">GPA: {edu.gpa}</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Skills */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="bg-indigo-50 px-3 py-2 rounded-lg"
                >
                  <div className="font-medium text-indigo-700">{skill.name}</div>
                  <div className="text-xs text-indigo-600 mt-1">
                    {skill.level}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ModernTemplate;
