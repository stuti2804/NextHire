import React, { useState } from 'react';
import api from '../../services/api';

interface TestUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const TestUserCreator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState<TestUserData>({
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const createTestUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/create-test-user', formData);
      setResult({
        success: true,
        data: response.data
      });
    } catch (error: any) {
      setResult({
        success: false,
        error: error.response?.data || error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 border rounded shadow-lg max-w-md z-50">
      <h2 className="text-lg font-bold mb-2">Create Test User</h2>
      
      <form onSubmit={createTestUser} className="space-y-2">
        <div>
          <label className="block text-sm">Email</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange}
            className="w-full px-2 py-1 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm">Password</label>
          <input 
            type="text" 
            name="password" 
            value={formData.password} 
            onChange={handleChange}
            className="w-full px-2 py-1 border rounded"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm">First Name</label>
            <input 
              type="text" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange}
              className="w-full px-2 py-1 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm">Last Name</label>
            <input 
              type="text" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange}
              className="w-full px-2 py-1 border rounded"
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-green-500 text-white py-1 rounded"
        >
          {isLoading ? 'Creating...' : 'Create User'}
        </button>
      </form>
      
      {result && (
        <div className="mt-2 text-sm">
          <div className={result.success ? "text-green-600" : "text-red-600"}>
            {result.success ? 'User created successfully!' : 'Error creating user'}
          </div>
          <pre className="bg-gray-100 p-2 mt-1 overflow-x-auto">
            {JSON.stringify(result.success ? result.data : result.error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestUserCreator;
