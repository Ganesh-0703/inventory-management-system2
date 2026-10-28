import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { authRouter } from './routes/auth.js';
import { inventoryRouter } from './routes/inventory.js';
import { ordersRouter } from './routes/orders.js';
import { inwardingRouter } from './routes/inwarding.js';
import { analyticsRouter } from './routes/analytics.js';
import { staffRouter } from './routes/staff.js';
import { auditRouter } from './routes/audit.js';
import { runSeed } from './seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration - supports both development and deployed Render domains
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Initialize database seed if first run
runSeed(false);

// Health check endpoint for Render monitoring
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'FlashStore Dark Store OS',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/inwarding', inwardingRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/audit', auditRouter);

// Serve static frontend in production
const clientDistPath = path.resolve(process.cwd(), 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`Serving static client files from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // Catch-all route to support client-side SPA routing (React Router)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`⚡ FlashStore Dark Store OS API running on port ${PORT}`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Health check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
