import api from './api';
import axios, { AxiosError } from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }
}

const authService = {
  login: async (credentials: LoginCredentials) => {
    console.log('Login attempt:', { email: credentials.email, timestamp: new Date().toISOString() });
    try {
      console.log('Attempting login with:', { email: credentials.email });
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: unknown) {
      console.error('Login failed:', error);
      
      // Type guard to check if error is an AxiosError
      if (axios.isAxiosError(error)) {
        // The server responded with an error status
        if (error.response) {
          // Extract error message properly from different response formats
          let errorMessage = 'Authentication failed';
          
          if (error.response.data) {
            if (typeof error.response.data === 'string') {
              errorMessage = error.response.data;
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message;
            } else if (error.response.data.error) {
              errorMessage = error.response.data.error;
            } else if (error.response.data.status === 'error' && error.response.data.message) {
              errorMessage = error.response.data.message;
            }
          }
          
          console.log('Server returned error:', errorMessage);
          throw new Error(errorMessage);
        } else if (error.request) {
          // The request was made but no response was received
          throw new Error('Cannot connect to server. Please make sure the backend server is running.');
        }
      }
      // For other types of errors
      throw new Error('An unexpected error occurred');
    }
  },
  
  register: async (userData: RegisterData) => {
    console.log('Registration attempt:', { 
      email: userData.email, 
      firstName: userData.firstName,
      timestamp: new Date().toISOString()
    });
    try {
      console.log('Attempting registration with:', { email: userData.email, firstName: userData.firstName });
      const response = await api.post<AuthResponse>('/auth/register', userData);
      return response.data;
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      
      // Type guard to check if error is an AxiosError
      if (axios.isAxiosError(error)) {
        // The server responded with an error status
        if (error.response) {
          const errorMessage = error.response.data.message || 'Registration failed';
          throw new Error(errorMessage);
        } else if (error.request) {
          // The request was made but no response was received
          throw new Error('Cannot connect to server. Please make sure the backend server is running.');
        }
      }
      // For other types of errors
      throw new Error('An unexpected error occurred');
    }
  },
  
  logout: () => {
    console.log('Logging out user, clearing token');
    localStorage.removeItem('token');
  },
  
  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    console.log('Getting current user. Token exists:', !!token);
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    try {
      // Ensure the token is included in the request header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await api.get('/users/me');
      console.log('Full response object:', response);
      
      if (!response.data || !response.data.data || !response.data.data.user) {
        console.error('Unexpected API response structure:', response.data);
        throw new Error('Invalid user data in response');
      }
      
      // Extract the user object from the response
      const userData = response.data.data.user;
      console.log('User data extracted:', userData);
      
      // Return the user object in the format expected by the Redux store
      return {
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || '',
        avatar: userData.avatar || '',
      };
    } catch (error) {
      console.error('Error fetching current user:', error);
      // Clear invalid token
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
      }
      throw error;
    }
  },
  
  updateProfile: async (profileData: UpdateProfileData) => {
    console.log('Updating user profile:', profileData);
    try {
      const response = await api.patch('/users/me', profileData);
      return response.data;
    } catch (error: unknown) {
      console.error('Profile update failed:', error);
      throw error;
    }
  },

  verifyToken: async (token: string) => {
    try {
      // First try to get current user info as a verification
      const response = await api.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Extract user data from the nested response structure
      const userData = response.data.data.user;
      
      // If we get user data back, the token is valid
      return {
        user: {
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          avatar: userData.avatar,
          phone: userData.phone
        },
        token
      };
    } catch (error: unknown) {
      console.error('Token verification failed:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid or expired token');
        }
      }
      throw new Error('Failed to verify token');
    }
  },

  changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    try {
      const response = await api.patch('/users/change-password', passwordData);
      return response.data;
    } catch (error: unknown) {
      console.error('Password change failed:', error);
      
      if (axios.isAxiosError(error)) {
        // Handle server response errors
        if (error.response) {
          const errorMessage = 
            error.response.data.message || 
            error.response.data.error || 
            'Failed to change password';
          throw new Error(errorMessage);
        } else if (error.request) {
          throw new Error('Cannot connect to server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred during password change');
    }
  },

  uploadAvatar: async (formData: FormData) => {
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  }
};

export default authService;
