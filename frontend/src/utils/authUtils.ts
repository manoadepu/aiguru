import axios from 'axios';

// Token storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

// Set default timeout for token (in milliseconds) - 1 hour
const DEFAULT_TOKEN_EXPIRY = 60 * 60 * 1000; 

/**
 * Store authentication token with expiry time
 * @param token JWT token from authentication
 * @param expiryInMs Expiry time in milliseconds (defaults to 1 hour)
 */
export const storeToken = (token: string, expiryInMs: number = DEFAULT_TOKEN_EXPIRY): void => {
  console.log('Storing token in localStorage:', { tokenLength: token?.length });
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  
  // Calculate and store expiry timestamp
  const expiryTime = new Date().getTime() + expiryInMs;
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  console.log('Token expiry set to:', new Date(expiryTime).toLocaleString());
  
  // Set axios default authorization header
  setAuthHeader(token);
  console.log('Authorization header set for axios');
};

/**
 * Set the Authorization header for all axios requests
 * @param token JWT token
 */
export const setAuthHeader = (token: string | null): void => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

/**
 * Get the stored authentication token
 * @returns The stored token or null if not found/expired
 */
export const getToken = (): string | null => {
  console.log('Getting token from localStorage');
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  
  if (!token) {
    console.log('No token found in localStorage');
    return null;
  }
  
  // Check if token is expired
  if (isTokenExpired()) {
    console.log('Token is expired, clearing it');
    clearToken();
    return null;
  }
  
  console.log('Valid token found in localStorage:', { tokenLength: token?.length });
  return token;
};

/**
 * Check if the stored token is expired
 * @returns True if token is expired or expiry time is not found
 */
export const isTokenExpired = (): boolean => {
  console.log('Checking if token is expired');
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (!expiryTime) {
    console.log('No expiry time found in localStorage');
    return true;
  }
  
  const expiryTimestamp = parseInt(expiryTime, 10);
  const currentTime = new Date().getTime();
  
  const isExpired = currentTime > expiryTimestamp;
  console.log('Token expiry check:', { 
    expiryTime: new Date(expiryTimestamp).toLocaleString(), 
    currentTime: new Date(currentTime).toLocaleString(), 
    isExpired 
  });
  
  return isExpired;
};

/**
 * Clear authentication token and related data
 */
export const clearToken = (): void => {
  console.log('Clearing authentication token and related data');
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  delete axios.defaults.headers.common['Authorization'];
  console.log('Token cleared from localStorage and Authorization header removed');
};

/**
 * Setup axios interceptors to handle token expiry and authentication errors
 * @param logoutCallback Function to call when authentication fails (usually to redirect to login)
 */
export const setupAuthInterceptors = (logoutCallback: () => void): void => {
  console.log('Setting up axios interceptors for auth');
  
  // Response interceptor
  axios.interceptors.response.use(
    (response) => {
      // Log successful responses for debugging
      console.log(`Response from ${response.config.url}:`, {
        status: response.status,
        hasData: !!response.data
      });
      return response;
    },
    (error) => {
      console.error('Axios response error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message
      });
      
      // Handle 401 Unauthorized errors
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log('Authentication error detected, logging out');
        // Clear token and redirect to login
        clearToken();
        logoutCallback();
      }
      return Promise.reject(error);
    }
  );
  
  // Request interceptor to refresh token if needed
  axios.interceptors.request.use(
    (config) => {
      console.log(`Request to ${config.url}`);
      const token = getToken();
      if (token) {
        console.log('Adding Authorization header to request');
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('No token available for request');
      }
      return config;
    },
    (error) => {
      console.error('Axios request error:', error.message);
      return Promise.reject(error);
    }
  );
};

/**
 * Initialize authentication from stored token
 * @returns True if a valid token was found and set
 */
export const initializeAuth = (): boolean => {
  console.log('Initializing authentication from stored token');
  const token = getToken();
  
  if (token) {
    console.log('Valid token found, setting auth header');
    setAuthHeader(token);
    return true;
  }
  
  console.log('No valid token found during initialization');
  return false;
};
