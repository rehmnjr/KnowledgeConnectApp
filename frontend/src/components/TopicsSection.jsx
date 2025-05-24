import React from 'react';
import { Link } from 'react-router-dom';

const TopicCard = ({ topic }) => {
  // If no image is provided, generate one based on category
  const backgroundImage = topic.image || 
    `https://source.unsplash.com/random/300x200?${topic.category?.toLowerCase()}`;

  return (
    <div className="glass-panel border-purple overflow-hidden">
      <div 
        className="h-40 bg-cover bg-center" 
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="p-4">
        <h3 className="text-lg font-bold text-white">{topic.title}</h3>
        <p className="text-sm text-gray-300 mt-1">{topic.description}</p>
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-400">{topic.date || (topic.createdAt ? new Date(topic.createdAt).toLocaleDateString() : 'No date')}</span>
          <span className="text-xs bg-purple/30 text-purple-light px-2 py-1 rounded-full">
            {topic.category}
          </span>
        </div>
      </div>
    </div>
  );
};

const TopicsSection = ({ topics = [] }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Discover Topics</h2>
        <Link to="/topics" className="text-purple hover:text-purple-light text-sm">
          Explore more
        </Link>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-300">No topics available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topics.map(topic => (
            <TopicCard key={topic.id || topic._id} topic={topic} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicsSection;
