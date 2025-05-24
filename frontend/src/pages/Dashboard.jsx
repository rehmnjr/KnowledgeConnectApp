import React from 'react';
import WelcomeCard from '../components/WelcomeCard';
import ActionButtons from '../components/ActionButtons';
import MeetingsSection from '../components/MeetingsSection';
import TopicsSection from '../components/TopicsSection';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { 
    user, 
    meetings, 
    topics, 
    joinedMeetingIds,
    loading, 
    addMeeting, 
    addJoinedMeeting,
    refreshUserMeetingMappings
  } = useAppContext();
  
  const navigate = useNavigate();

  const handleCreateMeeting = (newMeeting) => {
    addMeeting(newMeeting);
    toast.success('Meeting created successfully!');
  };

  const handleJoinMeeting = async (meetingId) => {
    if (joinedMeetingIds.includes(meetingId)) {
      toast.info('You are already a participant in this meeting');
      return;
    }
    
    try {
      toast.loading('Joining meeting...');
      await addJoinedMeeting(meetingId);
      
      // Refresh user-meeting mappings to ensure we have the latest data
      await refreshUserMeetingMappings();
      
      toast.dismiss();
      toast.success('Meeting joined successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error(error.error || 'Failed to join meeting');
    }
  };

  // Show loading state while fetching data
  if (!user) {
   navigate('/login');
    return null; // or a loading spinner
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6 ml-[45px] mt-[-12px]" >Dashboard 👋</h1>
      <WelcomeCard userName={user?.fullName} />
      <ActionButtons onCreateMeeting={handleCreateMeeting} />
      <MeetingsSection 
        title="Active Meetings" 
        meetings={meetings} 
        onJoinMeeting={handleJoinMeeting}
        joinedMeetings={joinedMeetingIds}
        limit={3}
      />
      <TopicsSection topics={topics.map((topic, index) => ({
        id: topic._id,
        title: topic.title,
        description: topic.description,
        image: `https://picsum.photos/id/${index + 155}/300/200`,
        date: new Date(topic.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        category: topic.category
      }))} />
    </div>
  );
};

export default Dashboard;
