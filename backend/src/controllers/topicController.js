const Topic = require('../models/Topic');

// Get all topics
const getTopics = async (req, res) => {
  try {
    const topics = await Topic.find()
      .populate('createdBy', 'fullName email')
      .populate('participants', 'fullName email')
      .sort({ createdAt: -1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get topics for the current user
const getUserTopics = async (req, res) => {
  try {
    const topics = await Topic.find({
      $or: [
        { createdBy: req.user._id },
        { participants: req.user._id }
      ]
    })
      .populate('createdBy', 'fullName email')
      .populate('participants', 'fullName email')
      .sort({ createdAt: -1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get topic by ID
const getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
      .populate('createdBy', 'fullName email')
      .populate('participants', 'fullName email');
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    res.json(topic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new topic
const createTopic = async (req, res) => {
  try {
    const topic = new Topic({
      ...req.body,
      createdBy: req.user._id,
      participants: [req.user._id]
    });
    await topic.save();
    res.status(201).json(topic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a topic
const updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Check if user is the creator of the topic
    if (topic.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this topic' });
    }

    const allowedUpdates = ['title', 'description', 'category', 'tags'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    Object.assign(topic, updates);
    await topic.save();
    res.json(topic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a topic
const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Check if user is the creator of the topic
    if (topic.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this topic' });
    }

    await topic.remove();
    res.json(topic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Join a topic
const joinTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Check if user is already a participant
    if (topic.participants.includes(req.user._id)) {
      return res.status(400).json({ error: 'Already joined this topic' });
    }

    topic.participants.push(req.user._id);
    await topic.save();
    res.json(topic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTopics,
  getUserTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  joinTopic
}; 