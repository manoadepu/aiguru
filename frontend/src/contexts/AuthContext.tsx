import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { getToken, storeToken, clearToken, setupAuthInterceptors } from '../utils/authUtils';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  isAuthenticated: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Setup auth interceptors to handle token expiry
  useEffect(() => {
    console.log('Setting up auth interceptors');
    setupAuthInterceptors(() => {
      console.log('Auth interceptor triggered logout');
      setCurrentUser(null);
    });
  }, []);

  // Check if user is already logged in on component mount
  useEffect(() => {
    console.log('Checking for existing authentication');
    const token = getToken();
    
    if (token) {
      console.log('Token found, setting up axios defaults');
      // Set base URL for API requests
      axios.defaults.baseURL = 'http://localhost:8000';
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Fetching user data from /api/v1/users/me');
      // Fetch user data
      axios.get('/api/v1/users/me')
        .then(response => {
          console.log('User data fetched successfully:', response.data);
          setCurrentUser(response.data);
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          // If token is invalid, remove it
          clearToken();
        })
        .finally(() => {
          console.log('Authentication check completed');
          setLoading(false);
        });
    } else {
      console.log('No token found, user is not authenticated');
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log('Login function called with:', { email });
      
      // Configure axios for this request
      axios.defaults.baseURL = 'http://localhost:8000';
      axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
      
      // The backend OAuth2 expects form data, not JSON
      const formData = new URLSearchParams();
      formData.append('username', email); // Backend expects 'username' field for email
      formData.append('password', password);
      
      console.log('Sending login request to:', axios.defaults.baseURL + '/api/v1/auth/login');
      console.log('Form data:', formData.toString());
      
      const response = await axios.post('/api/v1/auth/login', formData);
      
      console.log('Login response status:', response.status);
      console.log('Login response data:', response.data);
      
      if (!response.data || !response.data.access_token) {
        console.error('Invalid response format - missing access_token:', response.data);
        throw new Error('Invalid response format from server');
      }
      
      // Extract data from response
      const { access_token, user } = response.data;
      console.log('Extracted token and user:', { hasToken: !!access_token, user });
      
      if (!user) {
        // If user data is not in the response, try to extract it differently
        console.log('User data not found in expected format, checking response structure');
        
        // The backend might return user data in a different format
        // Let's create a user object from the response if possible
        const userData = {
          id: response.data.id || 'unknown',
          email: response.data.email || email,
          name: response.data.name || email.split('@')[0]
        };
        
        console.log('Created user data from response:', userData);
        
        // Store token with default expiry
        storeToken(access_token);
        console.log('Token stored in localStorage');
        
        // Set the user in context
        setCurrentUser(userData);
        console.log('User set in context (from created data):', userData);
      } else {
        // Store token with default expiry
        storeToken(access_token);
        console.log('Token stored in localStorage');
        
        // Set the user in context
        setCurrentUser(user);
        console.log('User set in context (from response):', user);
      }
      
      return user; // Return the user for additional handling if needed
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      // Set base URL for API requests
      axios.defaults.baseURL = 'http://localhost:8000';
      
      console.log('Registering user:', { email, name });
      
      const response = await axios.post('/api/v1/auth/register', { 
        email, 
        password, 
        name 
      });
      
      console.log('Registration response:', response.data);
      
      // Note: For this implementation, we don't automatically log in after registration
      // In a production app, you might want to add email verification before login
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    clearToken();
    setCurrentUser(null);
  };

  // Password reset function
  const resetPassword = async (email: string) => {
    try {
      // For testing: Just log the action since endpoint doesn't exist yet
      console.log('Password reset requested for:', email);
      // In production, this would call the actual endpoint
      // await axios.post('/api/v1/auth/reset-password', { email });
      return Promise.resolve();
    } catch (error) {
      throw error;
    }
  };

  // Email verification function
  const verifyEmail = async (token: string) => {
    try {
      // For testing: Just log the action since endpoint doesn't exist yet
      console.log('Email verification requested with token:', token);
      // In production, this would call the actual endpoint
      // await axios.post('/api/v1/auth/verify-email', { token });
      return Promise.resolve();
    } catch (error) {
      throw error;
    }
  };

  // Debug the authentication state
  const isAuthenticated = !!currentUser;
  console.log('AuthContext - Authentication state:', { 
    isAuthenticated, 
    hasCurrentUser: !!currentUser, 
    currentUserData: currentUser,
    loading 
  });

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    resetPassword,
    verifyEmail,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
