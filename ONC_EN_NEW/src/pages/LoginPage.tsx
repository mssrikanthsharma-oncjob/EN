import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginFormErrors {
  username?: string;
  password?: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/input');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(formData);
      if (success) {
        navigate('/input');
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-md w-full space-y-8 p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <div className="w-24 h-24 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Enstructura Consultants Logo" 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  maxWidth: '80px', 
                  maxHeight: '80px',
                  objectFit: 'contain'
                }}
                className="block"
              />
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Enstructura Consultants
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            Structural Analysis Platform
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="bg-white py-10 px-8 shadow-2xl rounded-3xl border border-gray-100 backdrop-blur-sm">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 p-4 border border-red-200">
                <div className="flex items-center">
                  <div className="text-sm text-red-700 font-medium">{error}</div>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-3">
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`block w-full max-w-sm px-3 py-2 border-2 ${
                    errors.username ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 text-sm disabled:opacity-50 transition-all duration-200 bg-gray-50 focus:bg-white`}
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && (
                <p className="mt-3 text-sm text-red-600 font-medium">
                  {errors.username}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`block w-full max-w-sm px-3 py-2 border-2 ${
                    errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 text-sm disabled:opacity-50 transition-all duration-200 bg-gray-50 focus:bg-white`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && (
                <p className="mt-3 text-sm text-red-600 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-blue-700 font-bold mb-2">Demo Credentials</p>
              <div className="space-y-1">
                <p className="text-sm text-blue-600">Username: <span className="font-mono bg-white px-2 py-1 rounded font-bold">admin</span></p>
                <p className="text-sm text-blue-600">Password: <span className="font-mono bg-white px-2 py-1 rounded font-bold">password123</span></p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            © 2026 Enstructura Consultants. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;