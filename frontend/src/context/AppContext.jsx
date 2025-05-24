import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser } from '../services/authService';
import { getMeetings, updateMeetingStatus } from '../services/meetingService';
import { getTopics } from '../services/topicService';
import { getUserMeetings, joinMeeting as joinMeetingAPI, leaveMeeting as leaveMeetingAPI } from '../services/userMeetingService';
import { toast } from 'sonner';

// Create context
const AppContext = createContext();

// Context Provider
export const AppProvider = ({ children }) => {
    // State
    const [user, setUser] = useState(null);
    const [meetings, setMeetings] = useState([]);
    const [topics, setTopics] = useState([]);
    const [joinedMeetingIds, setJoinedMeetingIds] = useState([]);
    const [userMeetingMappings, setUserMeetingMappings] = useState([]);
    const [loading, setLoading] = useState({
        user: true,
        meetings: true,
        topics: true,
        userMeetings: true
    });
    const [error, setError] = useState({
        user: null,
        meetings: null,
        topics: null,
        userMeetings: null
    });

    // Load user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Get user from cache if available
                const userData = await getCurrentUser(false); // false means don't force refresh
                setUser(userData);
                setLoading(prev => ({ ...prev, user: false }));
            } catch (err) {
                console.error('Error fetching user:', err);
                setError(prev => ({ ...prev, user: err.message || 'Failed to fetch user data' }));
                setLoading(prev => ({ ...prev, user: false }));
            }
        };

        // Set up listener for user data updates
        const handleUserUpdated = (event) => {
            setUser(event.detail);
        };

        // Listen for user-updated events
        window.addEventListener('user-updated', handleUserUpdated);

        fetchUser();

        // Clean up the listener
        return () => {
            window.removeEventListener('user-updated', handleUserUpdated);
        };
    }, []);

    // Load meetings data
    useEffect(() => {
        const fetchMeetings = async () => {
            if (!user) return;

            try {
                const meetingsData = await getMeetings();

                // Format API meetings for consistency
                const formattedMeetings = meetingsData.map(meeting => ({
                    id: meeting._id,
                    title: meeting.title,
                    subtitle: meeting.subtitle,
                    description: meeting.description,
                    creatorName: meeting.organizer?.fullName || 'Unknown',
                    creatorEmail: meeting.organizer?.email,
                    creatorId: meeting.organizer?._id,
                    creatorImage: meeting.organizer?.profilePicture || 'https://i.pravatar.cc/150?img=1',
                    date: new Date(meeting.scheduledTime).toISOString().split('T')[0],
                    time: new Date(meeting.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    location: meeting.location,
                    mode: meeting.mode,
                    participantCount: meeting.participantCount || 0,
                    capacity: meeting.capacity || 10,
                    organizerId: meeting.organizer?._id,
                    topicId: meeting.topic?._id,
                    topic: meeting.topic,
                    status: meeting.status,
                    _original: meeting
                }));

                setMeetings(formattedMeetings);
                setLoading(prev => ({ ...prev, meetings: false }));
            } catch (err) {
                console.error('Error fetching meetings:', err);
                setError(prev => ({ ...prev, meetings: err.message || 'Failed to fetch meetings' }));
                setLoading(prev => ({ ...prev, meetings: false }));
            }
        };

        fetchMeetings();
    }, [user]);

    // Load user-meeting mappings
    useEffect(() => {
        const fetchUserMeetingMappings = async () => {
            if (!user) return;

            try {
                setLoading(prev => ({ ...prev, userMeetings: true }));
                const mappingsData = await getUserMeetings();

                setUserMeetingMappings(mappingsData);

                // Extract joined meeting IDs from mappings
                const joinedIds = mappingsData
                    .filter(mapping => mapping.status === 'accepted')
                    .map(mapping => mapping.meeting._id);

                setJoinedMeetingIds(joinedIds);
                setLoading(prev => ({ ...prev, userMeetings: false }));
            } catch (err) {
                console.error('Error fetching user-meeting mappings:', err);
                setError(prev => ({ ...prev, userMeetings: err.message || 'Failed to fetch user meetings' }));
                setLoading(prev => ({ ...prev, userMeetings: false }));
            }
        };

        fetchUserMeetingMappings();
    }, [user]);

    // Load topics data
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const topicsData = await getTopics();
                setTopics(topicsData);
                setLoading(prev => ({ ...prev, topics: false }));
            } catch (err) {
                console.error('Error fetching topics:', err);
                setError(prev => ({ ...prev, topics: err.message || 'Failed to fetch topics' }));
                setLoading(prev => ({ ...prev, topics: false }));
            }
        };

        fetchTopics();
    }, []);

    // Compute derived data
    const createdMeetings = user ? meetings.filter(meeting =>
        (meeting.creatorId && meeting.creatorId === user._id) ||
        (meeting.organizerId && meeting.organizerId === user._id) ||
        (meeting.creatorEmail && meeting.creatorEmail === user.email) ||
        (meeting._original && meeting._original.organizer && meeting._original.organizer._id === user._id)
    ) : [];

    const joinedMeetings = user ? meetings.filter(meeting =>
        joinedMeetingIds.includes(meeting.id)
    ) : [];

    // Actions
    const updateMeetings = (newMeetings) => {
        setMeetings(newMeetings);
    };

    const addMeeting = (meeting) => {
        setMeetings(prev => [meeting, ...prev]);
    };

    const removeMeeting = (meetingId) => {
        setMeetings(prev => prev.filter(m => m.id !== meetingId));
    };

    const updateJoinedMeetings = (ids) => {
        setJoinedMeetingIds(ids);
    };

    const addJoinedMeeting = async (meetingId) => {
        try {
            // Call the API to join the meeting
            const mapping = await joinMeetingAPI(meetingId);
            
            // Update the mappings list
            setUserMeetingMappings(prev => [...prev, mapping]);
            
            // Update the joined meeting IDs
            setJoinedMeetingIds(prev => [...prev, mapping.meeting._id]);
            
            // Update participant count in meetings
            setMeetings(prev => prev.map(meeting => 
                meeting.id === meetingId
                    ? { ...meeting, participantCount: (meeting.participantCount || 0) + 1 }
                    : meeting
            ));
            
            return mapping;
        } catch (error) {
            console.error('Error joining meeting:', error);
            toast.error(error.error || 'Failed to join meeting');
            throw error;
        }
    };

    const removeJoinedMeeting = async (meetingId) => {
        try {
            // Call the API to leave the meeting
            await leaveMeetingAPI(meetingId);
            
            // Update the mappings list
            setUserMeetingMappings(prev => 
                prev.map(mapping => 
                    mapping.meeting._id === meetingId 
                        ? { ...mapping, status: 'left' } 
                        : mapping
                )
            );
            
            // Update the joined meeting IDs
            setJoinedMeetingIds(prev => prev.filter(id => id !== meetingId));
            
            // Update participant count in meetings
            setMeetings(prev => prev.map(meeting => 
                meeting.id === meetingId && meeting.participantCount > 0
                    ? { ...meeting, participantCount: meeting.participantCount - 1 }
                    : meeting
            ));
            
            return true;
        } catch (error) {
            console.error('Error leaving meeting:', error);
            toast.error(error.error || 'Failed to leave meeting');
            throw error;
        }
    };

    // Refresh functions
    const refreshMeetings = async () => {
        setLoading(prev => ({ ...prev, meetings: true }));
        try {
            const meetingsData = await getMeetings();
            
            // Format API meetings
            const formattedMeetings = meetingsData.map(meeting => ({
                id: meeting._id,
                title: meeting.title,
                subtitle: meeting.description,
                description: meeting.description,
                creatorName: meeting.organizer?.fullName || 'Unknown',
                creatorEmail: meeting.organizer?.email,
                creatorId: meeting.organizer?._id,
                creatorImage: meeting.organizer?.profilePicture || 'https://i.pravatar.cc/150?img=1',
                date: new Date(meeting.scheduledTime).toISOString().split('T')[0],
                time: new Date(meeting.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                location: meeting.meetingLink || meeting.location || 'TBD',
                mode: meeting.mode || 'online',
                participantCount: meeting.participantCount || 0,
                capacity: meeting.capacity || 10,
                organizerId: meeting.organizer?._id,
                topicId: meeting.topic?._id,
                topic: meeting.topic,
                status: meeting.status,
                _original: meeting
            }));
            
            setMeetings(formattedMeetings);
            toast.success('Meetings refreshed');
        } catch (err) {
            console.error('Error refreshing meetings:', err);
            setError(prev => ({ ...prev, meetings: err.message || 'Failed to refresh meetings' }));
            toast.error('Failed to refresh meetings');
        } finally {
            setLoading(prev => ({ ...prev, meetings: false }));
        }
    };

    const refreshUserMeetingMappings = async () => {
        setLoading(prev => ({ ...prev, userMeetings: true }));
        try {
            const mappingsData = await getUserMeetings();
            
            setUserMeetingMappings(mappingsData);
            
            // Extract joined meeting IDs from mappings
            const joinedIds = mappingsData
                .filter(mapping => mapping.status === 'accepted')
                .map(mapping => mapping.meeting._id);
            
            setJoinedMeetingIds(joinedIds);
            toast.success('User meeting mappings refreshed');
        } catch (err) {
            console.error('Error refreshing user-meeting mappings:', err);
            setError(prev => ({ ...prev, userMeetings: err.message || 'Failed to refresh user meetings' }));
            toast.error('Failed to refresh user meetings');
        } finally {
            setLoading(prev => ({ ...prev, userMeetings: false }));
        }
    };

    const refreshTopics = async () => {
        setLoading(prev => ({ ...prev, topics: true }));
        try {
            const topicsData = await getTopics();
            setTopics(topicsData);
            toast.success('Topics refreshed');
        } catch (err) {
            console.error('Error refreshing topics:', err);
            setError(prev => ({ ...prev, topics: err.message || 'Failed to refresh topics' }));
            toast.error('Failed to refresh topics');
        } finally {
            setLoading(prev => ({ ...prev, topics: false }));
        }
    };

    const refreshUser = async () => {
        setLoading(prev => ({ ...prev, user: true }));
        try {
            const userData = await getCurrentUser(true); // true means force refresh
            setUser(userData);
            setLoading(prev => ({ ...prev, user: false }));
            return userData;
        } catch (err) {
            console.error('Error refreshing user:', err);
            setError(prev => ({ ...prev, user: err.message || 'Failed to refresh user data' }));
            setLoading(prev => ({ ...prev, user: false }));
            throw err;
        }
    };

    const refreshAll = async () => {
        setLoading({ user: true, meetings: true, topics: true, userMeetings: true });
        await Promise.all([
            refreshUser(), 
            refreshMeetings(), 
            refreshTopics(),
            refreshUserMeetingMappings()
        ]);
    };

    // Add the cancelMeeting function to the provider component
    const cancelMeeting = async (meetingId) => {
        try {
            // Update meeting status to 'cancelled'
            await updateMeetingStatus(meetingId, 'cancelled');
            
            // Update meetings in the context
            setMeetings(prev => prev.map(meeting => 
                meeting.id === meetingId
                    ? { ...meeting, status: 'cancelled' }
                    : meeting
            ));
            
            toast.success('Meeting cancelled successfully');
            return true;
        } catch (error) {
            console.error('Error cancelling meeting:', error);
            toast.error(error.error || 'Failed to cancel meeting');
            throw error;
        }
    };

    const value = {
        // Data
        user,
        meetings,
        topics,
        joinedMeetingIds,
        userMeetingMappings,
        createdMeetings,
        joinedMeetings,
        
        // Loading and error states
        loading,
        error,
        
        // Actions
        updateMeetings,
        addMeeting,
        removeMeeting,
        updateJoinedMeetings,
        addJoinedMeeting,
        removeJoinedMeeting,
        cancelMeeting,
        
        // Refresh functions
        refreshMeetings,
        refreshTopics,
        refreshUser,
        refreshUserMeetingMappings,
        refreshAll
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook for using the context
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}; 