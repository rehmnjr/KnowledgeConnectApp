require('dotenv').config();
const mongoose = require('mongoose');
const Meeting = require('../models/Meeting');
const UserMeetingMapping = require('../models/UserMeetingMapping');
const connectDB = require('../config/db');

// Connect to MongoDB
connectDB();

const migrateData = async () => {
  try {
    console.log('Starting migration of users to UserMeetingMapping collection...');
    
    // Get all meetings
    const meetings = await Meeting.find();
    console.log(`Found ${meetings.length} meetings to process`);
    
    let createdMappings = 0;
    let errors = 0;

    // Process each meeting
    for (const meeting of meetings) {
      try {
        // Create mapping for organizer
        const organizerMapping = {
          user: meeting.organizer,
          meeting: meeting._id,
          status: 'accepted',
          role: 'organizer',
          joinedAt: meeting.createdAt
        };
        
        const existingOrganizerMapping = await UserMeetingMapping.findOne({
          user: meeting.organizer,
          meeting: meeting._id
        });
        
        if (!existingOrganizerMapping) {
          await UserMeetingMapping.create(organizerMapping);
          createdMappings++;
          console.log(`Created organizer mapping for meeting: ${meeting._id}`);
        } else {
          console.log(`Organizer mapping already exists for meeting: ${meeting._id}`);
        }
        
        // If meeting has participants, create mappings for them
        if (meeting.participants && meeting.participants.length > 0) {
          for (const participant of meeting.participants) {
            if (!participant.user) continue;
            
            const participantMapping = {
              user: participant.user,
              meeting: meeting._id,
              status: participant.status || 'accepted',
              role: 'participant',
              joinedAt: meeting.updatedAt || meeting.createdAt
            };
            
            const existingParticipantMapping = await UserMeetingMapping.findOne({
              user: participant.user,
              meeting: meeting._id
            });
            
            if (!existingParticipantMapping) {
              await UserMeetingMapping.create(participantMapping);
              createdMappings++;
              console.log(`Created participant mapping for user: ${participant.user} in meeting: ${meeting._id}`);
            } else {
              console.log(`Participant mapping already exists for user: ${participant.user} in meeting: ${meeting._id}`);
            }
          }
        }
        
      } catch (error) {
        console.error(`Error processing meeting ${meeting._id}:`, error);
        errors++;
      }
    }
    
    console.log('\nMigration complete!');
    console.log(`Created ${createdMappings} user-meeting mappings`);
    console.log(`Encountered ${errors} errors`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

migrateData(); 