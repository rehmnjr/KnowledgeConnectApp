import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import MeetingsSection from '../components/MeetingsSection';
import { getCurrentUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { getMeetings } from '../services/meetingService';
import { getTopics } from '../services/topicService';
import { toast } from 'sonner';

const DiscoverTopics = () => {
  const [meetings, setMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useState({
    term: '',
    date: '',
    category: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [joinedMeetingIds, setJoinedMeetingIds] = useState([]);
  const user = getCurrentUser();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load meetings and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch categories from topics
        const topicsData = await getTopics();
        const uniqueCategories = [...new Set(topicsData.map(topic => topic.category))];
        setCategories(uniqueCategories);
        
        // Fetch meetings
        const meetingsData = await getMeetings();
        
        // Transform meetings data to match the expected format
        const formattedMeetings = meetingsData.map(meeting => {
          // Safely format the date with fallback
          let formattedDate = '';
          try {
            // Try scheduledTime first, then fall back to date
            const dateValue = meeting.scheduledTime || meeting.date;
            const dateObj = new Date(dateValue);
            
            // Check if date is valid
            if (!isNaN(dateObj.getTime())) {
              formattedDate = dateObj.toISOString().split('T')[0];
            }
          } catch (err) {
            console.warn(`Invalid date for meeting ${meeting._id}:`, err);
          }
          
          return {
            id: meeting._id,
            title: meeting.title,
            subtitle: meeting.subtitle || meeting.description,
            creatorName: meeting.organizer?.fullName || 'Unknown',
            creatorImage: meeting.organizer?.profileImage || 'https://i.pravatar.cc/150?img=1',
            date: formattedDate,
            time: meeting.time || '19:00',
            location: meeting.location || (meeting.mode === 'online' ? 'Zoom Meeting' : 'Campus'),
            mode: meeting.mode || 'online',
            participantCount: meeting.participantCount || 0,
            capacity: meeting.capacity || 10,
            category: meeting.topic?.name || 'Uncategorized',
            topicId: meeting.topic?._id,
            creatorId: meeting.organizer?._id,
            organizerId: meeting.organizer?._id
          };
        });
        
        setMeetings(formattedMeetings);
        setFilteredMeetings(formattedMeetings);
        
        // Load joined meetings from localStorage
        const savedJoinedMeetings = localStorage.getItem('joinedMeetings');
    if (savedJoinedMeetings) {
      setJoinedMeetingIds(JSON.parse(savedJoinedMeetings));
    }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load meetings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search
  const handleSearch = (params) => {
    setSearchParams(params);
    
    let results = [...meetings];
    
    // Filter by term (title, subtitle, creator)
    if (params.term) {
      const term = params.term.toLowerCase();
      results = results.filter(meeting => 
        meeting.title.toLowerCase().includes(term) ||
        (meeting.subtitle && meeting.subtitle.toLowerCase().includes(term)) ||
        meeting.creatorName.toLowerCase().includes(term)
      );
    }
    
    // Filter by date
    if (params.date) {
      results = results.filter(meeting => meeting.date === params.date);
    }
    
    // Filter by category
    if (params.category) {
      results = results.filter(meeting => meeting.category === params.category);
    }
    
    setFilteredMeetings(results);
  };

  // Handle joining a meeting
  const handleJoinMeeting = (meetingId) => {
    if (!user) return;
    if (joinedMeetingIds.includes(meetingId)) return;
    
    setJoinedMeetingIds(prev => {
      const updated = [...prev, meetingId];
      localStorage.setItem('joinedMeetings', JSON.stringify(updated));
      return updated;
    });
    
    // Update the meeting with incremented participant count
    setMeetings(prevMeetings => 
      prevMeetings.map(meeting => 
        meeting.id === meetingId 
          ? { 
              ...meeting, 
              participantCount: (meeting.participantCount || 0) + 1
            }
          : meeting
      )
    );
    
    setFilteredMeetings(prevMeetings => 
      prevMeetings.map(meeting => 
        meeting.id === meetingId 
          ? { 
              ...meeting, 
              participantCount: (meeting.participantCount || 0) + 1
            }
          : meeting
      )
    );
    
    toast.success('You have joined the meeting!');
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6 ml-[45px] mt-[-12px]">Discover Topics</h1>
      
      <SearchBar onSearch={handleSearch} />
      
      <MeetingsSection 
        title="Available Meetings" 
        showSeeAll={false}
        meetings={filteredMeetings} 
        onJoinMeeting={handleJoinMeeting}
        joinedMeetings={joinedMeetingIds}
        limit={20}
      />
      
      {filteredMeetings.length === 0 && (
        <div className="glass-panel p-8 text-center">
          <p className="text-gray-400">No meetings found matching your criteria</p>
          <button
            onClick={() => handleSearch({ term: '', date: '', category: '' })}
            className="mt-4 btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default DiscoverTopics;