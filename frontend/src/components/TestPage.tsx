import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          AI Teacher Application
        </h1>
        <p className="text-gray-700 mb-4">
          Welcome to the AI Teacher Application. This page confirms that:
        </p>
        <ul className="list-disc pl-5 mb-6 text-gray-600">
          <li>React application is running correctly</li>
          <li>Tailwind CSS is configured properly</li>
          <li>TypeScript compilation is working</li>
        </ul>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors">
          Test Button
        </button>
      </div>
    </div>
  );
};

export default TestPage;
