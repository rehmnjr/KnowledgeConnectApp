import React from 'react';
import MeetingsSection from '../components/MeetingsSection';
import { Calendar, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { deleteMeeting } from '../services/meetingService';
import { toast } from 'sonner';

const ScheduledMeetings = () => {
  const { 
    user, 
    createdMeetings, 
    joinedMeetings,
    joinedMeetingIds, 
    userMeetingMappings,
    loading, 
    removeMeeting, 
    removeJoinedMeeting, 
    refreshMeetings,
    refreshUserMeetingMappings 
  } = useAppContext();
  
  const navigate = useNavigate();

  // Handle canceling a meeting (only for meetings created by the user)
  const handleCancelMeeting = async (meetingId) => {
    try {
      toast.loading('Canceling meeting...');
      await deleteMeeting(meetingId);
      
      // Remove the meeting locally
      removeMeeting(meetingId);
    
      // Refresh meetings from API
      await refreshMeetings();
      
      toast.dismiss();
      toast.success('Meeting canceled successfully');
    } catch (error) {
      toast.dismiss();
      console.error('Error canceling meeting:', error);
      toast.error('Failed to cancel meeting');
    }
  };

  // Handle leaving a meeting (only for meetings joined by the user)
  const handleLeaveMeeting = async (meetingId) => {
    try {
      toast.loading('Leaving meeting...');
      await removeJoinedMeeting(meetingId);
      
      // Refresh user meeting mappings
      await refreshUserMeetingMappings();
      
      toast.dismiss();
      toast.success('Left meeting successfully');
    } catch (error) {
      toast.dismiss();
      console.error('Error leaving meeting:', error);
      toast.error('Failed to leave meeting');
    }
  };

  if (loading.user || loading.meetings || loading.userMeetings) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-purple" />
      </div>
    );
  }

  const activeMeetingMappings = userMeetingMappings.filter(mapping => 
    mapping.status === 'accepted'
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6 ml-[45px] mt-[-12px]">Scheduled Meetings</h1>
      
      <div className="glass-panel p-6 mb-8">
        <div className="flex items-center mb-4">
          <Calendar className="h-6 w-6 text-purple mr-3" />
          <h2 className="text-xl font-semibold text-white">Your Meeting Schedule</h2>
        </div>
        <p className="text-gray-300">
          View and manage your created and joined meetings. Keep track of your upcoming knowledge-sharing sessions.
        </p>
      </div>
      
      <MeetingsSection 
        title="Meetings You Created" 
        showSeeAll={false}
        meetings={createdMeetings}
        limit={10}
        onJoinMeeting={null}
        joinedMeetings={[]}
        buttonLabel="View Details"
        showButton={false}
      />
      
      <MeetingsSection 
        title="Meetings You Joined" 
        showSeeAll={false}
        meetings={joinedMeetings}
        limit={10}
        onJoinMeeting={null}
        joinedMeetings={joinedMeetingIds}
        buttonLabel="View Details"
        showButton={false}
      />
      
      {activeMeetingMappings.length > 0 && (
        <div className="glass-panel p-6 mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">Meeting Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple/10 p-4 rounded-lg text-center">
              <h4 className="text-lg font-medium text-white">Total Joined</h4>
              <p className="text-3xl font-bold text-purple mt-2">{activeMeetingMappings.length}</p>
            </div>
            <div className="bg-purple/10 p-4 rounded-lg text-center">
              <h4 className="text-lg font-medium text-white">As Organizer</h4>
              <p className="text-3xl font-bold text-purple mt-2">
                {activeMeetingMappings.filter(m => m.role === 'organizer').length}
              </p>
            </div>
            <div className="bg-purple/10 p-4 rounded-lg text-center">
              <h4 className="text-lg font-medium text-white">As Participant</h4>
              <p className="text-3xl font-bold text-purple mt-2">
                {activeMeetingMappings.filter(m => m.role === 'participant').length}
              </p>
            </div>
            <div className="bg-purple/10 p-4 rounded-lg text-center">
              <h4 className="text-lg font-medium text-white">Earliest Join</h4>
              <p className="text-xl font-bold text-purple mt-2">
                {activeMeetingMappings.length > 0 ? 
                  new Date(Math.min(...activeMeetingMappings.map(m => new Date(m.joinedAt))))
                    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      )}
      
      {createdMeetings.length === 0 && joinedMeetings.length === 0 && (
        <div className="glass-panel p-8 text-center mt-8">
          <h3 className="text-xl font-semibold text-white mb-3">No Meetings Scheduled</h3>
          <p className="text-gray-400 mb-6">
            You haven't created or joined any meetings yet.
          </p>
          <a href="/" className="btn-primary ">
            Discover Meetings
          </a>
        </div>
      )}
    </div>
  );
};

export default ScheduledMeetings;