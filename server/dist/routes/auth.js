"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_js_1 = require("../db.js");
const auth_js_1 = require("../middleware/auth.js");
exports.authRouter = (0, express_1.Router)();
function generateToken(user) {
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, auth_js_1.JWT_SECRET, { expiresIn: '7d' });
}
// Login
exports.authRouter.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const user = db_js_1.db.users.getByEmail(email);
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const isValid = bcryptjs_1.default.compareSync(password, user.passwordHash);
        if (!isValid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const token = generateToken(user);
        const { passwordHash, ...userSafe } = user;
        db_js_1.db.activityLogs.create({
            userId: user.id,
            userName: user.name,
            action: 'USER_LOGIN',
            details: `${user.name} logged into ${user.role} terminal`,
            category: 'AUTH'
        });
        res.json({ token, user: userSafe });
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Login failed' });
    }
});
// Register
exports.authRouter.post('/register', (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ error: 'Name, email and password are required' });
            return;
        }
        const existing = db_js_1.db.users.getByEmail(email);
        if (existing) {
            res.status(409).json({ error: 'A staff user with this email already exists' });
            return;
        }
        const validRoles = [
            'STORE_MANAGER',
            'INVENTORY_SUPERVISOR',
            'PICKER_PACKER',
            'OPERATIONS_LEAD'
        ];
        const userRole = validRoles.includes(role) ? role : 'PICKER_PACKER';
        const newUser = {
            id: 'usr_' + Date.now().toString(36),
            name,
            email: email.toLowerCase(),
            passwordHash: bcryptjs_1.default.hashSync(password, 10),
            role: userRole,
            storeId: 'DS-BLR-04',
            phone: phone || '',
            status: 'ACTIVE',
            createdAt: new Date().toISOString()
        };
        db_js_1.db.users.create(newUser);
        const token = generateToken(newUser);
        const { passwordHash, ...userSafe } = newUser;
        db_js_1.db.activityLogs.create({
            userId: newUser.id,
            userName: newUser.name,
            action: 'USER_REGISTERED',
            details: `New staff ${newUser.name} created with role ${newUser.role}`,
            category: 'AUTH'
        });
        res.status(201).json({ token, user: userSafe });
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Registration failed' });
    }
});
// Quick Demo Login (Allows 1-click login for Store Manager, Picker, Supervisor, Lead)
exports.authRouter.post('/demo-login', (req, res) => {
    try {
        const { role } = req.body;
        const users = db_js_1.db.users.getAll();
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
        db_js_1.db.activityLogs.create({
            userId: user.id,
            userName: user.name,
            action: 'DEMO_LOGIN',
            details: `Switched into demo mode as ${user.name} (${user.role})`,
            category: 'AUTH'
        });
        res.json({ token, user: userSafe });
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Demo login failed' });
    }
});
// Current User Profile
exports.authRouter.get('/me', auth_js_1.authenticateToken, (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    const { passwordHash, ...userSafe } = req.user;
    res.json({ user: userSafe });
});
// Update Profile
exports.authRouter.patch('/me', auth_js_1.authenticateToken, (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    const { name, phone, status } = req.body;
    const updated = db_js_1.db.users.update(req.user.id, {
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
