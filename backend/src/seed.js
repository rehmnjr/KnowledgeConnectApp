const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Topic = require('./models/Topic');
const Meeting = require('./models/Meeting');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing data
    await User.deleteMany({});
    await Topic.deleteMany({});
    await Meeting.deleteMany({});

    // Create users
    const users = await User.create([
      {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        studentEmail: 'john.student@university.edu',
        instituteName: 'University of Technology',
        country: 'United States',
        location: 'New York',
        qualification: 'Bachelor\'s Degree',
        course: 'Computer Science',
        expertise: ['Programming', 'Web Development', 'Data Structures'],
        bio: 'Passionate about technology and education'
      },
      {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 10),
        studentEmail: 'jane.student@university.edu',
        instituteName: 'Tech Institute',
        country: 'Canada',
        location: 'Toronto',
        qualification: 'Master\'s Degree',
        course: 'Artificial Intelligence',
        expertise: ['Machine Learning', 'Deep Learning', 'Python'],
        bio: 'AI researcher and educator'
      },
      {
        fullName: 'Mike Johnson',
        email: 'mike@example.com',
        password: await bcrypt.hash('password123', 10),
        studentEmail: 'mike.student@university.edu',
        instituteName: 'Science University',
        country: 'United Kingdom',
        location: 'London',
        qualification: 'PhD',
        course: 'Physics',
        expertise: ['Quantum Mechanics', 'Mathematics', 'Research'],
        bio: 'Physics professor and researcher'
      }
    ]);

    // Create topics
    const topics = await Topic.create([
      {
        title: 'Introduction to React',
        description: 'Learn the fundamentals of React and build modern web applications',
        category: 'technology',
        tags: ['react', 'javascript', 'web development'],
        createdBy: users[0]._id,
        participants: [users[0]._id, users[1]._id]
      },
      {
        title: 'Machine Learning Basics',
        description: 'Understanding the core concepts of machine learning and its applications',
        category: 'technology',
        tags: ['machine learning', 'python', 'data science'],
        createdBy: users[1]._id,
        participants: [users[1]._id, users[2]._id]
      },
      {
        title: 'Quantum Computing',
        description: 'Exploring the principles and potential of quantum computing',
        category: 'science',
        tags: ['quantum', 'physics', 'computing'],
        createdBy: users[2]._id,
        participants: [users[2]._id, users[0]._id]
      }
    ]);

    // Create meetings
    await Meeting.create([
      {
        topic: topics[0]._id,
        organizer: users[0]._id,
        participants: [
          { user: users[0]._id, status: 'accepted' },
          { user: users[1]._id, status: 'pending' }
        ],
        scheduledTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        duration: 60,
        meetingLink: 'https://meet.google.com/abc-xyz-123',
        status: 'scheduled'
      },
      {
        topic: topics[1]._id,
        organizer: users[1]._id,
        participants: [
          { user: users[1]._id, status: 'accepted' },
          { user: users[2]._id, status: 'accepted' }
        ],
        scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        duration: 90,
        meetingLink: 'https://meet.google.com/def-uvw-456',
        status: 'scheduled'
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData(); 