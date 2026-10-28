"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRouter = void 0;
const express_1 = require("express");
const db_js_1 = require("../db.js");
const auth_js_1 = require("../middleware/auth.js");
exports.auditRouter = (0, express_1.Router)();
exports.auditRouter.get('/adjustments', auth_js_1.authenticateToken, (req, res) => {
    try {
        const adjustments = db_js_1.db.adjustments.getAll();
        res.json(adjustments);
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Failed to fetch adjustments' });
    }
});
exports.auditRouter.get('/logs', auth_js_1.authenticateToken, (req, res) => {
    try {
        const limit = Number(req.query.limit) || 100;
        const logs = db_js_1.db.activityLogs.getAll(limit);
        res.json(logs);
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Failed to fetch activity logs' });
    }
});
