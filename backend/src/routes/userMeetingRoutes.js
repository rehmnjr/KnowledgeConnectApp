const express = require('express');
const router = express.Router();
const userMeetingController = require('../controllers/userMeetingController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// User meeting routes
router.post('/join/:meetingId', userMeetingController.joinMeeting);
router.patch('/leave/:meetingId', userMeetingController.leaveMeeting);
router.get('/user', userMeetingController.getUserMeetings);
router.get('/meeting/:meetingId', userMeetingController.getMeetingUsers);
router.delete('/meeting/:meetingId/all', userMeetingController.deleteAllMappings);
router.get('/meetings/:meetingId/stats', userMeetingController.getMeetingStats);
router.get('/meetings/:meetingId/count', userMeetingController.getMeetingParticipantCount);

module.exports = router; 