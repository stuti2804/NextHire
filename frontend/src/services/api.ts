import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Extended interface for custom methods
interface ExtendedAxiosInstance extends AxiosInstance {
  checkAuthState: () => boolean;
  testConnection: () => Promise<boolean>;
  getBaseUrl: () => string; // Add this new method to the interface
}

// Create an Axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000 // 30 seconds default timeout
}) as ExtendedAxiosInstance;

// Request interceptor to add auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log the request with auth headers (but hide the actual token)
      console.log(`${config.method?.toUpperCase()} ${config.url} [Authenticated] with token: ${token.substring(0, 10)}...`);
      console.log('Request headers:', JSON.stringify(config.headers));
    } else {
      console.log(`${config.method?.toUpperCase()} ${config.url} [Unauthenticated] - No token found`);
    }
    
    // Log the full URL being requested
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.log(`Making request to: ${fullUrl}`);
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Enhanced logging for response data
    console.log(`Response from ${response.config.url}:`, {
      status: response.status,
      statusText: response.statusText,
      dataPreview: response.data ? (Array.isArray(response.data) ? 
        `Array with ${response.data.length} items` : 
        'Data received') : 'No data'
    });
    
    // For debugging empty arrays specifically - add detailed info
    if (Array.isArray(response.data) && response.data.length === 0 && response.config.url?.includes('/resumes')) {
      console.warn('⚠️ Empty resumes array received. This may indicate an issue with:', [
        '- Authentication token validity',
        '- User ID mismatch',
        '- Database connectivity',
        '- No resumes actually exist for this user'
      ].join('\n'));
      
      // Log potential auth token issues
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          console.log('Current token payload:', tokenData);
          
          // Check token expiration
          const nowInSeconds = Math.floor(Date.now() / 1000);
          if (tokenData.exp && tokenData.exp < nowInSeconds) {
            console.error('Token is expired! Expiry:', new Date(tokenData.exp * 1000).toLocaleString());
          }
        } catch (err) {
          console.error('Could not parse token payload:', err);
        }
      }
    }
    
    return response;
  },
  (error: AxiosError) => {
    // Log detailed error information
    console.error('API Error:', {
      endpoint: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      headers: error.config?.headers,
      data: error.response?.data
    });
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Don't redirect during token verification or login attempts
      const isAuthRequest = error.config?.url?.includes('/auth/');
      const isOnLoginPage = window.location.pathname.includes('/login');
      
      if (!isAuthRequest && !isOnLoginPage) {
        console.log('Authentication error detected, redirecting to login');
        
        // Prevent multiple redirects by checking if we're already handling a redirect
        if (!window.isRedirectingToLogin) {
          window.isRedirectingToLogin = true;
          
          // Store the current path to redirect back after login
          const currentPath = window.location.pathname;
          if (currentPath !== '/login') {
            localStorage.setItem('redirectAfterLogin', currentPath);
          }
          
          // Clear auth data
          localStorage.removeItem('token');
          
          // Use a more controlled redirect approach
          setTimeout(() => {
            window.location.href = '/login?session=expired';
            window.isRedirectingToLogin = false;
          }, 100);
        }
      }
    }
    
    // Improve error message for common status codes
    if (error.response?.status === 404) {
      console.error('❌ API endpoint not found:', error.config?.url);
    } else if (error.response?.status === 500) {
      console.error('❌ Server error:', error.response.data);
    } else if (!error.response) {
      console.error('❌ Network error - server might be down');
    }
    
    return Promise.reject(error);
  }
);

// Add utility functions to help with debugging
api.checkAuthState = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No authentication token found');
    return false;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const nowInSeconds = Math.floor(Date.now() / 1000);
    
    console.log('Token information:', {
      userId: payload.userId || payload.id || payload.sub,
      expired: payload.exp < nowInSeconds,
      expiresIn: payload.exp ? `${payload.exp - nowInSeconds} seconds` : 'unknown',
      issuer: payload.iss || 'not specified'
    });
    
    return payload.exp > nowInSeconds;
  } catch (e) {
    console.error('Invalid token format:', e);
    return false;
  }
};

// Add method to test API connectivity
api.testConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('API connection test:', {
      success: true,
      status: response.status,
      data: response.data
    });
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

// Add method to get base URL
api.getBaseUrl = () => {
  return api.defaults.baseURL || '/api';
};

export default api;
