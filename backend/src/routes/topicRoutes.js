const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all topics
router.get('/', topicController.getTopics);

// Get topics for the current user
router.get('/user', topicController.getUserTopics);

// Get topic by ID
router.get('/:id', topicController.getTopicById);

// Create a new topic
router.post('/', topicController.createTopic);

// Update a topic
router.patch('/:id', topicController.updateTopic);

// Delete a topic
router.delete('/:id', topicController.deleteTopic);

// Join a topic
router.post('/:id/join', topicController.joinTopic);

module.exports = router; 