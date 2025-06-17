import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FileText, Zap, Upload, X, Check, Plus } from 'lucide-react';
import type { RootState } from '../store';
import { LoadingState, initialLoadingState } from '../types/loading';
import jobService from '../services/jobService';
import resumeService, { Resume, getUserResumes } from '../services/resumeService';
import { ResumeUpload } from '../components/resume/ResumeUpload';
import { setCredentials } from '../store/authSlice';
import authService from '../services/authService';

interface DashboardMetrics {
  activeResumes: number;
  averageATSScore: number;
}

interface RecentActivity {
  id: string;
  type: 'resume' | 'application' | 'ats';
  description: string;
  timestamp: string;
}

interface OptimizationTip {
  id: string;
  type: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

interface Job {
  id: string | number;
  title: string;
  company: string;
  location: string;
  url: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [{ isLoading, error }, setLoadingState] = useState<LoadingState>(initialLoadingState);
  const [userResumes, setUserResumes] = useState<Resume[]>([]);
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  
  // Resume upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    atsScore?: number;
    keywords?: string[];
    skills?: string[];
  } | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingState({ isLoading: true, error: null });
      try {
        // If we have a token but no user data, fetch the user data
        if (token && !user) {
          try {
            const userData = await authService.getCurrentUser();
            if (userData) {
              dispatch(setCredentials({ 
                user: userData, 
                token 
              }));
            }
          } catch (userError) {
            console.error('Failed to fetch user data:', userError);
          }
        }

        // Fetch resumes
        const resumesResponse = await getUserResumes();
        setUserResumes(resumesResponse);

        // Fetch saved jobs
        try {
          const jobsResponse = await jobService.getSavedJobs();
          setSavedJobs(jobsResponse.slice(0, 3));
        } catch (jobsError) {
          console.error('Failed to fetch saved jobs:', jobsError);
          setSavedJobs([]);
        }

        setLoadingState({ isLoading: false, error: null });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setLoadingState({ 
          isLoading: false, 
          error: new Error('Failed to load dashboard data. Please try again later.') 
        });
      }
    };

    fetchDashboardData();
  }, [token, user, dispatch]);

  const metrics: DashboardMetrics = useMemo(() => {
    const latestResume = userResumes
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    return {
      activeResumes: userResumes.length,
      averageATSScore: latestResume?.atsScore || 0,
    };
  }, [userResumes]);

  const recentActivity = useMemo(() => 
    userResumes
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3)
      .map(resume => ({
        id: resume.id,
        type: 'resume' as const,
        description: `${resume.title} Updated`,
        timestamp: new Date(resume.updatedAt).toLocaleString(),
      })),
  [userResumes]);

  const optimizationTips = useMemo(() => {
    const tips: OptimizationTip[] = [];
    const latestResume = userResumes
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

    if (latestResume && latestResume.atsFeedback) {
      const feedbackLines = latestResume.atsFeedback.split('\n').filter(line => line.trim());
      feedbackLines.forEach((line, index) => {
        tips.push({
          id: `${latestResume.id}-${index}`,
          type: (latestResume.atsScore || 0) > 70 ? 'low' : 
                (latestResume.atsScore || 0) > 40 ? 'medium' : 'high',
          title: 'ATS Recommendation',
          description: line
        });
      });
    }

    // Add hardcoded optimization tips if we don't have any resume-specific ones
    if (tips.length === 0) {
      const hardcodedTips = [
        {
          id: 'tip-1',
          type: 'high' as const,
          title: 'Keyword Optimization',
          description: 'Include industry-specific keywords from the job description to improve ATS compatibility.'
        },
        {
          id: 'tip-2',
          type: 'medium' as const,
          title: 'Format Simplification',
          description: 'Use simple formatting and standard fonts to ensure ATS can properly parse your resume.'
        },
        {
          id: 'tip-3',
          type: 'medium' as const,
          title: 'Quantify Achievements',
          description: 'Use numbers and percentages to demonstrate your impact in previous roles.'
        },
        {
          id: 'tip-4',
          type: 'low' as const,
          title: 'Skills Section',
          description: 'Maintain an updated technical skills section that reflects your current capabilities.'
        },
        {
          id: 'tip-5',
          type: 'high' as const,
          title: 'Tailor Your Resume',
          description: 'Customize your resume for each job application to highlight relevant experience.'
        }
      ];
      return hardcodedTips.slice(0, 3);
    }

    return tips.slice(0, 3);
  }, [userResumes]);

  const handleUpload = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowUploadModal(true);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    setUploadResults(null);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
  };

  const handleUploadSuccess = async (data: {
    atsScore: number;
    keywords: string[];
    skills: string[];
    matchingJobs: any[];
  }) => {
    try {
      setIsUploading(true);
      setUploadProgress(90);
      
      const resumeData = {
        title: `Resume ${new Date().toLocaleDateString()}`,
        content: data.skills.join(', ') + '\n\n' + data.keywords.join(', '),
        atsScore: data.atsScore,
        keywords: data.keywords,
        skills: data.skills,
      };
      
      await resumeService.createResume(resumeData);
      
      setUploadProgress(100);
      setUploadSuccess(true);
      setUploadResults({
        atsScore: data.atsScore,
        keywords: data.keywords,
        skills: data.skills
      });
      
      setTimeout(() => {
        navigate('/resumes');
      }, 1500);
      
    } catch (err: any) {
      console.error('Error saving resume:', err);
      setUploadError(err.message || 'Failed to save resume data');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Error loading dashboard: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex space-x-2">
          <button 
            onClick={handleUpload}
            className="flex items-center px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload Resume
          </button>
          <Link to="/resumes/new" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Create New Resume
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Welcome back, {user ? `${user.firstName} ${user.lastName}` : 'User'}!</h2>
        <p className="text-gray-600">Track your job application progress, manage your resumes, and find new opportunities.</p>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50" onClick={closeUploadModal}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-gray-900">Upload Resume</h3>
              <button 
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={closeUploadModal}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {uploadSuccess && uploadResults ? (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center mb-3">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-green-700 font-medium">Resume uploaded successfully!</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ATS Score</p>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-900 mr-2">{uploadResults.atsScore}%</span>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${
                            (uploadResults.atsScore || 0) > 70 ? 'bg-green-500' : 
                            (uploadResults.atsScore || 0) > 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${uploadResults.atsScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {uploadResults.keywords && uploadResults.keywords.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Keywords Detected</p>
                      <div className="flex flex-wrap gap-2">
                        {uploadResults.keywords.map((keyword, index) => (
                          <span 
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploadResults.skills && uploadResults.skills.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Skills Detected</p>
                      <div className="flex flex-wrap gap-2">
                        {uploadResults.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-3">Redirecting to Resumes page...</p>
              </div>
            ) : (
              <ResumeUpload onUploadSuccess={handleUploadSuccess} />
            )}

            <div className="flex justify-end space-x-3 mt-4">
              <button 
                type="button"
                onClick={closeUploadModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {uploadSuccess ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FileText className="h-10 w-10 text-indigo-600" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Resumes</h2>
              <p className="text-3xl font-bold text-gray-700">{metrics.activeResumes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Zap className="h-10 w-10 text-yellow-600" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">ATS Score</h2>
              <p className="text-3xl font-bold text-gray-700">
                {Math.round(metrics.averageATSScore)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link to="/resumes" className="text-indigo-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-md">
                  <FileText className="h-6 w-6 text-gray-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-gray-50 rounded-md text-center">
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Optimization Tips</h2>
          <div className="space-y-4">
            {optimizationTips.length > 0 ? (
              optimizationTips.map((tip) => (
                <div key={tip.id} className="flex items-center p-4 bg-gray-50 rounded-md">
                  <Zap className="h-6 w-6 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{tip.title}</p>
                    <p className="text-sm text-gray-500">{tip.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-gray-50 rounded-md text-center">
                <p className="text-sm text-gray-500">No optimization tips available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Saved Jobs</h2>
          <Link to="/jobs" className="text-indigo-600 hover:underline">View All</Link>
        </div>
        
        {savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savedJobs.map(job => (
              <div key={job.id} className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold text-md mb-1">{job.title}</h3>
                <p className="text-sm text-gray-700 mb-2">{job.company} • {job.location}</p>
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 text-sm hover:underline"
                >
                  View Job
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-md text-center">
            <p className="text-gray-600 mb-4">You haven't saved any jobs yet.</p>
            <Link 
              to="/jobs"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              Browse Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;