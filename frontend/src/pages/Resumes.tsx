import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Plus, Search, Edit, Trash2, Upload, X, AlertCircle, Check, Save } from 'lucide-react';
import resumeService, { Resume } from '../services/resumeService';
import { ResumeUpload } from '../components/resume/ResumeUpload';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/authSlice';
import api from '../services/api';

const Resumes = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for inline title editing
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    // Check API connectivity first
    api.testConnection().then(isConnected => {
      if (isConnected) {
        console.log("API server is reachable");
        fetchResumes();
      } else {
        setError("Unable to connect to the API server. Please check your connection.");
        setLoading(false);
      }
    });
  }, []);

  const fetchResumes = async () => {
    try {
      console.log('Starting to fetch resumes');
      setLoading(true);
      setError(null);
      
      // Check authentication state
      const isTokenValid = api.checkAuthState();
      console.log('Is authentication token valid:', isTokenValid);
      
      if (!isTokenValid) {
        console.warn('Authentication token is invalid or expired');
        setError('Authentication session expired. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      // Make API call with detailed error handling
      try {
        const data = await resumeService.getAllResumes();
        console.log('Resumes fetched successfully:', data);
        
        if (Array.isArray(data)) {
          // If we get an empty array, let's provide more helpful information
          if (data.length === 0) {
            console.log('No resumes found. This could be normal if you haven\'t created any resumes yet.');
          }
          
          setResumes(data);
          console.log(`Set ${data.length} resumes in state`);
        } else {
          console.error('Expected array of resumes but got:', data);
          setError('Invalid data format received from server');
        }
      } catch (fetchError: any) {
        throw fetchError; // Pass to outer catch block
      }
    } catch (err: any) {
      console.error('Failed to fetch resumes:', err);
      
      // More detailed error handling
      if (err.response) {
        console.error('Error response:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        
        if (err.response.status === 401) {
          setError('Authentication error. Please log in again.');
          // Give user time to read the error before redirecting
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(`Failed to fetch resumes: ${err.response.data?.message || err.message}`);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('No response from server. Please check your internet connection.');
      } else {
        setError('Failed to fetch resumes. Please try again later.');
      }
    } finally {
      setLoading(false);
      console.log('Finished resume fetch attempt');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await resumeService.deleteResume(id);
        setResumes(resumes.filter(resume => resume.id !== id));
      } catch (err) {
        console.error('Failed to delete resume:', err);
        setError('Failed to delete resume. Please try again.');
      }
    }
  };

  const handleCreateNew = () => {
    navigate('/resumes/new');
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input change detected");
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name);
      handleFileSelect(file);
    }
  };

  const handleFileSelect = async (file: File) => {
    setShowUploadModal(true);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    setUploadResults(null);
    setIsUploading(true);

    try {
      // Validate file
      if (!file) {
        throw new Error("Please select a file");
      }

      // Validate file size
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error("File size exceeds 10MB limit");
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const fileExtension = file.name.toLowerCase().split(".").pop();
      const isValidType =
        allowedTypes.includes(file.type) ||
        ["pdf", "doc", "docx"].includes(fileExtension || "");

      if (!isValidType) {
        throw new Error(
          "Invalid file type. Please upload a PDF or Word document"
        );
      }

      const formData = new FormData();
      formData.append("resume", file, file.name); // Include filename
      formData.append("type", file.type); // Include file type

      const response = await resumeService.parseResume(formData);

      if (!response || !response.atsScore) {
        throw new Error("Invalid response from server");
      }
      console.log("QQQQQQQQQQQ:", response);
      await handleUploadSuccess(response);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(
        err.message || "Failed to upload resume. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const closeUploadModal = () => {
    console.log("Closing upload modal");
    setShowUploadModal(false);
  };

  const handleUploadSuccess = async (data: {
    success: boolean;
    resumeId: string;
    atsScore: number;
    keywords: string[];
    skills: string[];
    saved: boolean;
    resumeUrl: string;
  }) => {
    try {
      if (!isAuthenticated) {
        throw new Error("Please log in to save your resume");
      }

      setIsUploading(true);
      setUploadProgress(90);

      // Since the resume is already saved in the backend during parsing,
      // we just need to refresh our list of resumes
      console.log("Resume upload successful:", data);
      
      // Update UI with the results
      setUploadProgress(100);
      setUploadSuccess(true);
      setUploadResults({
        atsScore: data.atsScore,
        keywords: data.keywords || [],
        skills: data.skills || [],
      });

      // Refresh the resume list to include the new resume
      await fetchResumes();

      // Close modal after 3 seconds
      setTimeout(() => {
        setShowUploadModal(false);
        // Reset states after closing
        setTimeout(() => {
          setUploadSuccess(false);
          setUploadProgress(0);
          setUploadResults(null);
        }, 300);
      }, 3000);
    } catch (err: any) {
      console.error("Error processing resume:", err);
      if (err.message.includes("Authentication")) {
        navigate("/login", { state: { from: "/resumes" } });
      } else {
        setUploadError(err.message || "Failed to process resume data");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Function to start editing a resume title
  const startEditingTitle = (resume: Resume) => {
    setEditingResumeId(resume.id);
    setEditingTitle(resume.title);
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, 0);
  };

  // Function to save a resume title after editing
  const saveResumeTitle = async () => {
    if (!editingResumeId) return;
    
    try {
      const resumeToUpdate = resumes.find(r => r.id === editingResumeId);
      if (!resumeToUpdate) return;
      
      const updatedResume = await resumeService.updateResume(editingResumeId, {
        ...resumeToUpdate,
        title: editingTitle
      });
      
      setResumes(prevResumes => 
        prevResumes.map(resume => 
          resume.id === editingResumeId ? {...resume, title: editingTitle} : resume
        )
      );
      
      setEditingResumeId(null);
    } catch (err) {
      console.error('Failed to update resume title:', err);
      setError('Failed to update resume title. Please try again.');
    }
  };

  // Function to handle pressing Enter while editing
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveResumeTitle();
    } else if (e.key === 'Escape') {
      setEditingResumeId(null);
    }
  };

  const filteredResumes = searchQuery
    ? resumes.filter(resume => 
        resume.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : resumes;

  // Update function to open/download the resume file
  const openResumeFile = async (resumeId: string) => {
    if (!resumeId) return;
    
    try {
      // Show loading state
      setError(null);
      
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      // Create a direct API call with authentication
      const baseUrl = api.getBaseUrl();
      const fileUrl = `${baseUrl}/resumes/${resumeId}/file`;
      
      // Use fetch with authentication headers
      const response = await fetch(fileUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      
      // Get the blob from response
      const blob = await response.blob();
      
      // Create object URL and open in new tab
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank');
      
      // Clean up object URL after a short delay
      setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
      
    } catch (err: any) {
      console.error('Error fetching resume file:', err);
      setError(`Failed to open resume: ${err.message}`);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">Unable to load your resumes</h3>
        </div>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => fetchResumes()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-md transition-colors"
          >
            Try again
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleUpload(e);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
          >
            Upload a resume
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">My Resumes</h1>
          <div className="flex space-x-2">
            <button 
              onClick={() => api.testConnection().then(() => fetchResumes())}
              className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              title="Test connection and refresh"
            >
              Refresh
            </button>
            <button 
              onClick={handleCreateNew}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Resume
            </button>
          </div>
        </div>

        {/* Search and Actions - removed filter button */}
        <div className="flex space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search resumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {/* Removed filter button here */}
          <button 
            onClick={handleUpload}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload
          </button>
        </div>

        {/* Content */}
        {filteredResumes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No resumes found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? "No resumes match your search criteria" : "Start by creating your first resume"}
            </p>
            {!searchQuery && (
              <div className="space-x-4">
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Resume
                </button>
                <button
                  onClick={handleUpload}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm bg-white hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload Resume
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ATS Score</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResumes.map((resume) => (
                  <tr key={resume.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {/* Update the file icon to be clickable and have a hover effect */}
                        <span title="View resume file">
                          <FileText 
                            className="h-5 w-5 text-gray-400 mr-3 cursor-pointer hover:text-blue-500 transition-colors" 
                            onClick={() => openResumeFile(resume.id)}
                          />
                        </span>
                        {editingResumeId === resume.id ? (
                          <div className="flex items-center">
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={saveResumeTitle}
                              className="text-sm font-medium text-gray-900 border-b border-indigo-500 focus:outline-none"
                            />
                            <button 
                              onClick={saveResumeTitle}
                              className="ml-2 text-indigo-600 hover:text-indigo-800"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{resume.title}</span>
                            <button 
                              onClick={() => startEditingTitle(resume)}
                              className="ml-2 text-gray-400 hover:text-indigo-600"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(resume.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">{resume.atsScore || 0}%</span>
                        <div className="ml-2 w-16 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${resume.atsScore || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      {/* Direct action icons instead of dropdown */}
                      <div className="flex items-center justify-end space-x-2">
                        {/* Edit icon/functionality commented out
                        <Link 
                          to={`/resumes/${resume.id}/edit`}
                          className="text-gray-400 hover:text-indigo-600 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        */}
                        <button 
                          onClick={() => handleDelete(resume.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-50" onClick={closeUploadModal}></div>
            <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
              {/* Modal Header */}
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
                </div>
              ) : (
                <ResumeUpload onUploadSuccess={handleUploadSuccess} />
              )}

              {/* Action Buttons */}
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
      </div>
    </>
  );
};

export default Resumes;