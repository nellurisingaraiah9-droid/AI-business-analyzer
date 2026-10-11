import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import { authRoutes } from './routes/auth.js';
import { analysisRoutes } from './routes/analyses.js';
import { equipmentRoutes } from './routes/equipment.js';
import { licenseRoutes } from './routes/licenses.js';
import { roadmapRoutes } from './routes/roadmap.js';
import { adminRoutes } from './routes/admin.js';
import { profileRoutes } from './routes/profile.js';
import { errorHandler } from './middleware/errorHandler.js';
import { validateEnv } from './utils/validateEnv.js';

const env = validateEnv();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/', authLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/analyses', analysisRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api', roadmapRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

// Error handler
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  let mongoUri = env.MONGODB_URI;

  // Use in-memory MongoDB if configured or if local connection fails
  if (mongoUri === 'memory' || mongoUri === 'mongodb://localhost:27017/bizpilot') {
    try {
      if (mongoUri !== 'memory') {
        // Try connecting to local MongoDB first
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
        console.log('✅ Connected to local MongoDB');
      } else {
        throw new Error('Memory mode requested');
      }
    } catch {
      // Fall back to in-memory MongoDB
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = new MongoMemoryServer();
        await mongod.start();
        mongoUri = mongod.getUri();
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect();
        }
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to in-memory MongoDB (data will not persist across restarts)');
        console.log('   💡 Install MongoDB locally or use MongoDB Atlas for persistent data');
        
        // Auto-seed in-memory database
        console.log('📦 Auto-seeding demo data...');
        const { autoSeed } = await import('./seed-fn.js');
        await autoSeed();
      } catch (memErr) {
        console.error('❌ Failed to start in-memory MongoDB:', memErr);
        process.exit(1);
      }
    }
  } else {
    try {
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      process.exit(1);
    }
  }

  const port = env.PORT;
  app.listen(port, () => {
    console.log(`🚀 BizPilot API server running on port ${port}`);
  });
};

startServer();

export default app;
