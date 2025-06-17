import React, { useState, useEffect } from 'react';
import { Search, Plus, Bookmark, BookmarkCheck, Star, Download } from 'lucide-react';
import jobService, { JobListing } from '../services/jobService';
import RecommendedJobs from '../components/jobs/RecommendedJobs';

const Jobs = () => {
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search');

  // Fetch saved jobs when component mounts
  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const data = await jobService.getSavedJobs();
        setSavedJobs(data);
      } catch (err) {
        console.error("Error fetching saved jobs:", err);
      }
    };

    fetchSavedJobs();
  }, []);

  // Handle job search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeywords.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      // Split the keywords string into an array
      const keywords = searchKeywords
        .split(',')
        .map(kw => kw.trim())
        .filter(kw => kw);
      
      const results = await jobService.searchJobs(keywords);
      setJobs(results);
    } catch (err: any) {
      console.error("Error searching jobs:", err);
      setError(err.message || "Failed to search for jobs");
    } finally {
      setLoading(false);
    }
  };

  // Handle saving a job
  const handleSaveJob = async (job: JobListing) => {
    try {
      await jobService.saveJob(job);
      setSavedJobs([...savedJobs, job]);
    } catch (err) {
      console.error("Error saving job:", err);
    }
  };

  // Handle removing a saved job
  const handleUnsaveJob = async (jobId: string) => {
    try {
      await jobService.unsaveJob(jobId);
      setSavedJobs(savedJobs.filter(job => job.id !== jobId));
    } catch (err) {
      console.error("Error removing saved job:", err);
    }
  };

  // Check if a job is saved
  const isJobSaved = (jobId: string) => {
    return savedJobs.some(job => job.id === jobId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Job Matches</h1>
        <div className="space-x-2">
          {/*<button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            Save Search
          </button>*/}
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Upload Resume
          </button>
        </div>
      </div>

      {/* Recommended Jobs Section */}
      <RecommendedJobs 
        onSaveJob={handleSaveJob}
        onUnsaveJob={handleUnsaveJob}
        savedJobs={savedJobs}
      />

      <div className="mb-6">
        <div className="flex border-b">
          <button 
            className={`py-2 px-4 ${activeTab === 'search' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('search')}
          >
            Search Jobs
          </button>
          <button 
            className={`py-2 px-4 ${activeTab === 'saved' ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved Jobs ({savedJobs.length})
          </button>
        </div>
      </div>

      {activeTab === 'search' ? (
        <>
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchKeywords}
                  onChange={(e) => setSearchKeywords(e.target.value)}
                  placeholder="Enter job keywords (e.g. developer, remote, React)"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">Separate multiple keywords with commas</p>
          </form>

          {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Searching for jobs...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map(job => (
                <div key={job.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{job.title}</h2>
                      <p className="text-gray-600">{job.company} • {job.location}</p>
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-gray-500">
                          Posted: {job.postedDate || 'Unknown'} • Source: {job.source || 'Job Board'}
                        </p>
                        {job.matchScore && (
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                            job.matchScore >= 80 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {job.matchScore}% Match
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => isJobSaved(job.id) ? handleUnsaveJob(job.id) : handleSaveJob(job)}
                      className="p-2 rounded hover:bg-gray-50"
                    >
                      {isJobSaved(job.id) ? (
                        <BookmarkCheck className="h-5 w-5 text-indigo-600" />
                      ) : (
                        <Bookmark className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="mt-4 text-gray-700 line-clamp-3">{job.description}</p>
                  <div className="mt-4 flex justify-end">
                    <a 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Apply Now
                    </a>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && !loading && !error && (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No jobs found. Try different search keywords.</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          {savedJobs.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-600">You haven't saved any jobs yet.</p>
            </div>
          ) : (
            savedJobs.map(job => (
              <div key={job.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{job.title}</h2>
                    <p className="text-gray-600">{job.company} • {job.location}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Posted: {job.postedDate || 'Unknown'} • Source: {job.source || 'Job Board'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnsaveJob(job.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                  >
                    Remove
                  </button>
                </div>
                <p className="mt-4 text-gray-700">{job.description}</p>
                <div className="mt-4 flex justify-end">
                  <a 
                    href={job.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Jobs;