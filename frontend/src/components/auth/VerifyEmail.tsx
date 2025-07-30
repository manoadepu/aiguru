import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const { verifyEmail } = useAuth();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Verification token is missing');
        setLoading(false);
        return;
      }

      try {
        await verifyEmail(token);
        setVerified(true);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to verify email');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, verifyEmail]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {error ? (
          <>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
            <p className="mt-2 text-gray-600">
              The verification link may have expired or is invalid. Please try again or contact support.
            </p>
            <div className="mt-4">
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Return to login
              </Link>
            </div>
          </>
        ) : verified ? (
          <>
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">Email verified successfully!</span>
            </div>
            <p className="mt-2 text-gray-600">
              Your email has been verified. You can now log in to your account.
            </p>
            <div className="mt-4">
              <Link 
                to="/login" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Log in
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">Verification pending</span>
            </div>
            <p className="mt-2 text-gray-600">
              We're still processing your verification. Please wait a moment...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
