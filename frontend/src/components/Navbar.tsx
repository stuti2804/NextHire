import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import authService from '../services/authService';

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className = '' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Clear token from localStorage using authService
    authService.logout();
    
    // Update redux state
    dispatch(logout());
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <nav className={`bg-white border-b border-gray-200 h-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <FileText className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ResumeAI</span>
            </Link>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="ml-4 p-2 rounded-full text-gray-500 hover:text-gray-700"
              aria-label="Sign out"
            >
              <LogOut className="h-6 w-6" />
            </button>
            <div className="ml-4">
              <img
                className="h-8 w-8 rounded-full"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User avatar"
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;