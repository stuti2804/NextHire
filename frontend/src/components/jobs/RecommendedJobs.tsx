import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, FileText } from 'lucide-react';
import jobService, { JobListing } from '../../services/jobService';
import resumeService from '../../services/resumeService';

interface RecommendedJobsProps {
  onSaveJob: (job: JobListing) => Promise<void>;
  onUnsaveJob: (jobId: string) => Promise<void>;
  savedJobs: JobListing[];
}

const RecommendedJobs: React.FC<RecommendedJobsProps> = ({ onSaveJob, onUnsaveJob, savedJobs }) => {
  const [recommendedJobs, setRecommendedJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [resumesLoading, setResumesLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      setResumesLoading(true);
      try {
        const data = await resumeService.getAllResumes();
        setResumes(data);
        // Don't automatically set the first resume - require user selection instead
        // if (data.length > 0) {
        //   setSelectedResumeId(data[0].id);
        // }
      } catch (err) {
        console.error('Failed to fetch resumes:', err);
      } finally {
        setResumesLoading(false);
      }
    };
    
    fetchResumes();
  }, []);

  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      if (!selectedResumeId) {
        setRecommendedJobs([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const jobs = await jobService.getRecommendedJobs(selectedResumeId);
        setRecommendedJobs(jobs);
      } catch (err: any) {
        console.error('Error fetching recommended jobs:', err);
        setError(err.message || 'Failed to fetch job recommendations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendedJobs();
  }, [selectedResumeId]);

  const isJobSaved = (jobId: string) => {
    return savedJobs.some(job => job.id === jobId);
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedResumeId(value || null);
  };

  const renderContent = () => {
    if (resumesLoading) {
      return (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your resumes...</p>
        </div>
      );
    }

    if (resumes.length === 0) {
      return (
        <div className="text-center py-10 bg-gray-50 rounded">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes found</h3>
          <p className="text-gray-600 mb-4">
            Upload or create a resume to get personalized job recommendations
          </p>
          <a
            href="/resumes/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create Resume
          </a>
        </div>
      );
    }

    if (!selectedResumeId) {
      return (
        <div className="text-center py-10 bg-gray-50 rounded">
          <p className="text-gray-600">
            Please select a resume to see personalized job recommendations
          </p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Finding jobs that match your resume...</p>
        </div>
      );
    }

    if (error) {
      return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;
    }

    if (recommendedJobs.length === 0) {
      return (
        <div className="text-center py-10 bg-gray-50 rounded">
          <p className="text-gray-600">
            No matching jobs found for your selected resume. Try updating your resume with more skills.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {recommendedJobs.map(job => (
          <div key={job.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                <div className="flex items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Source: {job.source || 'Job Board'}
                  </p>
                  {job.matchScore && (
                    <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                      job.matchScore >= 80 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {job.matchScore}% Match
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => isJobSaved(job.id) ? onUnsaveJob(job.id) : onSaveJob(job)}
                className="p-1 rounded hover:bg-gray-50"
              >
                {isJobSaved(job.id) ? (
                  <BookmarkCheck className="h-4 w-4 text-indigo-600" />
                ) : (
                  <Bookmark className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-700 line-clamp-2">{job.description}</p>
            <div className="mt-2 flex justify-end">
              <a 
                href={job.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                View Job
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Recommended Jobs</h2>
        {resumes.length > 0 && (
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-2">Select resume: </span>
            <select
              value={selectedResumeId || ''}
              onChange={handleResumeChange}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="">-- Select a resume --</option>
              {resumes.map(resume => (
                <option key={resume.id} value={resume.id}>{resume.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {renderContent()}
    </div>
  );
};

export default RecommendedJobs;
