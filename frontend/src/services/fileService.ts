import api from './api';

const fileService = {
  uploadFile: async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('type', type);
    
    // Using the resume parse endpoint as it's the only file upload endpoint available
    const response = await api.post('/resumes/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  downloadFile: async (resumeId: string) => {
    // Using the resume file content endpoint
    const response = await api.get(`/resumes/${resumeId}/file`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default fileService;
