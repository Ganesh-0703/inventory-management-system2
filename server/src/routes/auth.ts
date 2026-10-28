import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, User } from '../db.js';
import { JWT_SECRET, authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

function generateToken(user: User) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Login
authRouter.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = db.users.getByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user);
    const { passwordHash, ...userSafe } = user;

    db.activityLogs.create({
      userId: user.id,
      userName: user.name,
      action: 'USER_LOGIN',
      details: `${user.name} logged into ${user.role} terminal`,
      category: 'AUTH'
    });

    res.json({ token, user: userSafe });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Register
authRouter.post('/register', (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email and password are required' });
      return;
    }

    const existing = db.users.getByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'A staff user with this email already exists' });
      return;
    }

    const validRoles: Array<User['role']> = [
      'STORE_MANAGER',
      'INVENTORY_SUPERVISOR',
      'PICKER_PACKER',
      'OPERATIONS_LEAD'
    ];
    const userRole = validRoles.includes(role) ? role : 'PICKER_PACKER';

    const newUser: User = {
      id: 'usr_' + Date.now().toString(36),
      name,
      email: email.toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 10),
      role: userRole,
      storeId: 'DS-BLR-04',
      phone: phone || '',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    db.users.create(newUser);
    const token = generateToken(newUser);
    const { passwordHash, ...userSafe } = newUser;

    db.activityLogs.create({
      userId: newUser.id,
      userName: newUser.name,
      action: 'USER_REGISTERED',
      details: `New staff ${newUser.name} created with role ${newUser.role}`,
      category: 'AUTH'
    });

    res.status(201).json({ token, user: userSafe });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// Quick Demo Login (Allows 1-click login for Store Manager, Picker, Supervisor, Lead)
authRouter.post('/demo-login', (req, res) => {
  try {
    const { role } = req.body;
    const users = db.users.getAll();
    let user = users.find(u => u.role === role);

    if (!user) {
      user = users[0];
    }

    if (!user) {
      res.status(404).json({ error: 'No demo users found' });
      return;
    }

    const token = generateToken(user);
    const { passwordHash, ...userSafe } = user;

    db.activityLogs.create({
      userId: user.id,
      userName: user.name,
      action: 'DEMO_LOGIN',
      details: `Switched into demo mode as ${user.name} (${user.role})`,
      category: 'AUTH'
    });

    res.json({ token, user: userSafe });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Demo login failed' });
  }
});

// Current User Profile
authRouter.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const { passwordHash, ...userSafe } = req.user;
  res.json({ user: userSafe });
});

// Update Profile
authRouter.patch('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const { name, phone, status } = req.body;
  const updated = db.users.update(req.user.id, {
    ...(name && { name }),
    ...(phone && { phone }),
    ...(status && { status })
  });

  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { passwordHash, ...userSafe } = updated;
  res.json({ user: userSafe });
});
