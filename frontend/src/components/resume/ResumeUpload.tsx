import React, { useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import resumeService from '../../services/resumeService';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/authSlice';

interface ResumeUploadProps {
  onUploadSuccess?: (data: any) => void;
  onUploadProgress?: (progress: number) => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ 
  onUploadSuccess, 
  onUploadProgress 
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const handleFile = async (selectedFile: File) => {
    if (!selectedFile) return;
    
    // Check authentication first
    if (!isAuthenticated) {
      setError('You must be logged in to upload a resume');
      return;
    }
    
    // Reset state
    setError(null);
    setIsUploading(true);
    
    try {
      // Check file size
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      const fileExtension = selectedFile.name.toLowerCase().split('.').pop();
      if (!allowedTypes.includes(selectedFile.type) && 
          !['pdf', 'doc', 'docx'].includes(fileExtension || '')) {
        throw new Error('Invalid file type. Please upload a PDF or Word document');
      }

      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('type', selectedFile.type); // Add file type explicitly
      
      // Upload the resume to the /api/resumes/parse endpoint
      const result = await resumeService.parseResume(formData, (progressEvent) => {
        // Calculate and report upload progress if the callback is provided
        if (onUploadProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(progress);
        }
      });
      
      if (onUploadSuccess && result) {
        // The API response should contain atsScore, keywords, skills etc.
        onUploadSuccess(result);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="resume-upload"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleChange}
          className="hidden"
          disabled={isUploading}
        />
        
        <label 
          htmlFor="resume-upload"
          className="cursor-pointer flex flex-col items-center justify-center"
        >
          <Upload className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-xl font-medium text-gray-700 mb-1">
            {isUploading ? 'Uploading...' : 'Drag & drop your resume here'}
          </p>
          <p className="text-sm text-gray-500 mb-3">
            or click to browse (PDF, DOC, DOCX)
          </p>
          <button
            type="button"
            onClick={() => document.getElementById('resume-upload')?.click()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            disabled={isUploading}
          >
            {isUploading ? 'Processing...' : 'Select File'}
          </button>
        </label>
        
        {file && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md flex items-center justify-between">
            <span className="text-sm text-gray-700 truncate max-w-xs">
              {file.name}
            </span>
            {!isUploading && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        
        {isUploading && (
          <div className="mt-4">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Analyzing resume content...</p>
          </div>
        )}
      </div>
    </div>
  );
};
