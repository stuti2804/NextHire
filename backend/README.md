# Backend for Resume Management Application

This is the backend service for the Resume Management Application. It is built using TypeScript and Express.js, providing a RESTful API for managing user authentication, resumes, and user profiles.

## Project Structure

```
backend
├── src
│   ├── controllers        # Contains the logic for handling requests
│   ├── middleware         # Contains middleware functions for authentication and error handling
│   ├── models             # Defines the data models for User, Resume, and Analysis
│   ├── routes             # Defines the API routes
│   ├── services           # Contains business logic for authentication and resumes
│   ├── index.ts           # Entry point of the application with DB connection
├── package.json           # NPM dependencies and scripts
├── .env                   # Environment variables
└── tsconfig.json          # TypeScript configuration
```

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the application:**
   ```bash
   npm start
   ```

## API Endpoints

- **Authentication**
  - `POST /api/auth/login` - Login a user
  - `POST /api/auth/register` - Register a new user

- **Resumes**
  - `GET /api/resumes` - Retrieve all resumes for a user
  - `GET /api/resumes/:id` - Get a specific resume with analysis if available
  - `GET /api/resumes/:id/file` - Download the resume file
  - `POST /api/resumes/parse` - Upload and parse a resume file
  - `PATCH /api/resumes/:id` - Update resume title
  - `DELETE /api/resumes/:id` - Delete a resume and its analysis

- **Analysis**
  - `GET /api/analysis/resume/:id` - Get resume analysis
  - `POST /api/analysis/job-match` - Match resume against job description
  - `GET /api/analysis/user-stats/:userId` - Get user statistics

- **Users**
  - `GET /api/users/:id` - Retrieve user profile
  - `PUT /api/users/:id` - Update user information

- **Files**
  - `GET /api/resumes/:id/export` - Export resume as PDF

- **Jobs**
  - `GET /api/jobs/search` - Search for jobs
  - `GET /api/jobs/recommended/:resumeId` - Get job recommendations based on resume

## License

This project is licensed under the MIT License. See the LICENSE file for details.