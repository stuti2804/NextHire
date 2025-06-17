import api from './api';

export interface Resume {
  id: string;
  title: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
  atsScore?: number;
  keywords?: string[];
  skills?: string[];
  fileName?: string;
  fileType?: string;
  hasAnalysis?: boolean;
  analysisId?: string;
  atsFeedback?: string;
  rawText?: string;
}

export interface ResumeData {
  title: string;
  content?: string;
  atsScore?: number;
  keywords?: string[];
  skills?: string[];
}

// Add the missing function that's being imported in Dashboard.tsx
export const getUserResumes = async (): Promise<Resume[]> => {
  return resumeService.getAllResumes();
};

const resumeService = {
  getAllResumes: async (): Promise<Resume[]> => {
    try {
      console.log('Fetching all resumes');
      // Log the auth token being used (safe version)
      const token = localStorage.getItem('token');
      console.log('Using auth token:', token ? `${token.substring(0, 15)}...` : 'No token');
      
      // Send additional debug header - this won't affect the request but can help with debugging
      const response = await api.get('/resumes', {
        headers: {
          'X-Debug-Info': 'resume-fetch-request'
        }
      });
      
      console.log('Resume fetch response:', response);
      
      // Additional validation of the response
      if (!Array.isArray(response.data)) {
        console.error('Expected array but got:', typeof response.data);
        throw new Error('Invalid response format');
      }
      
      // Log each resume ID received to help with debugging
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('Received resume IDs:', response.data.map(r => r.id).join(', '));
      } else {
        console.warn('Received empty resumes array from server');
        
        // Test a direct fetch to verify access
        try {
          const healthCheck = await api.get('/health');
          console.log('Health check during empty resumes:', healthCheck.data);
        } catch (healthError) {
          console.error('Health check failed during empty resumes fetch:', healthError);
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch resumes:', error);
      // Add more detailed error logging
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      // Try to determine if this is an auth issue
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('Authentication issue detected. Token might be invalid.');
        // Clear token if authentication failed
        localStorage.removeItem('token');
      }
      
      throw error;
    }
  },

  getResume: async (id: string): Promise<Resume> => {
    try {
      console.log(`Fetching resume with ID: ${id}`);
      const response = await api.get(`/resumes/${id}`);
      console.log('Resume data received:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch resume ${id}:`, error);
      throw error;
    }
  },

  createResume: async (resumeData: ResumeData): Promise<Resume> => {
    try {
      // The API doesn't have a direct endpoint for creating resumes without file uploads
      // We should use the parse endpoint with a FormData object instead
      const formData = new FormData();
      const blob = new Blob([JSON.stringify(resumeData)], { type: 'application/json' });
      formData.append('data', blob, 'data.json');
      
      const response = await api.post('/resumes/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Resume creation failed:', error);
      throw error;
    }
  },

  updateResume: async (id: string, resumeData: Partial<ResumeData>): Promise<Resume> => {
    // The backend only supports updating the title, so we'll extract just that
    try {
      const response = await api.patch(`/resumes/${id}`, { 
        title: resumeData.title 
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to update resume ${id}:`, error);
      throw error;
    }
  },

  deleteResume: async (id: string): Promise<void> => {
    try {
      console.log(`Deleting resume with ID: ${id}`);
      await api.delete(`/resumes/${id}`);
      console.log(`Resume ${id} deleted successfully`);
    } catch (error) {
      console.error(`Failed to delete resume ${id}:`, error);
      throw error;
    }
  },

  parseResume: async (formData: FormData, onProgress?: (progressEvent: any) => void): Promise<any> => {
    try {
      console.log('Parsing resume with form data', formData);
      // Make sure file size doesn't exceed limit
      const file = formData.get('resume') as File;
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      const fileExtension = file.name.toLowerCase().split('.').pop();
      if (!allowedTypes.includes(file.type) && 
          !['pdf', 'doc', 'docx'].includes(fileExtension || '')) {
        throw new Error('Invalid file type. Please upload a PDF or Word document');
      }

      try {
        // Get the authentication token
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required. Please log in.');
        }

        // Use the correct endpoint according to the API routes
        const response = await api.post(
          "/resumes/parse",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
              Authorization: `Bearer ${token}` // Explicitly add the auth token
            },
            timeout: 120000, // 2 minutes timeout for large files
            onUploadProgress: onProgress,
          }
        );

        if (!response.data) {
          throw new Error("No data received from server");
        }

        console.log('Resume parse response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Resume parse error:', error);
        // Get detailed error information
        const errorResponse = error.response?.data;
        const errorMessage = errorResponse?.error || errorResponse?.details || errorResponse?.message || error.message;
        console.error('Detailed error:', errorResponse);
        
        if (error.response?.status === 500) {
          throw new Error(`Server error while parsing resume: ${errorMessage}`);
        }
        if (error.response?.status === 413) {
          throw new Error('File size too large. Please upload a smaller file.');
        }
        if (error.response?.status === 415) {
          throw new Error('Unsupported file type. Please upload a PDF or Word document.');
        }
        throw new Error(errorMessage || 'An error occurred while parsing the resume');
      }
    } catch (error: any) {
      console.error('Resume parse validation error:', error);
      throw error;
    }
  }
};

export default resumeService;
