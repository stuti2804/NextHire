import React from 'react';
import { BookOpen, Play, FileText, Download, ExternalLink } from 'lucide-react';

const resources = [
  {
    category: 'Resume Writing Guides',
    items: [
      {
        title: 'Crafting an ATS-Friendly Resume',
        type: 'Article',
        duration: '10 min read',
        icon: FileText,
        url: 'https://create.microsoft.com/en-us/learn/articles/how-to-write-ats-friendly-resume',
      },
      {
        title: 'Resume Writing Best Practices',
        type: 'Video',
        duration: '15 min',
        icon: Play,
        url: 'https://www.youtube.com/watch?v=Tt08KmFfIYQ',
      },
      {
        title: 'Industry-Specific Templates',
        type: 'Templates',
        duration: '5 templates',
        icon: Download,
        url: 'https://create.microsoft.com/en-us/templates/ats-resumes',
      },
    ],
  },
  {
    category: 'Interview Preparation',
    items: [
      {
        title: 'Common Interview Questions',
        type: 'Guide',
        duration: '20 min read',
        icon: BookOpen,
        url: 'https://www.geeksforgeeks.org/common-interview-questions-and-answers/',
      },
      {
        title: 'Technical Interview Prep',
        type: 'Course',
        duration: '2 hours',
        icon: Play,
        url: 'https://www.coursera.org/learn/coding-interview-preparation',
      },
      {
        title: 'Behavioral Interview Tips',
        type: 'Article',
        duration: '12 min read',
        icon: FileText,
        url: 'https://www.albright.edu/wp-content/uploads/2020/08/Behavioral-Interviewing-Guide.pdf',
      },
    ],
  },
];

const Resources = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
        <a 
          href="https://resume-guide-rhl9hco.gamma.site/" 
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-block"
        >
          Browse All Resources
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((category) => (
          <div key={category.category} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h2>
              <div className="space-y-4">
                {category.items.map((item) => (
                  <a
                    key={item.title}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex-shrink-0">
                      <item.icon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500">{item.type}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{item.duration}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <a 
                href={category.category === 'Resume Writing Guides' 
                  ? 'https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/' 
                  : 'https://careerdevelopment.princeton.edu/sites/g/files/toruqf1041/files/media/interview_guide_5.pdf'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View All {category.category} →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/*<div className="bg-indigo-50 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Need personalized guidance?</h2>
            <p className="mt-1 text-sm text-gray-500">
              Book a session with our career experts for personalized resume review and career advice.
            </p>
          </div>
          <a 
            href="https://example.com/book-consultation"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-block"
          >
            Book Consultation
          </a>
        </div>
      </div>*/}
    </div>
  );
};

export default Resources;