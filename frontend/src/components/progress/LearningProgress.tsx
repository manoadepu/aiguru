import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface ChildProfile {
  id: string;
  name: string;
  grade: string;
}

interface LearningSession {
  id: string;
  childId: string;
  childName: string;
  subject: string;
  topic: string;
  date: string;
  duration: number;
  score: number;
  questions: number;
  correctAnswers: number;
}

interface ProgressStats {
  totalSessions: number;
  totalTimeSpent: number;
  averageScore: number;
  subjectBreakdown: {
    [subject: string]: {
      sessions: number;
      averageScore: number;
    };
  };
}

const LearningProgress: React.FC = () => {
  const navigate = useNavigate();
  // We'll use auth context in future implementations when connecting to real API
  useAuth(); // Keep the hook call without assigning to variable
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [timeRange, setTimeRange] = useState<string>('week'); // 'week', 'month', 'all'

  // Generate mock learning sessions for demo purposes
  const generateMockSessions = useCallback((childId: string): LearningSession[] => {
    const selectedChild = childProfiles.find(child => child.id === childId);
    const childName = selectedChild?.name || 'Unknown';
    const childGrade = selectedChild?.grade || '';
    
    // Customize subjects and topics based on the child's grade
    let subjects: string[];
    let topicsBySubject: {[key: string]: string[]};
    
    // For Vrishank (Preschool)
    if (childId === 'vrishank-id') {
      subjects = ['Early Math', 'Science Discovery', 'English', 'Arts & Crafts'];
      
      topicsBySubject = {
        'Early Math': ['Numbers 1-10', 'Shapes', 'Colors', 'Patterns', 'Counting'],
        'Science Discovery': ['Animals', 'Plants', 'Weather', 'Seasons', 'Five Senses'],
        'English': ['Alphabet', 'Phonics', 'Storytelling', 'Vocabulary', 'Listening'],
        'Arts & Crafts': ['Drawing', 'Coloring', 'Cutting', 'Pasting', 'Painting']
      };
    } 
    // For other elementary grade children
    else if (childGrade.includes('Grade') && parseInt(childGrade.split(' ')[1]) <= 5) {
      subjects = ['Math', 'Science', 'English', 'Social Studies'];
      
      topicsBySubject = {
        'Math': ['Addition', 'Subtraction', 'Multiplication', 'Division', 'Fractions'],
        'Science': ['Plants', 'Animals', 'Weather', 'Solar System', 'States of Matter'],
        'English': ['Grammar', 'Vocabulary', 'Reading Comprehension', 'Writing', 'Spelling'],
        'Social Studies': ['Communities', 'Maps', 'History', 'Geography', 'Cultures']
      };
    }
    // For middle/high school
    else {
      subjects = ['Math', 'Science', 'English', 'History'];
      
      topicsBySubject = {
        'Math': ['Algebra', 'Geometry', 'Statistics', 'Probability', 'Calculus'],
        'Science': ['Biology', 'Chemistry', 'Physics', 'Earth Science', 'Astronomy'],
        'English': ['Literature', 'Essay Writing', 'Research', 'Public Speaking', 'Poetry'],
        'History': ['Ancient Civilizations', 'Middle Ages', 'Renaissance', 'World Wars', 'Modern History']
      };
    }
    
    // Generate mock sessions
    const mockSessions: LearningSession[] = [];
    const today = new Date();
    
    // Number of sessions based on child - Vrishank has fewer sessions since he just started
    const sessionCount = childId === 'vrishank-id' ? 8 : 15;
    
    for (let i = 0; i < sessionCount; i++) {
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const topics = topicsBySubject[subject];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      
      // Generate a date within the past month
      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
      
      // Only include sessions within the selected time range
      if (timeRange === 'week' && (today.getTime() - sessionDate.getTime()) > 7 * 24 * 60 * 60 * 1000) {
        continue;
      }
      
      if (timeRange === 'month' && (today.getTime() - sessionDate.getTime()) > 30 * 24 * 60 * 60 * 1000) {
        continue;
      }
      
      // For Vrishank, shorter sessions with fewer questions and higher scores (since preschool)
      let duration, questions, correctAnswers, score;
      
      if (childId === 'vrishank-id') {
        duration = Math.floor(Math.random() * 15) + 10; // 10-25 minutes (shorter for preschool)
        questions = Math.floor(Math.random() * 5) + 3; // 3-8 questions (fewer for preschool)
        correctAnswers = Math.min(questions, Math.floor(Math.random() * questions) + Math.ceil(questions * 0.6)); // Higher success rate
        score = Math.round((correctAnswers / questions) * 100);
      } else {
        duration = Math.floor(Math.random() * 30) + 15; // 15-45 minutes
        questions = Math.floor(Math.random() * 15) + 5; // 5-20 questions
        correctAnswers = Math.floor(Math.random() * questions);
        score = Math.round((correctAnswers / questions) * 100);
      }
      
      mockSessions.push({
        id: `session-${i}`,
        childId,
        childName,
        subject,
        topic,
        date: sessionDate.toISOString().split('T')[0],
        duration,
        score,
        questions,
        correctAnswers
      });
    }
    
    // Sort by date (newest first)
    return mockSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [childProfiles, timeRange]);

  // Fetch child profiles when component mounts
  useEffect(() => {
    const fetchChildProfiles = async () => {
      try {
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
          setSelectedChildId(response.data[0].id); // Select first child by default
        } else {
          // Mock data including the user's created child (Vrishank)
          const mockProfiles = [
            {
              id: 'vrishank-id',
              name: 'Vrishank',
              grade: 'Preschool'
            },
            {
              id: 'mock-1',
              name: 'Alex',
              grade: 'Grade 5'
            },
            {
              id: 'mock-2',
              name: 'Sam',
              grade: 'Grade 3'
            }
          ];
          setChildProfiles(mockProfiles);
          setSelectedChildId('vrishank-id'); // Select Vrishank by default
        }
      } catch (err: any) {
        console.error('Error fetching child profiles:', err);
        // Create mock data for testing if API fails, including Vrishank
        const mockProfiles = [
          {
            id: 'vrishank-id',
            name: 'Vrishank',
            grade: 'Preschool'
          },
          {
            id: 'mock-1',
            name: 'Alex',
            grade: 'Grade 5'
          },
          {
            id: 'mock-2',
            name: 'Sam',
            grade: 'Grade 3'
          }
        ];
        setChildProfiles(mockProfiles);
        setSelectedChildId('vrishank-id'); // Select Vrishank by default
      } finally {
        setLoading(false);
      }
    };
    
    fetchChildProfiles();
  }, []);

  // Fetch learning sessions when selected child changes
  useEffect(() => {
    if (!selectedChildId) return;
    
    const fetchLearningSessions = async () => {
      try {
        setLoading(true);
        
        // In a real app, we would fetch from the API
        // For now, generate mock data
        const mockSessions = generateMockSessions(selectedChildId);
        setSessions(mockSessions);
        
        // Calculate stats
        const calculatedStats = calculateStats(mockSessions);
        setStats(calculatedStats);
      } catch (err: any) {
        console.error('Error fetching learning sessions:', err);
        setError('Failed to load learning progress data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLearningSessions();
  }, [selectedChildId, timeRange, childProfiles, generateMockSessions]); // Added childProfiles as dependency since generateMockSessions uses it

  // Calculate progress statistics
  const calculateStats = 
    const selectedChild = childProfiles.find(child => child.id === childId);
    const childName = selectedChild?.name || 'Unknown';
    const childGrade = selectedChild?.grade || '';
    
    // Customize subjects and topics based on the child's grade
    let subjects: string[];
    let topicsBySubject: {[key: string]: string[]};
    
    // For Vrishank (Preschool)
    if (childId === 'vrishank-id') {
      subjects = ['Early Math', 'Science Discovery', 'English', 'Arts & Crafts'];
      
      topicsBySubject = {
        'Early Math': ['Numbers 1-10', 'Shapes', 'Colors', 'Patterns', 'Counting'],
        'Science Discovery': ['Animals', 'Plants', 'Weather', 'Seasons', 'Five Senses'],
        'English': ['Alphabet', 'Phonics', 'Storytelling', 'Vocabulary', 'Listening'],
        'Arts & Crafts': ['Drawing', 'Coloring', 'Cutting', 'Pasting', 'Painting']
      };
    } 
    // For other elementary grade children
    else if (childGrade.includes('Grade') && parseInt(childGrade.split(' ')[1]) <= 5) {
      subjects = ['Math', 'Science', 'English', 'Social Studies'];
      
      topicsBySubject = {
        'Math': ['Addition', 'Subtraction', 'Multiplication', 'Division', 'Fractions'],
        'Science': ['Plants', 'Animals', 'Weather', 'Solar System', 'States of Matter'],
        'English': ['Grammar', 'Vocabulary', 'Reading Comprehension', 'Writing', 'Spelling'],
        'Social Studies': ['Communities', 'Maps', 'History', 'Geography', 'Cultures']
      };
    }
    // For middle/high school
    else {
      subjects = ['Math', 'Science', 'English', 'History'];
      
      topicsBySubject = {
        'Math': ['Algebra', 'Geometry', 'Statistics', 'Probability', 'Calculus'],
        'Science': ['Biology', 'Chemistry', 'Physics', 'Earth Science', 'Astronomy'],
        'English': ['Literature', 'Essay Writing', 'Research', 'Public Speaking', 'Poetry'],
        'History': ['Ancient Civilizations', 'Middle Ages', 'Renaissance', 'World Wars', 'Modern History']
      };
    }
    
    // Generate mock sessions
    const mockSessions: LearningSession[] = [];
    const today = new Date();
    
    // Number of sessions based on child - Vrishank has fewer sessions since he just started
    const sessionCount = childId === 'vrishank-id' ? 8 : 15;
    
    for (let i = 0; i < sessionCount; i++) {
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const topics = topicsBySubject[subject];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      
      // Generate a date within the past month
      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
      
      // Only include sessions within the selected time range
      if (timeRange === 'week' && (today.getTime() - sessionDate.getTime()) > 7 * 24 * 60 * 60 * 1000) {
        continue;
      }
      
      if (timeRange === 'month' && (today.getTime() - sessionDate.getTime()) > 30 * 24 * 60 * 60 * 1000) {
        continue;
      }
      
      // For Vrishank, shorter sessions with fewer questions and higher scores (since preschool)
      let duration, questions, correctAnswers, score;
      
      if (childId === 'vrishank-id') {
        duration = Math.floor(Math.random() * 15) + 10; // 10-25 minutes (shorter for preschool)
        questions = Math.floor(Math.random() * 5) + 3; // 3-8 questions (fewer for preschool)
        correctAnswers = Math.min(questions, Math.floor(Math.random() * questions) + Math.ceil(questions * 0.6)); // Higher success rate
        score = Math.round((correctAnswers / questions) * 100);
      } else {
        duration = Math.floor(Math.random() * 30) + 15; // 15-45 minutes
        questions = Math.floor(Math.random() * 15) + 5; // 5-20 questions
        correctAnswers = Math.floor(Math.random() * questions);
        score = Math.round((correctAnswers / questions) * 100);
      }
      
      mockSessions.push({
        id: `session-${i}`,
        childId,
        childName,
        subject,
        topic,
        date: sessionDate.toISOString().split('T')[0],
        duration,
        score,
        questions,
        correctAnswers
      });
    }
    
    // Sort by date (newest first)
    return mockSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Calculate progress statistics
  const calculateStats = (sessions: LearningSession[]): ProgressStats => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalTimeSpent: 0,
        averageScore: 0,
        subjectBreakdown: {}
      };
    }
    
    const totalSessions = sessions.length;
    const totalTimeSpent = sessions.reduce((total, session) => total + session.duration, 0);
    const totalScore = sessions.reduce((total, session) => total + session.score, 0);
    const averageScore = Math.round(totalScore / totalSessions);
    
    // Calculate subject breakdown
    const subjectBreakdown: {[subject: string]: {sessions: number, averageScore: number}} = {};
    
    sessions.forEach(session => {
      if (!subjectBreakdown[session.subject]) {
        subjectBreakdown[session.subject] = {
          sessions: 0,
          averageScore: 0
        };
      }
      
      subjectBreakdown[session.subject].sessions += 1;
      subjectBreakdown[session.subject].averageScore += session.score;
    });
    
    // Calculate average scores for each subject
    Object.keys(subjectBreakdown).forEach(subject => {
      subjectBreakdown[subject].averageScore = Math.round(
        subjectBreakdown[subject].averageScore / subjectBreakdown[subject].sessions
      );
    });
    
    return {
      totalSessions,
      totalTimeSpent,
      averageScore,
      subjectBreakdown
    };
  };

  const handleChildChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChildId(e.target.value);
  };

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">Learning Progress</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Track your child's learning progress and achievements.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mx-6" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="mb-4 md:mb-0">
                <label htmlFor="childSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Child
                </label>
                <select
                  id="childSelect"
                  value={selectedChildId}
                  onChange={handleChildChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  disabled={loading}
                >
                  {childProfiles.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name} ({child.grade})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-1">
                  Time Range
                </label>
                <select
                  id="timeRange"
                  value={timeRange}
                  onChange={handleTimeRangeChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  disabled={loading}
                >
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <>
                {/* Progress Summary */}
                {stats && (
                  <div className="mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Progress Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-indigo-800">Total Learning Sessions</p>
                        <p className="text-3xl font-bold text-indigo-900">{stats.totalSessions}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-green-800">Total Time Spent</p>
                        <p className="text-3xl font-bold text-green-900">{formatTime(stats.totalTimeSpent)}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-purple-800">Average Score</p>
                        <p className="text-3xl font-bold text-purple-900">{stats.averageScore}%</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Subject Breakdown */}
                {stats && Object.keys(stats.subjectBreakdown).length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Subject Breakdown</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(stats.subjectBreakdown).map(([subject, data]) => (
                        <div key={subject} className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-800">{subject}</p>
                          <p className="text-2xl font-bold text-gray-900">{data.averageScore}%</p>
                          <p className="text-sm text-gray-500">{data.sessions} sessions</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Recent Sessions */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Learning Sessions</h2>
                  {sessions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Subject
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Topic
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Duration
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Score
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sessions.map((session) => (
                            <tr key={session.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {session.date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {session.subject}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {session.topic}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatTime(session.duration)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  session.score >= 80 ? 'bg-green-100 text-green-800' : 
                                  session.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {session.score}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No learning sessions found for the selected time period.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningProgress;
