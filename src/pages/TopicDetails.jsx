import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, Users, Tag, Calendar, Loader2, ArrowLeft, Edit2, Trash2, Plus } from 'lucide-react';
import { getTopicById, joinTopic, deleteTopic } from '../services/topicService';
import { getCurrentUser } from '../services/authService';

const TopicDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setIsLoading(true);
        const data = await getTopicById(id);
        setTopic(data);
      } catch (error) {
        setError(error.error || 'Failed to fetch topic');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopic();
  }, [id]);

  const handleJoinTopic = async () => {
    try {
      setIsJoining(true);
      const updatedTopic = await joinTopic(id);
      setTopic(updatedTopic);
    } catch (error) {
      setError(error.error || 'Failed to join topic');
    } finally {
      setIsJoining(false);
    }
  };

  const handleDeleteTopic = async () => {
    if (!window.confirm('Are you sure you want to delete this topic?')) return;

    try {
      setIsDeleting(true);
      await deleteTopic(id);
      navigate('/topics');
    } catch (error) {
      setError(error.error || 'Failed to delete topic');
    } finally {
      setIsDeleting(false);
    }
  };

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

  if (!topic) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-300">Topic not found</p>
      </div>
    );
  }

  const isCreator = user && topic.createdBy._id === user._id;
  const isParticipant = user && topic.participants.some(p => p._id === user._id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/topics')}
          className="flex items-center text-gray-300 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Topics
        </button>
      </div>

      <div className="glass-panel border-purple p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{topic.title}</h1>
            <div className="flex items-center space-x-4 text-gray-300">
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {topic.participants.length} participants
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Created {new Date(topic.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            {isCreator && (
              <>
                <button
                  onClick={() => navigate(`/topics/${id}/edit`)}
                  className="p-2 text-gray-300 hover:text-white"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={handleDeleteTopic}
                  disabled={isDeleting}
                  className="p-2 text-red-500 hover:text-red-400"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Description</h2>
          <p className="text-gray-300">{topic.description}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Category</h2>
          <span className="bg-purple/20 text-purple-light px-3 py-1 rounded-full">
            {topic.category}
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {topic.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-black/30 text-gray-300 px-3 py-1 rounded-full"
              >
                <Tag className="h-4 w-4 inline mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Participants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topic.participants.map(participant => (
              <div
                key={participant._id}
                className="glass-panel border-purple p-4"
              >
                <h3 className="text-white font-semibold">{participant.fullName}</h3>
                <p className="text-gray-300 text-sm">{participant.email}</p>
              </div>
            ))}
          </div>
        </div>

        {!isParticipant && (
          <div className="flex justify-center">
            <button
              onClick={handleJoinTopic}
              disabled={isJoining}
              className="flex items-center space-x-2 bg-purple hover:bg-purple-dark text-white px-6 py-3 rounded-lg transition-colors"
            >
              {isJoining ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <span>Join Topic</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicDetails; 