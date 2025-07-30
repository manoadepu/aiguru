import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import TestPage from './components/TestPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import VerifyEmail from './components/auth/VerifyEmail';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './components/Dashboard';
import CreateChildProfile from './components/children/CreateChildProfile';
import CreateAIAgent from './components/agents/CreateAIAgent';
import LearningProgress from './components/progress/LearningProgress';
import { AuthProvider } from './contexts/AuthContext';
import { initializeAuth } from './utils/authUtils';

function App() {
  // Initialize authentication when the app loads
  useEffect(() => {
    console.log('App mounted, initializing authentication');
    const isAuthenticated = initializeAuth();
    console.log('Authentication initialized:', { isAuthenticated });
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            {/* Default route - redirects to dashboard if authenticated, otherwise to login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/create-child-profile" element={<CreateChildProfile />} />
              <Route path="/create-ai-agent" element={<CreateAIAgent />} />
              <Route path="/learning-progress" element={<LearningProgress />} />
              {/* Add more protected routes here */}
            </Route>
            
            {/* Catch all - redirect to dashboard which will then redirect to login if not authenticated */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
