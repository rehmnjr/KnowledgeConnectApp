import React from 'react';
import { Link } from 'react-router-dom';
import MeetingCard from './MeetingCard';

const MeetingsSection = ({ 
  title, 
  showSeeAll = true, 
  meetings = [], 
  limit = 3, 
  linkTo = '/discover', 
  onJoinMeeting, 
  joinedMeetings = [],
  buttonLabel = 'Join',
  showButton = true
}) => {
  const displayedMeetings = meetings.slice(0, limit);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {showSeeAll && (
          <Link to={linkTo} className="text-purple hover:text-purple-light text-sm">
            See all
          </Link>
        )}
      </div>

      {displayedMeetings.length === 0 ? (
        <div className="glass-panel p-8 text-center">
          <p className="text-gray-400">No meetings available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedMeetings.map(meeting => (
            <MeetingCard 
              key={meeting.id} 
              meeting={meeting}
              isJoined={joinedMeetings.includes(meeting.id)}
              onJoin={onJoinMeeting}
              buttonLabel={buttonLabel}
              showButton={showButton}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingsSection;
