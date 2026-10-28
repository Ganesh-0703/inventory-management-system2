"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffRouter = void 0;
const express_1 = require("express");
const db_js_1 = require("../db.js");
const auth_js_1 = require("../middleware/auth.js");
exports.staffRouter = (0, express_1.Router)();
exports.staffRouter.get('/', auth_js_1.authenticateToken, (req, res) => {
    try {
        const users = db_js_1.db.users.getAll().map(u => {
            const { passwordHash, ...safe } = u;
            return safe;
        });
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Failed to fetch staff' });
    }
});
exports.staffRouter.patch('/:id/status', auth_js_1.authenticateToken, (0, auth_js_1.requireRole)(['STORE_MANAGER', 'OPERATIONS_LEAD']), (req, res) => {
    try {
        const { status, role } = req.body;
        const updated = db_js_1.db.users.update(req.params.id, {
            ...(status && { status }),
            ...(role && { role })
        });
        if (!updated) {
            res.status(404).json({ error: 'Staff member not found' });
            return;
        }
        const { passwordHash, ...safe } = updated;
        res.json(safe);
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Failed to update staff' });
    }
});
