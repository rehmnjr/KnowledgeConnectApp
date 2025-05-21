const UserMeetingMapping = require('../models/UserMeetingMapping');
const Meeting = require('../models/Meeting');
const mongoose = require('mongoose');

// Create a mapping when a user joins a meeting
const createMapping = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { meetingId } = req.params;
    const userId = req.user._id;
    
    // Check if meeting exists
    const meeting = await Meeting.findById(meetingId).session(session);
    if (!meeting) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Check if meeting is full by counting existing mappings
    const participantCount = await UserMeetingMapping.countDocuments({
      meeting: meetingId,
      status: 'accepted'
    }).session(session);
    
    if (participantCount >= meeting.capacity) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Meeting has reached maximum participants' });
    }

    // Check if mapping already exists
    const existingMapping = await UserMeetingMapping.findOne({
      user: userId,
      meeting: meetingId
    }).session(session);

    if (existingMapping) {
      // If mapping exists but was previously left, update it
      if (existingMapping.status === 'left') {
        existingMapping.status = 'accepted';
        existingMapping.joinedAt = Date.now();
        await existingMapping.save({ session });

        await session.commitTransaction();
        session.endSession();
        
        return res.status(200).json(existingMapping);
      } else {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: 'You have already joined this meeting' });
      }
    }

    // Determine if user is organizer
    const isOrganizer = meeting.organizer.toString() === userId.toString();
    
    // Create new mapping
    const newMapping = new UserMeetingMapping({
      user: userId,
      meeting: meetingId,
      status: 'accepted',
      role: isOrganizer ? 'organizer' : 'participant',
      joinedAt: Date.now()
    });

    await newMapping.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    // Return populated mapping
    const populatedMapping = await UserMeetingMapping.findById(newMapping._id)
      .populate('user', 'fullName email profileImage')
      .populate({
        path: 'meeting',
        populate: [
          { path: 'organizer', select: 'fullName email profileImage' },
          { path: 'topic', select: 'name' }
        ]
      });
    
    res.status(201).json(populatedMapping);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating user-meeting mapping:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all mappings for the current user
const getUserMappings = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const mappings = await UserMeetingMapping.find({ user: userId })
      .populate('user', 'fullName email profileImage')
      .populate({
        path: 'meeting',
        populate: [
          { path: 'organizer', select: 'fullName email profileImage' },
          { path: 'topic', select: 'name' }
        ]
      })
      .sort({ joinedAt: -1 });
    
    res.status(200).json(mappings);
  } catch (error) {
    console.error('Error fetching user mappings:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all users for a meeting
const getMeetingUsers = async (req, res) => {
    try {
        const { meetingId } = req.params;
        
        // Get all mappings for this meeting
        const mappings = await UserMeetingMapping.find({ 
            meeting: meetingId,
            status: 'accepted'
        }).populate('user', 'fullName email profileImage');
        
        res.json(mappings);
    } catch (error) {
        console.error('Error fetching meeting users:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update mapping (for leaving a meeting)
const updateMapping = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { meetingId } = req.params;
    const userId = req.user._id;
    const { status, notes, feedback } = req.body;
    
    const mapping = await UserMeetingMapping.findOne({
      user: userId,
      meeting: meetingId
    }).session(session);
    
    if (!mapping) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Mapping not found' });
    }
    
    // Update mapping fields
    if (status) mapping.status = status;
    if (notes) mapping.notes = notes;
    if (feedback) {
      mapping.feedback = {
        ...mapping.feedback,
        ...feedback,
        submittedAt: feedback.rating ? Date.now() : mapping.feedback.submittedAt
      };
    }
    
    await mapping.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    // Return updated mapping
    const updatedMapping = await UserMeetingMapping.findById(mapping._id)
      .populate('user', 'fullName email profileImage')
      .populate({
        path: 'meeting',
        populate: [
          { path: 'organizer', select: 'fullName email profileImage' },
          { path: 'topic', select: 'name' }
        ]
      });
    
    res.status(200).json(updatedMapping);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating mapping:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get meeting stats
const getMeetingStats = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    const stats = await UserMeetingMapping.aggregate([
      { $match: { meeting: mongoose.Types.ObjectId(meetingId) } },
      { $group: {
          _id: '$status',
          count: { $sum: 1 },
          users: { $push: '$user' }
        }
      }
    ]);
    
    // Format results
    const formattedStats = {
      total: 0,
      accepted: 0,
      pending: 0,
      rejected: 0,
      left: 0
    };
    
    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });
    
    res.status(200).json(formattedStats);
  } catch (error) {
    console.error('Error fetching meeting stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get participant count for a meeting
const getMeetingParticipantCount = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    const count = await UserMeetingMapping.countDocuments({
      meeting: meetingId,
      status: 'accepted'
    });
    
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching participant count:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete all mappings for a meeting
const deleteAllMappings = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { meetingId } = req.params;
        
        // Check if user is the organizer of the meeting
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Meeting not found' });
        }
        
        // Only allow organizer to delete all mappings
        if (meeting.organizer.toString() !== req.user._id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ error: 'Only the meeting organizer can delete all mappings' });
        }
        
        // Delete all mappings for this meeting
        const result = await UserMeetingMapping.deleteMany({ 
            meeting: meetingId 
        }).session(session);
        
        await session.commitTransaction();
        session.endSession();
        
        res.status(200).json({ 
            message: 'All mappings deleted successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error deleting meeting mappings:', error);
        res.status(500).json({ error: error.message });
    }
};

// Export controllers
module.exports = {
    joinMeeting: createMapping,
    leaveMeeting: updateMapping,
    getUserMeetings: getUserMappings,
    getMeetingUsers,
    getMeetingStats,
    getMeetingParticipantCount,
    deleteAllMappings
}; 