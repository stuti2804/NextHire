import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import userRoutes from './routes/userRoutes';
import resumeRoutes from './routes/resume';
import jobRoutes from './routes/jobRoutes';
import authRoutes from './routes/authRoutes';
import { logger } from './utils/logger';
import { debugAuth } from './middleware/debugAuth';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(debugAuth); // Add debug middleware

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling
app.use(errorHandler);

// Server and Database Connection Setup
const port = process.env.PORT || 8000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume_ai';

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');
    
    app.listen(port, () => {
      logger.info(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled rejection:', err);
  process.exit(1);
});

// Start the server
startServer();

export default app;