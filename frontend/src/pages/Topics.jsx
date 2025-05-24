import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Plus, Users, Tag, Calendar, Loader2 } from 'lucide-react';
import { getTopics, getUserTopics, joinTopic } from '../services/topicService';
import { getCurrentUser } from '../services/authService';

const Topics = () => {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'my'
  const user = getCurrentUser();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setIsLoading(true);
        const data = viewMode === 'all' 
          ? await getTopics() 
          : await getUserTopics();
        setTopics(data);
      } catch (error) {
        setError(error.error || 'Failed to fetch topics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [viewMode]);

  const handleJoinTopic = async (topicId) => {
    try {
      const updatedTopic = await joinTopic(topicId);
      setTopics(prevTopics => 
        prevTopics.map(topic => 
          topic._id === topicId ? updatedTopic : topic
        )
      );
    } catch (error) {
      setError(error.error || 'Failed to join topic');
    }
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(topics.map(topic => topic.category))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <Brain className="h-8 w-8 text-purple" />
          <h1 className="text-2xl font-bold text-white">Topics</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'all'
                  ? 'bg-purple text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All Topics
            </button>
            <button
              onClick={() => setViewMode('my')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'my'
                  ? 'bg-purple text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              My Topics
            </button>
          </div>
          <Link
            to="/create-topic"
            className="flex items-center space-x-2 bg-purple hover:bg-purple-dark text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create Topic</span>
          </Link>
        </div>
      </div>

      <div className="glass-panel border-purple p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
            />
            <Brain className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map(topic => (
            <div key={topic._id} className="glass-panel border-purple p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">{topic.title}</h2>
                <span className="bg-purple/20 text-purple-light px-3 py-1 rounded-full text-sm">
                  {topic.category}
                </span>
              </div>
              
              <p className="text-gray-300 mb-4">{topic.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {topic.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-black/30 text-gray-300 px-2 py-1 rounded-full text-sm"
                  >
                    <Tag className="h-3 w-3 inline mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Users className="h-4 w-4" />
                  <span>{topic.participants.length} participants</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-4">
                <Link
                  to={`/topics/${topic._id}`}
                  className="flex-1 text-center py-2 bg-purple/30 text-white rounded-lg hover:bg-purple/50 transition-colors"
                >
                  View Details
                </Link>
                {user && !topic.participants.some(p => p._id === user._id) && (
                  <button
                    onClick={() => handleJoinTopic(topic._id)}
                    className="flex-1 py-2 bg-purple text-white rounded-lg hover:bg-purple-dark transition-colors"
                  >
                    Join Topic
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-300">
              {viewMode === 'all' 
                ? 'No topics found. Create one to get started!'
                : 'You haven\'t joined or created any topics yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Topics; 