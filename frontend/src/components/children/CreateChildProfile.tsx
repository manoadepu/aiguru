import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// Define the grade levels
const GRADE_LEVELS = [
  'Preschool',
  'Kindergarten',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12'
];

// Define subject options
const SUBJECTS = [
  'Math',
  'Science',
  'English',
  'History',
  'Geography',
  'Art',
  'Music',
  'Physical Education',
  'Computer Science',
  'Foreign Language'
];

// Define learning style options
const LEARNING_STYLES = [
  'Visual',
  'Auditory',
  'Reading/Writing',
  'Kinesthetic'
];

interface ChildProfileFormData {
  name: string;
  age: string;
  grade: string;
  subjects: string[];
  learningStyle: string;
  interests: string;
}

const CreateChildProfile: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<ChildProfileFormData>({
    name: '',
    age: '',
    grade: '',
    subjects: [],
    learningStyle: '',
    interests: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, value]
      });
    } else {
      setFormData({
        ...formData,
        subjects: formData.subjects.filter(subject => subject !== value)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.age || !formData.grade || formData.subjects.length === 0 || !formData.learningStyle) {
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
      
      // Submit child profile data
      const response = await axios.post('/api/v1/children/', {
        name: formData.name,
        age: parseInt(formData.age),
        grade: formData.grade,
        subjects: formData.subjects,
        learning_style: formData.learningStyle,
        interests: formData.interests,
        parent_id: currentUser?.id
      });
      
      console.log('Child profile created:', response.data);
      
      setSuccess('Child profile created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        age: '',
        grade: '',
        subjects: [],
        learningStyle: '',
        interests: ''
      });
      
      // Redirect to child profile page after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error creating child profile:', err);
      
      // Handle different error formats
      let errorMessage = 'Failed to create child profile';
      
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Child Profile</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Set up a profile for your child to personalize their learning experience.
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
              {/* Child's Name */}
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Child's Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              {/* Age */}
              <div className="sm:col-span-3">
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  Age <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="age"
                    id="age"
                    min="3"
                    max="18"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              {/* Grade Level */}
              <div className="sm:col-span-3">
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                  Grade Level <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Grade Level</option>
                    {GRADE_LEVELS.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Learning Style */}
              <div className="sm:col-span-3">
                <label htmlFor="learningStyle" className="block text-sm font-medium text-gray-700">
                  Primary Learning Style <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="learningStyle"
                    name="learningStyle"
                    value={formData.learningStyle}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Learning Style</option>
                    {LEARNING_STYLES.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subjects */}
              <div className="sm:col-span-6">
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700">
                    Subjects of Interest <span className="text-red-500">*</span>
                  </legend>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-y-2">
                    {SUBJECTS.map((subject) => (
                      <div key={subject} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`subject-${subject}`}
                            name={`subject-${subject}`}
                            type="checkbox"
                            value={subject}
                            checked={formData.subjects.includes(subject)}
                            onChange={handleSubjectChange}
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`subject-${subject}`} className="font-medium text-gray-700">
                            {subject}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>

              {/* Interests */}
              <div className="sm:col-span-6">
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                  Interests & Hobbies
                </label>
                <div className="mt-1">
                  <textarea
                    id="interests"
                    name="interests"
                    rows={3}
                    value={formData.interests}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Sports, music, reading, etc."
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Tell us about your child's interests to help personalize their learning experience.
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
                {loading ? 'Creating...' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateChildProfile;
