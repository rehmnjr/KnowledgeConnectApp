import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import CreateMeetingModal from './CreateMeetingModal';

const ActionButtons = ({ onCreateMeeting }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateClick = () => {
    setIsModalOpen(true);
  };

  const handleCreateMeeting = (meetingData) => {
    onCreateMeeting(meetingData);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button 
          onClick={handleCreateClick}
          className="glass-panel p-6 flex items-center justify-between transition-transform hover:scale-105"
        >
          <div>
            <h3 className="text-xl font-semibold text-white text-left">Create Meeting</h3>
            <p className="text-gray-300 text-sm mt-1 text-left">Share your knowledge with others</p>
          </div>
          <div className="bg-purple rounded-full p-3">
            <Plus className="h-6 w-6 text-white" />
          </div>
        </button>
        
        <Link 
          to="/scheduled"
          className="glass-panel p-6 flex items-center justify-between transition-transform hover:scale-105"
        >
          <div>
            <h3 className="text-xl font-semibold text-white">View Meetings</h3>
            <p className="text-gray-300 text-sm mt-1">Check your scheduled meetings</p>
          </div>
          <div className="bg-purple rounded-full p-3">
            <Eye className="h-6 w-6 text-white" />
          </div>
        </Link>
      </div>

      <CreateMeetingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreateMeeting={handleCreateMeeting}
      />
    </>
  );
};

export default ActionButtons;
