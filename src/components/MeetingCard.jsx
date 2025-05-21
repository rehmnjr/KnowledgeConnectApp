import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, Video, LogOut, X } from 'lucide-react';
import { toast } from 'sonner';
import MeetingDetailsModal from './MeetingDetailsModal';

const MeetingCard = ({ 
  meeting, 
  isJoined, 
  onJoin, 
  onDelete, 
  buttonLabel = 'Join',
  showButton = true 
}) => {
  const [joining, setJoining] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleJoinClick = (e) => {
    e.stopPropagation(); // Prevent card click event
    if (!onJoin) return;
    
    setJoining(true);
    
    try {
      onJoin(meeting.id);
    } catch (error) {
      console.error('Error in meeting action:', error);
    } finally {
      setTimeout(() => {
        setJoining(false);
      }, 500);
    }
  };

  const handleCardClick = () => {
    setShowDetails(true);
  };

  // Format the date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get participant count and remaining slots
  const participantCount = meeting.participantCount || 0;
  const remainingSlots = (meeting.capacity || 10) - participantCount;
  
  // Determine button icon based on label
  const getButtonIcon = () => {
    switch(buttonLabel.toLowerCase()) {
      case 'join':
        return <Video className="h-4 w-4 mr-2" />;
      case 'leave':
        return <LogOut className="h-4 w-4 mr-2" />;
      case 'cancel':
        return <X className="h-4 w-4 mr-2" />;
      default:
        return <Video className="h-4 w-4 mr-2" />;
    }
  };
  
  // Determine button color based on label
  const getButtonClasses = () => {
    if (joining) return 'bg-purple/50 text-white cursor-wait';
    if (isJoined && buttonLabel.toLowerCase() === 'join') return 'bg-green-600/50 text-white cursor-default';
    
    switch(buttonLabel.toLowerCase()) {
      case 'join':
        return 'bg-purple hover:bg-purple-dark text-white';
      case 'leave':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      case 'cancel':
        return 'bg-red-600 hover:bg-red-700 text-white';
      default:
        return 'bg-purple hover:bg-purple-dark text-white';
    }
  };

  return (
    <>
      <div 
        className="glass-panel border-purple animate-fade-in hover:shadow-md hover:shadow-purple/20 transition-all duration-300 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="p-4">
          <div className="flex items-center mb-4">
            <img 
              src={meeting.creatorImage || "https://i.pravatar.cc/150?img=3"} 
              alt={meeting.creatorName}
              className="w-10 h-10 rounded-full border border-white/30"
            />
            <div className="ml-3">
              <p className="text-white font-small">{meeting.creatorName}</p>
              <p className="text-xs text-gray-400">Creator</p>
            </div>
            <div className="ml-auto">
              <span className={`px-3 py-1 rounded-full text-xs ${meeting.mode === 'online' ? 'bg-green-900/50 text-green-400' : 'bg-orange-900/50 text-orange-400'}`}>
                {meeting.mode === 'online' ? 'Online' : 'In-Person'}
              </span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mt-2">{meeting.title}</h3>
          {meeting.subtitle && (
            <p className="text-sm text-purple-light">{meeting.subtitle}</p>
          )}
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-gray-300 text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(meeting.date)}</span>
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <Clock className="h-4 w-4 mr-2" />
              <span>{meeting.time || '19:00'}</span>
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{meeting.location || (meeting.mode === 'online' ? 'Zoom Meeting' : 'Campus Library')}</span>
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <Users className="h-4 w-4 mr-2" />
              <span>{participantCount} joined • {remainingSlots} slots left</span>
            </div>
          </div>

          {showButton && onJoin && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={handleJoinClick}
                disabled={joining || (isJoined && buttonLabel.toLowerCase() === 'join')}
                className={`w-full flex items-center justify-center py-2 rounded-lg transition-colors ${getButtonClasses()}`}
              >
                {joining ? (
                  'Processing...'
                ) : isJoined && buttonLabel.toLowerCase() === 'join' ? (
                  'Joined'
                ) : (
                  <>
                    {getButtonIcon()}
                    {buttonLabel}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <MeetingDetailsModal 
        meeting={meeting} 
        isOpen={showDetails} 
        onClose={() => setShowDetails(false)}
        onDelete={onDelete}
      />
    </>
  );
};

export default MeetingCard;
