import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import storiesRouter from './routes/stories.js';
import uploadRouter from './routes/upload.js';
import { analyzeStories } from './jobs/storyAnalyzer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/stories', storiesRouter);
app.use('/api/upload', uploadRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Schedule daily analysis job (runs at 6 AM every day)
cron.schedule('0 6 * * *', async () => {
  console.log('Running scheduled story analysis...');
  try {
    await analyzeStories();
    console.log('Story analysis completed successfully');
  } catch (error) {
    console.error('Error during scheduled analysis:', error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

export default app;
