import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import MeetingCard from './MeetingCard';
import { useAppContext } from '../context/AppContext';

const MeetingList = ({ meetings = [], type = 'all', emptyMessage = 'No meetings found' }) => {
  const { 
    user, 
    joinMeeting: joinMeetingContext, 
    leaveMeeting: leaveMeetingContext,
    cancelMeeting: cancelMeetingContext
  } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');

  const handleJoinMeeting = async (meetingId) => {
    try {
      await joinMeetingContext(meetingId);
      toast.success('Successfully joined the meeting!');
    } catch (error) {
      console.error('Error joining meeting:', error);
      toast.error(error.message || 'Failed to join meeting');
    }
  };

  const handleLeaveMeeting = async (meetingId) => {
    try {
      await leaveMeetingContext(meetingId);
      toast.success('Successfully left the meeting');
    } catch (error) {
      console.error('Error leaving meeting:', error);
      toast.error(error.message || 'Failed to leave meeting');
    }
  };

  const handleCancelMeeting = async (meetingId) => {
    try {
      await cancelMeetingContext(meetingId);
      toast.success('Meeting cancelled successfully');
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      toast.error(error.message || 'Failed to cancel meeting');
    }
  };

  const filteredMeetings = Array.isArray(meetings) 
    ? meetings.filter(meeting => {
        if (!meeting) return false;
        
        const matchesSearch = 
          (meeting.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (meeting.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesMode = filterMode === 'all' || meeting.mode === filterMode;
        return matchesSearch && matchesMode;
      })
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple"></div>
      </div>
    );
  }

  const renderCards = () => {
    if (!Array.isArray(meetings) || meetings.length === 0) {
      return null;
    }
    
    return meetings.map(meeting => {
      if (!meeting) return null;
      
      // Determine if this is the user's meeting
      const isOrganizer = user && (
        meeting.organizerId === user._id || 
        meeting.creatorId === user._id || 
        meeting.creatorEmail === user.email
      );

      // Determine if user has joined this meeting
      const isJoined = meeting.userHasJoined || false;

      // Determine appropriate button label and handler
      let buttonLabel, onActionHandler, onDeleteHandler;

      if (type === 'created' || isOrganizer) {
        buttonLabel = 'Cancel';
        onActionHandler = handleCancelMeeting;
        onDeleteHandler = handleCancelMeeting;
      } else if (isJoined) {
        buttonLabel = 'Leave';
        onActionHandler = handleLeaveMeeting;
        onDeleteHandler = null;
      } else {
        buttonLabel = 'Join';
        onActionHandler = handleJoinMeeting;
        onDeleteHandler = null;
      }

      return (
        <MeetingCard
          key={meeting.id}
          meeting={meeting}
          isJoined={isJoined}
          onJoin={onActionHandler}
          onDelete={onDeleteHandler}
          buttonLabel={buttonLabel}
        />
      );
    });
  };

  const hasFilteredMeetings = filteredMeetings.length > 0;
  const hasMeetings = Array.isArray(meetings) && meetings.length > 0;

  return (
    <div className="space-y-6">
      {hasMeetings && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
            >
              <option value="all">All Meetings</option>
              <option value="online">Online</option>
              <option value="offline">In-Person</option>
            </select>
          </div>
        </div>
      )}

      {hasMeetings ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderCards()}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">{emptyMessage}</p>
        </div>
      )}

      {hasMeetings && !hasFilteredMeetings && searchQuery && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No meetings match your search</p>
        </div>
      )}
    </div>
  );
};

export default MeetingList; 