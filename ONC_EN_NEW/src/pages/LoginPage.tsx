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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 bg-pattern-dots">
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-large mb-4 sm:mb-6">
              <img 
                src="/logo.png" 
                alt="Enstructura Consultants Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-gradient">
              Enstructura
            </h1>
            <p className="text-base sm:text-lg text-secondary-600 font-medium mb-2">
              Structural Analysis Platform
            </p>
            <div className="w-20 sm:w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
          </div>
          
          {/* Login Card */}
          <div className="card p-6 sm:p-8 animate-slide-up">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-center mb-2">Welcome Back</h2>
              <p className="text-sm sm:text-base text-body text-center">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {error && (
                <div className="alert alert-danger animate-fade-in">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              )}
              
              <div>
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`form-input ${errors.username ? 'form-input-error' : ''}`}
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <div className="form-error">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.username}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <div className="form-error">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg w-full text-base sm:text-lg py-3 sm:py-4"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner w-5 h-5 mr-3"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </div>
                )}
              </button>
            </form>
            
            {/* Demo Credentials */}
            <div className="mt-6 sm:mt-8 p-4 bg-primary-50 rounded-xl border border-primary-200">
              <div className="text-center">
                <h3 className="text-sm font-semibold text-primary-800 mb-3">Demo Credentials</h3>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-1 sm:gap-0">
                    <span className="text-primary-700 font-medium">Username:</span>
                    <code className="bg-white px-2 py-1 rounded font-mono text-primary-800 font-semibold text-xs sm:text-sm">admin</code>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-1 sm:gap-0">
                    <span className="text-primary-700 font-medium">Password:</span>
                    <code className="bg-white px-2 py-1 rounded font-mono text-primary-800 font-semibold text-xs sm:text-sm">password123</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center mt-6 sm:mt-8 animate-fade-in">
            <p className="text-xs sm:text-sm text-caption">
              © 2026 Enstructura Consultants. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;