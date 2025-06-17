import React, { useState, useEffect, useRef } from 'react';
import { User, Bell, Lock, Globe, Palette, Mail, AlertCircle, Eye, EyeOff, X, Check, Upload } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { LoadingState, initialLoadingState, handleAsyncOperation } from '../types/loading';
import authService from '../services/authService';
import { setCredentials } from '../store/authSlice';

interface SettingsFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Settings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [{ isLoading, error }, setLoadingState] = useState<LoadingState>(initialLoadingState);
  const [formData, setFormData] = useState<SettingsFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  
  // New state variables for modal functionality
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccess, setPhotoSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!dataFetched && token) {
        try {
          setLoadingState(prev => ({ ...prev, isLoading: true }));
          const userData = await authService.getCurrentUser();
          
          if (userData) {
            // Update Redux store with fetched user data
            dispatch(setCredentials({
              user: userData,
              token
            }));
            
            // Update form data with fetched values
            setFormData({
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: userData.email || '',
              phone: userData.phone || '',
              avatar: userData.avatar
            });
            
            setPhotoPreview(userData.avatar || null);
            setDataFetched(true);
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          setLoadingState(prev => ({ 
            ...prev, 
            error: error instanceof Error ? error : new Error('Failed to fetch user data')
          }));
        } finally {
          setLoadingState(prev => ({ ...prev, isLoading: false }));
        }
      }
    };
    
    fetchUserData();
  }, [token, dispatch, dataFetched]);

  // Update local form data when user data in the store changes
  useEffect(() => {
    if (user && !isLoading) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar
      });
      
      setPhotoPreview(user.avatar || null);
    }
  }, [user, isLoading]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (formData.phone && !/^\+?[\d-\s()]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!passwordFormData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordFormData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordFormData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    }
    
    if (!passwordFormData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Don't allow new password to be the same as current password
    if (passwordFormData.newPassword && 
        passwordFormData.currentPassword && 
        passwordFormData.newPassword === passwordFormData.currentPassword) {
      errors.newPassword = 'New password must be different from current password';
    }
    
    setValidationErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setIsDirty(true);
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear any existing errors when user types
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    setPasswordError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    await handleAsyncOperation(
      async () => {
        // Use authService to update user profile
        const updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          // Include avatar if it was changed
          ...(avatarChanged && { avatar: formData.avatar })
        };
        
        const response = await authService.updateProfile(updateData);
        
        // Update the Redux store with the updated user data
        if (user && response) {
          dispatch(setCredentials({
            user: {
              ...user,
              ...updateData
            },
            token: localStorage.getItem('token') || ''
          }));
        }

        setIsDirty(false);
        setAvatarChanged(false);
      },
      (loading) => setLoadingState(prev => ({ ...prev, isLoading: loading })),
      (error) => setLoadingState(prev => ({ ...prev, error }))
    );
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    setPasswordLoading(true);
    setPasswordError(null);
    
    try {
      await authService.changePassword({
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword
      });
      
      setPasswordSuccess('Password changed successfully');
      
      // Reset form after successful change
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Give user time to see success message before closing modal
      setTimeout(() => {
        setPasswordSuccess(null);
        setShowPasswordModal(false);
      }, 2000);
    } catch (error: any) {
      console.error('Failed to change password:', error);
      const errorMsg = error.message || 'Failed to change password. Please try again.';
      
      // Handle specific error cases
      if (errorMsg.includes('incorrect')) {
        setValidationErrors(prev => ({
          ...prev,
          currentPassword: 'Current password is incorrect'
        }));
      } else {
        setPasswordError(errorMsg);
      }
    } finally {
      setPasswordLoading(false);
    }
  };
  
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 800KB)
      if (file.size > 800 * 1024) {
        setPhotoError('Image exceeds maximum size of 800KB');
        return;
      }
      
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setPhotoError('Only JPG, PNG, and GIF images are allowed');
        return;
      }
      
      setPhotoFile(file);
      setPhotoError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          // Store the base64 data for the image
          const base64Image = e.target.result as string;
          setPhotoPreview(base64Image);
          
          // Update form data with the new avatar and mark as changed
          setFormData(prev => ({
            ...prev,
            avatar: base64Image
          }));
          setAvatarChanged(true);
          setIsDirty(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePhotoUpload = async () => {
    // Close the modal and let the main form submit handle the avatar update
    setPhotoSuccess('Photo selected successfully. Click "Save Changes" to update your profile.');
    setTimeout(() => {
      setPhotoSuccess(null);
      setShowPhotoModal(false);
    }, 2000);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <button
          onClick={handleSubmit}
          disabled={!isDirty || isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error.message}</span>
        </div>
      )}

      {isLoading && !user && (
        <div className="bg-white shadow rounded-lg p-6 flex justify-center">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-3"></div>
            <p>Loading user information...</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          <div className="bg-white shadow rounded-lg">
            <div className="p-6 space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h2>
                <div className="flex items-center">
                  <img
                    className="h-20 w-20 rounded-full object-cover"
                    src={formData.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                    alt="Profile"
                  />
                  <div className="ml-6">
                    <button 
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      onClick={() => setShowPhotoModal(true)}
                    >
                      Change Photo
                    </button>
                    <p className="mt-2 text-sm text-gray-500">
                      JPG, GIF or PNG. Max size of 800K
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      validationErrors.firstName ? 'border-red-300' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-indigo-500`}
                  />
                  {validationErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      validationErrors.lastName ? 'border-red-300' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-indigo-500`}
                  />
                  {validationErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      validationErrors.email ? 'border-red-300' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-indigo-500`}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      validationErrors.phone ? 'border-red-300' : 'border-gray-300'
                    } focus:border-indigo-500 focus:ring-indigo-500`}
                  />
                  {validationErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Security</h2>
              <div className="space-y-4">
                <button 
                  className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 text-gray-400" />
                    <span className="ml-3 text-sm text-gray-700">Change Password</span>
                  </div>
                  <span className="text-sm text-gray-500">→</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => !passwordLoading && setShowPasswordModal(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
              <button 
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={() => !passwordLoading && setShowPasswordModal(false)}
                disabled={passwordLoading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-700">{passwordSuccess}</span>
              </div>
            )}
            
            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{passwordError}</span>
              </div>
            )}
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPassword.current ? "text" : "password"}
                    value={passwordFormData.currentPassword}
                    onChange={handlePasswordInputChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm ${
                      validationErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-indigo-500 focus:border-indigo-500`}
                    disabled={passwordLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPassword.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.currentPassword}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword.new ? "text" : "password"}
                    value={passwordFormData.newPassword}
                    onChange={handlePasswordInputChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm ${
                      validationErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-indigo-500 focus:border-indigo-500`}
                    disabled={passwordLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPassword.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.newPassword}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordFormData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm ${
                      validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-indigo-500 focus:border-indigo-500`}
                    disabled={passwordLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPassword.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>
              
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => !passwordLoading && setShowPasswordModal(false)}
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => !photoLoading && setShowPhotoModal(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Update Profile Photo</h3>
              <button 
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={() => !photoLoading && setShowPhotoModal(false)}
                disabled={photoLoading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {photoSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-700">{photoSuccess}</span>
              </div>
            )}
            
            {photoError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{photoError}</span>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-md">
                {photoPreview ? (
                  <div className="relative w-full h-48 mb-4">
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="w-full h-full object-contain rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview(null);
                        setPhotoFile(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-gray-700"
                      disabled={photoLoading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    <Upload className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">Upload a new photo</p>
                    <p className="text-xs text-gray-500 mb-4">JPG, PNG, or GIF (max 800KB)</p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg, image/png, image/gif"
                  onChange={handlePhotoSelect}
                  className="hidden"
                  disabled={photoLoading}
                />
                
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  disabled={photoLoading}
                >
                  {photoPreview ? 'Select Different Photo' : 'Select Photo'}
                </button>
              </div>
              
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => !photoLoading && setShowPhotoModal(false)}
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={photoLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePhotoUpload}
                  className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  disabled={!photoFile || photoLoading}
                >
                  {photoLoading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;