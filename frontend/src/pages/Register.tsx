import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FileText, Github, Mail, AlertCircle } from 'lucide-react';
import { setCredentials } from '../store/authSlice';
import type { AppDispatch } from '../store';
import { LoadingState, initialLoadingState, handleAsyncOperation } from '../types/loading';
import authService from '../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [{ isLoading, error }, setLoadingState] = useState<LoadingState>(initialLoadingState);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    await handleAsyncOperation(
      async () => {
        // Update data structure to match the backend expectations
        const registerData = {
          firstName: formData.firstName,  // Correct casing to match backend
          lastName: formData.lastName,    // Correct casing to match backend
          email: formData.email,
          password: formData.password
        };
        
        const response = await authService.register(registerData);
        localStorage.setItem('token', response.token);
        
        // Transform user data to match expected User type in the store
        dispatch(setCredentials({
          user: {
            id: response.user.id,
            email: response.user.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            preferences: {
              theme: "light", // Default theme
              emailNotifications: true, // Default email notifications setting
              jobAlerts: true // Default job alerts setting
            }
          },
          token: response.token
        }));
        
        navigate('/');
      },
      (loading) => setLoadingState(prev => ({ ...prev, isLoading: loading })),
      (error) => setLoadingState(prev => ({ ...prev, error }))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <FileText className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            sign in to your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error.message}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                    validationErrors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {validationErrors.firstName && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                    validationErrors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {validationErrors.lastName && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                  validationErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.email && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                  validationErrors.password ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.password && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                  validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
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

export default Register;