"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = void 0;
exports.authenticateToken = authenticateToken;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_js_1 = require("../db.js");
exports.JWT_SECRET = process.env.JWT_SECRET || 'flashstore-quickcommerce-secret-key-2026';
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Access token required. Please log in.' });
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, exports.JWT_SECRET);
        const user = db_js_1.db.users.getById(payload.id);
        if (!user) {
            res.status(401).json({ error: 'User no longer exists.' });
            return;
        }
        req.user = user;
        next();
    }
    catch (err) {
        res.status(403).json({ error: 'Invalid or expired token.' });
        return;
    }
}
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                error: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`
            });
            return;
        }
        next();
    };
}
