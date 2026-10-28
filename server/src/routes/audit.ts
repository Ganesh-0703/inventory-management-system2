import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

export const auditRouter = Router();

auditRouter.get('/adjustments', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const adjustments = db.adjustments.getAll();
    res.json(adjustments);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch adjustments' });
  }
});

auditRouter.get('/logs', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const logs = db.activityLogs.getAll(limit);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch activity logs' });
  }
});

