import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth.js';

export const staffRouter = Router();

staffRouter.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = db.users.getAll().map(u => {
      const { passwordHash, ...safe } = u;
      return safe;
    });
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch staff' });
  }
});

staffRouter.patch('/:id/status', authenticateToken, requireRole(['STORE_MANAGER', 'OPERATIONS_LEAD']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, role } = req.body;
    const updated = db.users.update(req.params.id, {
      ...(status && { status }),
      ...(role && { role })
    });

    if (!updated) {
      res.status(404).json({ error: 'Staff member not found' });
      return;
    }

    const { passwordHash, ...safe } = updated;
    res.json(safe);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update staff' });
  }
});

