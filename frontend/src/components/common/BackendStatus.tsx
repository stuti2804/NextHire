import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import api from '../../services/api';

const BackendStatus = () => {
  const [isServerDown, setIsServerDown] = useState(false);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Try to connect to the backend using a simple health check endpoint
        await api.get('/health', { timeout: 5000 });
        setIsServerDown(false);
      } catch (error: unknown) {
        // Only set server down if it's a network error, not an HTTP error
        const isNetworkError = !(typeof error === 'object' && error !== null && 'response' in error);
        setIsServerDown(isNetworkError);
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (isServerDown) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50 flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <div>
          <p className="font-bold">Backend Server Not Running</p>
          <p className="text-sm">
            Please start the backend server to enable login and other features.
          </p>
        </div>
      </div>
    );
  }

  return null; // Don't show anything if connected
};

export default BackendStatus;
