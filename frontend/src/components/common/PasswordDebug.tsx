import React, { useState } from 'react';
import axios from 'axios';

const PasswordDebug: React.FC = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAuthentication = async () => {
    setLoading(true);
    try {
      // Make direct request to avoid using existing auth tokens
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`,
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      setResult({
        success: true,
        data: {
          status: response.status,
          statusText: response.statusText,
          user: response.data.user ? { 
            id: response.data.user.id,
            email: response.data.user.email 
          } : null,
          hasToken: !!response.data.token
        }
      });
    } catch (error: any) {
      setResult({
        success: false,
        error: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.response?.data?.message || error.message
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (!showDebug || process.env.NODE_ENV === 'production') {
    return process.env.NODE_ENV !== 'production' ? (
      <button 
        onClick={() => setShowDebug(true)}
        className="fixed bottom-20 right-4 bg-purple-500 text-white p-2 rounded text-xs"
      >
        Password Debug
      </button>
    ) : null;
  }

  return (
    <div className="fixed bottom-20 right-4 bg-white p-4 border rounded shadow-lg max-w-md z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold">Password Authentication Debug</h3>
        <button 
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-2 py-1 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-2 py-1 border rounded"
        />
        <button
          onClick={testAuthentication}
          disabled={loading}
          className="w-full bg-purple-500 text-white py-1 rounded"
        >
          {loading ? 'Testing...' : 'Test Authentication'}
        </button>
      </div>

      {result && (
        <div className="mt-2">
          <div className={result.success ? "text-green-600" : "text-red-600"}>
            {result.success ? 'Authentication Success!' : 'Authentication Failed'}
          </div>
          <pre className="text-xs bg-gray-100 p-2 overflow-auto max-h-40 mt-1">
            {JSON.stringify(result.success ? result.data : result.error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PasswordDebug;
