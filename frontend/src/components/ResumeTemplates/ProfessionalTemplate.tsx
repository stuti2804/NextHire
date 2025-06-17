import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';
import type { ResumeTemplateProps } from './types';

const ProfessionalTemplate: React.FC<ResumeTemplateProps> = ({ data }) => {
  return (
    <div className="max-w-[21cm] mx-auto bg-white p-8 shadow-sm text-gray-800">
      {/* Header with contact info sidebar */}
      <header className="flex justify-between items-start mb-8 border-b-2 border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {data.personalInfo.firstName} {data.personalInfo.lastName}
          </h1>
          <p className="text-xl text-gray-600">{data.personalInfo.title}</p>
        </div>
        <div className="text-right space-y-1 text-sm">
          <div className="flex items-center justify-end gap-2">
            <Mail className="w-4 h-4" />
            {data.personalInfo.email}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Phone className="w-4 h-4" />
            {data.personalInfo.phone}
          </div>
          <div className="flex items-center justify-end gap-2">
            <MapPin className="w-4 h-4" />
            {data.personalInfo.location}
          </div>
          {data.personalInfo.linkedin && (
            <div className="flex items-center justify-end gap-2">
              <Linkedin className="w-4 h-4" />
              {data.personalInfo.linkedin}
            </div>
          )}
          {data.personalInfo.github && (
            <div className="flex items-center justify-end gap-2">
              <Github className="w-4 h-4" />
              {data.personalInfo.github}
            </div>
          )}
        </div>
      </header>

      {/* Two column layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left column */}
        <div className="col-span-2 space-y-6">
          {/* Experience */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">
              Professional Experience
            </h2>
            <div className="space-y-6">
              {data.experience.map((exp) => (
                <div key={exp.id} className="border-l-2 border-gray-200 pl-4">
                  <h3 className="font-bold text-gray-800 text-lg">{exp.title}</h3>
                  <div className="font-semibold text-gray-600">{exp.company}</div>
                  <div className="text-sm text-gray-500 mb-2">
                    {exp.startDate} - {exp.endDate} | {exp.location}
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {exp.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">
                Projects
              </h2>
              <div className="space-y-4">
                {data.projects.map((project) => (
                  <div key={project.id}>
                    <h3 className="font-bold text-gray-800">{project.name}</h3>
                    <p className="text-gray-700 mb-2">{project.description}</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {project.highlights.map((highlight, index) => (
                        <li key={index}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Education */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">
              Education
            </h2>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                  <div className="text-gray-600">{edu.institution}</div>
                  <div className="text-sm text-gray-500">
                    {edu.startDate} - {edu.endDate}
                  </div>
                  {edu.gpa && <div className="text-gray-600">GPA: {edu.gpa}</div>}
                </div>
              ))}
            </div>
          </section>

          {/* Skills */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wider">
              Skills
            </h2>
            <div className="space-y-2">
              {data.skills.map((skill) => (
                <div key={skill.name} className="border-b border-gray-200 pb-2">
                  <div className="font-medium text-gray-800">{skill.name}</div>
                  <div className="text-sm text-gray-600">
                    {skill.keywords.join(' • ')}
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

export default ProfessionalTemplate;
