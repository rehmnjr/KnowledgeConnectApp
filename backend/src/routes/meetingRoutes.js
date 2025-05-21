const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// Meeting routes
router.post('/', meetingController.createMeeting);
router.get('/', meetingController.getMeetings);
router.get('/:id', meetingController.getMeetingById);
router.put('/:id', meetingController.updateMeeting);
router.delete('/:id', meetingController.deleteMeeting);
router.patch('/:id/status', meetingController.updateMeetingStatus);

module.exports = router; 