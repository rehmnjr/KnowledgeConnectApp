# KnowledgeConnect Backend

The backend API for KnowledgeConnect platform built with Node.js, Express, and MongoDB.

## Features

- RESTful API architecture
- MongoDB database integration
- JWT authentication
- User management
- Topic management
- Meeting scheduling

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Deployment Options

### Option 1: Render.com

1. Sign up for a free account at [Render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new Web Service
4. Configure:
   - Build Command: `npm install`
   - Start Command: `node src/server.js`
   - Add environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure random string for JWT tokens
     - `NODE_ENV`: Set to `production`

### Option 2: Railway.app

1. Sign up at [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add the same environment variables as above

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   PORT=5001
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## API Documentation

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get token

### User Management
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update user profile

### Topics
- `GET /api/topics` - Get all topics
- `POST /api/topics` - Create a new topic
- `GET /api/topics/:id` - Get a specific topic
- `PATCH /api/topics/:id` - Update a topic
- `DELETE /api/topics/:id` - Delete a topic

### Meetings
- `GET /api/meetings` - Get all meetings
- `POST /api/meetings` - Create a new meeting
- `GET /api/meetings/:id` - Get a specific meeting
- `PUT /api/meetings/:id` - Update a meeting
- `DELETE /api/meetings/:id` - Delete a meeting
- `POST /api/meetings/:id/join` - Join a meeting
- `POST /api/meetings/:id/leave` - Leave a meeting 