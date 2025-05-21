import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, Users, Edit, Trash2, ExternalLink, AlertTriangle, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getMeetingUsers } from '../services/userMeetingService';
import { deleteMeeting, updateMeeting } from '../services/meetingService';
import { deleteAllMeetingMappings } from '../services/userMeetingService';
import { toast } from 'sonner';
import CreateMeetingModal from './CreateMeetingModal';

const DeleteConfirmationDialog = ({ isOpen, onCancel, onConfirm, meetingTitle, isDeleting }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="glass-panel border-red-500 p-6 w-full max-w-md">
        <div className="flex items-center mb-4 text-red-500">
          <AlertTriangle className="h-6 w-6 mr-3" />
          <h2 className="text-xl font-bold">Delete Meeting</h2>
        </div>
        
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete <span className="text-white font-semibold">"{meetingTitle}"</span>?
          This action will also remove all participant registrations and cannot be undone.
        </p>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-700 rounded-lg text-white"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white flex items-center"
          >
            {isDeleting ? (
              <>
                <span className="animate-pulse mr-2">●</span>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Meeting
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const MeetingDetailsModal = ({ meeting, isOpen, onClose, onDelete }) => {
  const { user, refreshMeetings, joinedMeetingIds, removeJoinedMeeting, refreshUserMeetingMappings } = useAppContext();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  const isOrganizer = user && (
    meeting?.organizerId === user._id || 
    meeting?.creatorId === user._id || 
    meeting?.creatorEmail === user.email
  );

  const isJoined = joinedMeetingIds?.includes(meeting?.id);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!isOpen || !meeting) return;
      
      setLoading(true);
      try {
        const data = await getMeetingUsers(meeting.id);
        setParticipants(data);
      } catch (error) {
        console.error('Error fetching participants:', error);
        toast.error('Failed to fetch participants');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [isOpen, meeting]);

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handleConfirmDelete = async () => {
    if (!isOrganizer || !meeting) return;
    
    setIsDeleting(true);
    try {
      // First delete all user-meeting mappings
      await deleteAllMeetingMappings(meeting.id);
      
      // Then delete the meeting itself
      await deleteMeeting(meeting.id);
      
      toast.success('Meeting deleted successfully');
      if (onDelete) onDelete(meeting.id);
      setShowDeleteConfirmation(false);
      onClose();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast.error('Failed to delete meeting');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleUpdateMeeting = async (updatedMeeting) => {
    try {
      await refreshMeetings();
      setShowEditModal(false);
      onClose();
      toast.success('Meeting updated successfully');
    } catch (error) {
      console.error('Error updating meeting:', error);
      toast.error('Failed to update meeting');
    }
  };

  const handleLeaveMeeting = async () => {
    if (!meeting || isOrganizer) return;
    
    setIsLeaving(true);
    try {
      await removeJoinedMeeting(meeting.id);
      
      // Refresh user meeting mappings
      await refreshUserMeetingMappings();
      
      toast.success('Left meeting successfully');
      onClose();
    } catch (error) {
      console.error('Error leaving meeting:', error);
      toast.error('Failed to leave meeting');
    } finally {
      setIsLeaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isOpen || !meeting) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="glass-panel border-purple p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{meeting.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6">
            {meeting.subtitle && (
              <p className="text-lg text-purple-light mb-4">{meeting.subtitle}</p>
            )}
            <p className="text-gray-300 mb-6 whitespace-pre-line">{meeting.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-300">
                <Calendar className="h-5 w-5 mr-3 text-purple" />
                <span>{formatDate(meeting.date)}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Clock className="h-5 w-5 mr-3 text-purple" />
                <span>{meeting.time || '19:00'}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="h-5 w-5 mr-3 text-purple" />
                <span className="flex-1 break-all">
                  {meeting.location || (meeting.mode === 'online' ? 'Zoom Meeting' : 'Campus Library')}
                  {meeting.mode === 'online' && meeting.location && meeting.location.startsWith('http') && (
                    <a 
                      href={meeting.location} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center ml-2 text-purple hover:text-purple-light"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </span>
              </div>
              <div className="flex items-center text-gray-300">
                <Users className="h-5 w-5 mr-3 text-purple" />
                <span>{meeting.participantCount || 0} joined • {((meeting.capacity || 10) - (meeting.participantCount || 0))} slots left</span>
              </div>
            </div>

            <div className="flex items-center mb-4">
              <img 
                src={meeting.creatorImage || "https://i.pravatar.cc/150?img=3"} 
                alt={meeting.creatorName}
                className="w-10 h-10 rounded-full border border-white/30"
              />
              <div className="ml-3">
                <p className="text-white font-medium">{meeting.creatorName}</p>
                <p className="text-xs text-gray-400">Organizer</p>
              </div>
              <div className="ml-auto">
                <span className={`px-3 py-1 rounded-full text-xs ${meeting.mode === 'online' ? 'bg-green-900/50 text-green-400' : 'bg-orange-900/50 text-orange-400'}`}>
                  {meeting.mode === 'online' ? 'Online' : 'In-Person'}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Participants</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple"></div>
              </div>
            ) : participants.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No participants yet</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {participants.map(mapping => (
                  <div key={mapping._id} className="flex items-center py-2 px-4 bg-black/20 rounded-lg">
                    <img 
                      src={mapping.user?.profileImage || "https://i.pravatar.cc/150?img=3"} 
                      alt={mapping.user?.fullName || 'Participant'}
                      className="w-8 h-8 rounded-full border border-white/30"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-white font-medium">{mapping.user?.fullName || 'Unknown user'}</p>
                      <p className="text-xs text-gray-400">{mapping.role === 'organizer' ? 'Organizer' : 'Participant'}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      Joined {new Date(mapping.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
            
            {isJoined && !isOrganizer && (
              <button
                onClick={handleLeaveMeeting}
                disabled={isLeaving}
                className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg flex items-center"
              >
                {isLeaving ? (
                  <span className="animate-pulse mr-2">●</span>
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                {isLeaving ? 'Leaving...' : 'Leave Meeting'}
              </button>
            )}
            
            {isOrganizer && (
              <>
                <button
                  onClick={handleEdit}
                  className="btn-primary flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <CreateMeetingModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onCreateMeeting={handleUpdateMeeting}
          isEditing={true}
          initialData={{
            id: meeting.id,
            title: meeting.title,
            subtitle: meeting.subtitle,
            description: meeting.description,
            topic: meeting.topicId,
            date: meeting.date,
            time: meeting.time,
            location: meeting.location,
            mode: meeting.mode,
            capacity: meeting.capacity,
          }}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={showDeleteConfirmation}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        meetingTitle={meeting.title}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default MeetingDetailsModal; 