import React, { useState } from 'react';
import api from '../../services/api';

const LoginDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const checkServerConnection = async () => {
    setIsLoading(true);
    try {
      const healthResponse = await api.get('/health');
      const authEndpoints = await api.options('/auth');
      
      setDebugInfo({
        serverStatus: healthResponse.data,
        authEndpoints: authEndpoints.data,
        apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
        hasToken: !!localStorage.getItem('token'),
      });
    } catch (error) {
      setDebugInfo({
        error: 'Failed to connect to server',
        details: error,
        apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 left-4 bg-gray-200 p-2 rounded text-xs"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 border rounded shadow-lg max-w-md z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold">Authentication Debug</h3>
        <button 
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <button
        onClick={checkServerConnection}
        disabled={isLoading}
        className="bg-blue-500 text-white px-2 py-1 rounded text-xs mb-2"
      >
        {isLoading ? 'Checking...' : 'Check Server Connection'}
      </button>

      {debugInfo && (
        <pre className="text-xs bg-gray-100 p-2 overflow-auto max-h-40">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default LoginDebug;
