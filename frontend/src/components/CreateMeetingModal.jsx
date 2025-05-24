import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, Users, Book } from 'lucide-react';
import { createMeeting, updateMeeting } from '../services/meetingService';
import { useAppContext } from '../context/AppContext';
import { toast } from 'sonner';

const CreateMeetingModal = ({ isOpen, onClose, onCreateMeeting, isEditing = false, initialData = null }) => {
  const { user, topics, loading, addMeeting, refreshMeetings } = useAppContext();
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    topic: '',
    date: '',
    time: '',
    location: '',
    mode: 'online',
    capacity: 10,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data if editing an existing meeting
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        title: initialData.title || '',
        subtitle: initialData.subtitle || '',
        description: initialData.description || '',
        topic: initialData.topic || '',
        date: initialData.date || '',
        time: initialData.time || '',
        location: initialData.location || '',
        mode: initialData.mode || 'online',
        capacity: initialData.capacity || 10,
      });
    }
  }, [isEditing, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create a meeting');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a meeting object that matches the backend schema
      const meetingData = {
        title: formData.title,
        subtitle: formData.subtitle || '',
        description: formData.description,
        topic: formData.topic, // This should be the Topic ObjectId
        scheduledTime: new Date(`${formData.date}T${formData.time}`).toISOString(),
        duration: 60, // Default duration of 60 minutes
        location: formData.location,
        mode: formData.mode,
        capacity: parseInt(formData.capacity),
        status: 'scheduled'
      };
      
      // Determine whether to create or update a meeting
      let resultMeeting;
      if (isEditing && initialData?.id) {
        resultMeeting = await updateMeeting(initialData.id, meetingData);
        toast.success('Meeting updated successfully!');
        await refreshMeetings(); // Refresh all meetings in the context
      } else {
        resultMeeting = await createMeeting(meetingData);
        
        // Add to context
        addMeeting({
          id: resultMeeting._id,
          title: resultMeeting.title,
          subtitle: resultMeeting.subtitle || resultMeeting.description,
          description: resultMeeting.description,
          creatorName: user.fullName,
          creatorId: user._id,
          creatorEmail: user.email,
          creatorImage: user.profilePicture || 'https://i.pravatar.cc/150?img=1',
          date: new Date(resultMeeting.scheduledTime).toISOString().split('T')[0],
          time: new Date(resultMeeting.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          location: resultMeeting.location,
          mode: resultMeeting.mode,
          participantCount: 1, // Organizer is automatically a participant
          capacity: resultMeeting.capacity || 10,
          organizerId: user._id,
          topicId: resultMeeting.topic,
          status: resultMeeting.status,
          _original: resultMeeting
        });
        
        toast.success('Meeting created successfully!');
      }
      
      // If onCreateMeeting callback exists, call it with the new/updated meeting
      if (onCreateMeeting) {
        onCreateMeeting(resultMeeting);
      }
      
      // Clear form and close modal
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        topic: '',
        date: '',
        time: '',
        location: '',
        mode: 'online',
        capacity: 10,
      });
      
      onClose();
    } catch (error) {
      console.error('Meeting operation error:', error);
      toast.error(error.error || `Failed to ${isEditing ? 'update' : 'create'} meeting`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isLoading = loading.user || loading.topics;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-panel border-purple p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Meeting' : 'Create New Meeting'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-white font-semibold mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
                />
              </div>

              <div>
                <label htmlFor="subtitle" className="block text-white font-semibold mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  className="w-full p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="topic" className="block text-white font-semibold mb-2">
                  Topic
                </label>
                <div className="relative">
                  <Book className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple appearance-none"
                  >
                    <option value="">Select a topic</option>
                    {topics.map(topic => (
                      <option key={topic._id} value={topic._id}>
                        {topic.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-white font-semibold mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-white font-semibold mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="time" className="block text-white font-semibold mb-2">
                  Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-white font-semibold mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="capacity" className="block text-white font-semibold mb-2">
                  Max Participants
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    required
                    className="w-full pl-10 p-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-white font-semibold mb-2">
                  Meeting Mode
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value="online"
                      checked={formData.mode === 'online'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-white">Online</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value="offline"
                      checked={formData.mode === 'offline'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-white">In-Person</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || !formData.topic}
              >
                {isSubmitting 
                  ? (isEditing ? 'Updating...' : 'Creating...') 
                  : (isEditing ? 'Update Meeting' : 'Create Meeting')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateMeetingModal;
