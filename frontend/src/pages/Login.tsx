import React, { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, Github, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { setLoading, setError, setCredentials } from '../store/authSlice';
import type { RootState, AppDispatch } from '../store';
import authService from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  // Add this new useEffect for authentication check
  useEffect(() => {
    // Only try to verify token if we're not already showing a session expired message
    const urlParams = new URLSearchParams(window.location.search);
    const sessionExpired = urlParams.get('session') === 'expired';
    
    if (sessionExpired) {
      dispatch(setError('Your session has expired. Please login again.'));
      // Clean up URL and token
      localStorage.removeItem('token');
      window.history.replaceState({}, document.title, '/login');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      // Set loading state while verifying
      dispatch(setLoading(true));
      
      // If token exists, verify it and redirect
      authService.verifyToken(token)
        .then((response) => {
          console.log('Token verified successfully, redirecting to dashboard');
          dispatch(setCredentials({
            user: {
              ...response.user,
              preferences: response.user.preferences || {
                theme: 'light',
                emailNotifications: true,
                jobAlerts: true
              }
            },
            token: response.token || token
          }));
          navigate('/');
        })
        .catch((err) => {
          console.error('Token verification failed:', err);
          // Invalid token - remove it but don't automatically show error
          localStorage.removeItem('token');
          dispatch(setLoading(false));
        });
    }
  }, [navigate, dispatch]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  
  // Clear errors when component mounts or when inputs change
  useEffect(() => {
    if (error) {
      dispatch(setError(null));
    }
  }, [formData, dispatch, error]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    // Removed length validation since backend might have different requirements

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      dispatch(setLoading(true));
      dispatch(setError(null)); // Clear previous errors
      
      // Use the authService instead of direct fetch
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      
      // Store user data in Redux
      dispatch(setCredentials({
        user: {
          ...response.user,
          preferences: response.user.preferences || {
            theme: 'light',
            emailNotifications: true,
            jobAlerts: true
          }
        },
        token: response.token
      }));
      
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      // Display a user-friendly error message
      const errorMessage = err.message || 'Failed to login. Please check your credentials.';
      
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <FileText className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    validationErrors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {validationErrors.email && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    validationErrors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button 
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {validationErrors.password && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <Github className="h-5 w-5" />
                <span className="ml-2">GitHub</span>
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <Mail className="h-5 w-5 text-red-500" />
                <span className="ml-2">Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;