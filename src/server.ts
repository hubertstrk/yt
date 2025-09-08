import express from 'express';
import { youtrackRouter } from './routes/youtrack';
import { errorHandler } from './middleware/errorHandler';
import pico from 'picocolors'

// Create Express app
const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', youtrackRouter);

// Error handling middleware
app.use(errorHandler);

// Function to start the server
export const startServer = (port: number | string) => {
  return app.listen(port, () => {
    console.log(`YouTrack Api running on port ${port}`);
    console.log();
    console.log('Examples:');
    console.log(`  - curl http://localhost:${port}/api/health`);
    console.log(`  - curl http://localhost:${port}/api/ticket/PROJECT-123`);
    console.log(`  - curl http://localhost:${port}/api/tickets/changes/2025-09-08/2025-09-08`);
  });
};

// Export the app for testing purposes
export default app;
