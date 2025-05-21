# KnowledgeConnect

A platform for students to share knowledge and schedule meetings.

## Features

- User authentication and profile management
- Dashboard with overview
- Topic discovery and management
- Meeting scheduling and management
- Knowledge sharing capabilities
- Responsive design with modern UI

## Technologies Used

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- React Router
- React Query
- MongoDB
- Express.js
- Node.js
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js & npm installed

### Installation

1. Clone the repository:
```sh
git clone <YOUR_GIT_URL>
```

2. Navigate to the project directory:
```sh
cd <PROJECT_NAME>
```

3. Install dependencies:
```sh
npm install
```

4. Start the development server:
```sh
npm run dev
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

- `src/` - Source code
  - `components/` - Reusable UI components
  - `pages/` - Application pages
  - `lib/` - Utility functions and configurations
  - `hooks/` - Custom React hooks

## License

This project is licensed under the MIT License.

## Deployment Guide

### Frontend Deployment (GitHub Pages)

1. Fork this repository to your GitHub account
2. Update the repository name in `vite.config.ts`:
   ```ts
   base: process.env.NODE_ENV === 'production' ? '/KnowledgeConnect/' : '/',
   ```

3. Set up GitHub Pages:
   - Go to your repository settings
   - Navigate to "Pages"
   - Set source to "GitHub Actions"

4. Add the required secret in your repository:
   - Go to Settings > Secrets and variables > Actions
   - Add a new repository secret:
     - Name: `BACKEND_URL`
     - Value: Your backend deployment URL (e.g., `https://knowledgeconnect-backend.onrender.com`)

5. Push your changes to the main branch to trigger the workflow

### Backend Deployment (Render.com, Heroku, etc.)

1. Create a new web service on Render.com or Heroku
2. Link your GitHub repository (or deploy from your local machine)
3. Set the following environment variables:
   - `PORT`: 5001 (or let the platform decide)
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT token signing
   - `NODE_ENV`: production

4. Set the build command:
   ```
   cd backend && npm install
   ```

5. Set the start command:
   ```
   cd backend && node src/server.js
   ```

6. Update the allowed origins in `backend/src/server.js` with your GitHub Pages URL:
   ```js
   const allowedOrigins = [
     'http://localhost:5173',
     'https://your-github-username.github.io'
   ];
   ```

### Testing Your Deployment

1. After deployment, your application will be available at:
   - Frontend: `https://your-github-username.github.io/KnowledgeConnect/`
   - Backend: Your deployment platform URL

2. Make sure to test user registration, login, and other features

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd backend && npm install
   ```

3. Create `.env` files:
   - Root folder: Create `.env.local` with `VITE_API_URL=http://localhost:5001/api`
   - Backend folder: Create `.env` with MongoDB URI and JWT secret

4. Run the development servers:
   ```
   # Backend
   cd backend && npm run dev

   # Frontend
   npm run dev
   ```