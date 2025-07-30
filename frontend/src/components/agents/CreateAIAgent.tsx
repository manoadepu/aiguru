import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface ChildProfile {
  id: string;
  name: string;
  grade: string;
  subjects: string[];
}

interface AgentFormData {
  name: string;
  childId: string;
  primarySubject: string;
  personality: string;
  teachingStyle: string;
  additionalInstructions: string;
}

// Define teaching style options
const TEACHING_STYLES = [
  'Socratic (question-based)',
  'Direct Instruction',
  'Inquiry-Based',
  'Project-Based',
  'Gamified',
  'Storytelling',
  'Visual',
  'Hands-on'
];

// Define personality options
const PERSONALITY_TYPES = [
  'Encouraging and Supportive',
  'Challenging and Motivating',
  'Patient and Thorough',
  'Enthusiastic and Energetic',
  'Calm and Methodical',
  'Humorous and Engaging'
];

const CreateAIAgent: React.FC = () => {
  const navigate = useNavigate();
  // We'll use currentUser in future API implementations
  const { /* currentUser */ } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    childId: '',
    primarySubject: '',
    personality: '',
    teachingStyle: '',
    additionalInstructions: ''
  });

  // Fetch child profiles when component mounts
  useEffect(() => {
    const fetchChildProfiles = async () => {
      try {
        setLoading(true);
        
        // Configure axios
        axios.defaults.baseURL = 'http://localhost:8000';
        
        // Get token for authorization
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Set authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch child profiles
        const response = await axios.get('/api/v1/children/');
        console.log('Child profiles:', response.data);
        
        // For testing purposes, if no profiles exist yet, create mock data
        if (response.data && response.data.length > 0) {
          setChildProfiles(response.data);
        } else {
          // Mock data for testing
          setChildProfiles([
            {
              id: 'mock-1',
              name: 'Alex',
              grade: 'Grade 5',
              subjects: ['Math', 'Science']
            },
            {
              id: 'mock-2',
              name: 'Sam',
              grade: 'Grade 3',
              subjects: ['English', 'Art']
            }
          ]);
        }
      } catch (err: any) {
        console.error('Error fetching child profiles:', err);
        // Create mock data for testing if API fails
        setChildProfiles([
          {
            id: 'mock-1',
            name: 'Alex',
            grade: 'Grade 5',
            subjects: ['Math', 'Science']
          },
          {
            id: 'mock-2',
            name: 'Sam',
            grade: 'Grade 3',
            subjects: ['English', 'Art']
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChildProfiles();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // If child ID changes, update selected child
    if (name === 'childId') {
      const selected = childProfiles.find(child => child.id === value) || null;
      setSelectedChild(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.childId || !formData.primarySubject || !formData.personality || !formData.teachingStyle) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Configure axios
      axios.defaults.baseURL = 'http://localhost:8000';
      
      // Get token for authorization
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Submit AI agent data
      const response = await axios.post('/api/v1/agents/', {
        name: formData.name,
        child_id: formData.childId,
        primary_subject: formData.primarySubject,
        personality: formData.personality,
        teaching_style: formData.teachingStyle,
        additional_instructions: formData.additionalInstructions
      });
      
      console.log('AI agent created:', response.data);
      
      setSuccess('AI agent created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        childId: '',
        primarySubject: '',
        personality: '',
        teachingStyle: '',
        additionalInstructions: ''
      });
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error creating AI agent:', err);
      
      // Handle different error formats
      let errorMessage = 'Failed to create AI agent';
      
      if (err.response?.data) {
        const detail = err.response.data.detail;
        
        // Check if detail is an object or array (validation error)
        if (detail && typeof detail === 'object') {
          if (Array.isArray(detail)) {
            // If it's an array of validation errors
            errorMessage = detail.map((item: any) => 
              typeof item.msg === 'string' ? item.msg : 'Validation error'
            ).join(', ');
          } else {
            // If it's a single object
            errorMessage = 'Validation error: ' + 
              (typeof detail.msg === 'string' ? detail.msg : JSON.stringify(detail));
          }
        } else if (typeof detail === 'string') {
          // If it's a simple string
          errorMessage = detail;
        }
      }
      
      setError(errorMessage);
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">Create AI Tutor</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Create a personalized AI tutor tailored to your child's learning needs.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mx-6" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 mx-6" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* AI Tutor Name */}
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  AI Tutor Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g., Math Buddy, Science Explorer"
                    required
                  />
                </div>
              </div>

              {/* Child Selection */}
              <div className="sm:col-span-3">
                <label htmlFor="childId" className="block text-sm font-medium text-gray-700">
                  Select Child <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="childId"
                    name="childId"
                    value={formData.childId}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a Child</option>
                    {childProfiles.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name} ({child.grade})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Primary Subject */}
              <div className="sm:col-span-3">
                <label htmlFor="primarySubject" className="block text-sm font-medium text-gray-700">
                  Primary Subject <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="primarySubject"
                    name="primarySubject"
                    value={formData.primarySubject}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                    disabled={!selectedChild}
                  >
                    <option value="">Select a Subject</option>
                    {selectedChild?.subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
                {!selectedChild && (
                  <p className="mt-1 text-sm text-gray-500">
                    Please select a child first
                  </p>
                )}
              </div>

              {/* Personality */}
              <div className="sm:col-span-3">
                <label htmlFor="personality" className="block text-sm font-medium text-gray-700">
                  Personality <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="personality"
                    name="personality"
                    value={formData.personality}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Personality</option>
                    {PERSONALITY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Teaching Style */}
              <div className="sm:col-span-3">
                <label htmlFor="teachingStyle" className="block text-sm font-medium text-gray-700">
                  Teaching Style <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="teachingStyle"
                    name="teachingStyle"
                    value={formData.teachingStyle}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Teaching Style</option>
                    {TEACHING_STYLES.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Instructions */}
              <div className="sm:col-span-6">
                <label htmlFor="additionalInstructions" className="block text-sm font-medium text-gray-700">
                  Additional Instructions
                </label>
                <div className="mt-1">
                  <textarea
                    id="additionalInstructions"
                    name="additionalInstructions"
                    rows={4}
                    value={formData.additionalInstructions}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Any specific instructions for the AI tutor..."
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Add any specific instructions or preferences for how the AI tutor should interact with your child.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Creating...' : 'Create AI Tutor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAIAgent;
