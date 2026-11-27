import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import publicRoutes from './routes/public.routes.js';
import studentRoutes from './routes/student.routes.js';
import staffRoutes from './routes/staff.routes.js';
import adminRoutes from './routes/admin.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { apiLimiter } from './middleware/rateLimiter.middleware.js';
import prisma from './prisma/prismaClient.js';
import { ensurePostgresRunning } from './scripts/pg-start.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for development preview
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
const uploadDir = path.resolve('uploads');
app.use('/uploads', express.static(uploadDir));

// Apply API rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Serve frontend static build in production
const clientDist = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDist));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(clientDist, 'index.html'));
});

// Centralized error handler
app.use(errorHandler);

// Graceful server startup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      await ensurePostgresRunning();
    } catch (err) {
      console.warn(
        '[PostgreSQL] Could not start embedded instance:',
        err.message
      );
    }
  } else {
    console.log('[PostgreSQL] Connecting to external database...');
    try {
      await prisma.$connect();
      console.log('✅ Connected to external PostgreSQL successfully.');
    } catch (err) {
      console.warn('⚠️ Database connection check:', err.message);
    }
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 Centralized Student Portfolio API running on port ${PORT}`);
    console.log(`🌐 Bound to: 0.0.0.0:${PORT}`);
    console.log(`📁 Uploads available at: /uploads`);
    console.log(`=======================================================`);
  });

  const shutdown = async () => {
    console.log('\nGracefully shutting down...');
    server.close(async () => {
      await prisma.$disconnect();
      console.log('Database disconnected. Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();

export default app;
