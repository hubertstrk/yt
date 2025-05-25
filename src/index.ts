import dotenv from 'dotenv';
import path from 'path';
import { startServer } from './server';

// Load environment variables first
const projectRoot = path.dirname(__dirname);
const envPath = path.resolve(projectRoot, '.env');
dotenv.config({ path: envPath });

const requiredEnvVars = ['PORT', 'NODE_ENV', 'YOUTRACK_BASE_URL', 'YOUTRACK_API_TOKEN'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please check your .env file');
  process.exit(1);
}

// Start the server after environment variables are loaded
const port = process.env.PORT || 3000;
const server = startServer(port);

export default server;
