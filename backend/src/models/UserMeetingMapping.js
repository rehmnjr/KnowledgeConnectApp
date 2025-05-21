const mongoose = require('mongoose');

const userMeetingMappingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'left'],
    default: 'accepted'
  },
  role: {
    type: String,
    enum: ['participant', 'organizer'],
    default: 'participant'
  },
  notes: {
    type: String,
    default: ''
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comment: {
      type: String,
      default: ''
    },
    submittedAt: {
      type: Date,
      default: null
    }
  }
});

// Create a compound index to ensure each user-meeting pair is unique
userMeetingMappingSchema.index({ user: 1, meeting: 1 }, { unique: true });

module.exports = mongoose.model('UserMeetingMapping', userMeetingMappingSchema); 