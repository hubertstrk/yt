import express from 'express';
import { youtrackRouter } from './routes/youtrack';
import { errorHandler } from './middleware/errorHandler';

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
    console.log(`Server running on port ${port}`);
  });
};

// Export the app for testing purposes
export default app;
