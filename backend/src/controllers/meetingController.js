const Meeting = require('../models/Meeting');
const UserMeetingMapping = require('../models/UserMeetingMapping');
const mongoose = require('mongoose');

// Create a new meeting
const createMeeting = async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['title', 'description', 'topic', 'scheduledTime', 'duration', 'location', 'capacity', 'mode'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ error: `${field} is required` });
            }
        }

        // Validate topic is a valid ObjectId
        if (!req.body.topic.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid topic ID format' });
        }

        // Create new meeting with validated data
        const meeting = new Meeting({
            title: req.body.title,
            subtitle: req.body.subtitle,
            description: req.body.description,
            topic: req.body.topic,
            scheduledTime: new Date(req.body.scheduledTime),
            duration: parseInt(req.body.duration),
            location: req.body.location,
            capacity: parseInt(req.body.capacity),
            mode: req.body.mode,
            status: req.body.status || 'scheduled',
            organizer: req.user._id,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await meeting.save();

        // Create organizer mapping in UserMeetingMapping
        const organizerMapping = new UserMeetingMapping({
            user: req.user._id,
            meeting: meeting._id,
            status: 'accepted',
            role: 'organizer',
            joinedAt: Date.now()
        });
        
        await organizerMapping.save();

        // Return the populated meeting to the client
        const populatedMeeting = await Meeting.findById(meeting._id)
            .populate('organizer', 'fullName email profileImage')
            .populate('topic', 'name');

        res.status(201).json(populatedMeeting);
    } catch (error) {
        console.error('Meeting creation error:', error);
        res.status(400).json({ error: error.message });
    }
};

// Get all meetings
const getMeetings = async (req, res) => {
    try {
        // Get all meetings where the user is an organizer
        const allMeetings = await Meeting.find({})
            .populate('organizer', 'fullName email profileImage')
            .populate('topic', 'name');
        
            
        allMeetings.sort((a, b) => a.scheduledTime - b.scheduledTime);
        
        // For each meeting, get the participant count
        const meetingsWithCount = await Promise.all(
            allMeetings.map(async (meeting) => {
                const participantCount = await UserMeetingMapping.countDocuments({
                    meeting: meeting._id,
                    status: 'accepted'
                });
                
                // Convert to plain object to add the participant count
                const meetingObj = meeting.toObject();
                meetingObj.participantCount = participantCount;
                
                return meetingObj;
            })
        );
        
        res.json(meetingsWithCount);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get meeting by ID
const getMeetingById = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id)
            .populate('organizer', 'fullName email profileImage')
            .populate('topic', 'name');

        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        
        // Get participant count and participants list
        const participantCount = await UserMeetingMapping.countDocuments({
            meeting: meeting._id,
            status: 'accepted'
        });
        
        const participants = await UserMeetingMapping.find({
            meeting: meeting._id,
            status: 'accepted'
        }).populate('user', 'fullName email profileImage');
        
        // Convert to plain object to add the participant data
        const meetingObj = meeting.toObject();
        meetingObj.participantCount = participantCount;
        meetingObj.participants = participants;

        res.json(meetingObj);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update meeting
const updateMeeting = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'subtitle', 'description', 'scheduledTime', 'duration', 'location', 'meetingLink', 'status', 'capacity', 'mode'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates!' });
    }

    try {
        const meeting = await Meeting.findOne({ _id: req.params.id, organizer: req.user._id });

        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        updates.forEach(update => meeting[update] = req.body[update]);
        meeting.updatedAt = Date.now();
        await meeting.save();
        res.json(meeting);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete meeting
const deleteMeeting = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const meeting = await Meeting.findOneAndDelete({ 
            _id: req.params.id, 
            organizer: req.user._id 
        }).session(session);

        if (!meeting) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Meeting not found' });
        }
        
        // Delete all user-meeting mappings for this meeting
        await UserMeetingMapping.deleteMany({ meeting: req.params.id }).session(session);
        
        await session.commitTransaction();
        session.endSession();
        
        res.json(meeting);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ error: error.message });
    }
};

// Update meeting status
const updateMeetingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status || !['scheduled', 'in-progress', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const meeting = await Meeting.findOne({ _id: req.params.id, organizer: req.user._id });
        
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        
        meeting.status = status;
        meeting.updatedAt = Date.now();
        await meeting.save();
        
        res.json(meeting);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createMeeting,
    getMeetings,
    getMeetingById,
    updateMeeting,
    deleteMeeting,
    updateMeetingStatus
}; 