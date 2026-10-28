"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_js_1 = require("./routes/auth.js");
const inventory_js_1 = require("./routes/inventory.js");
const orders_js_1 = require("./routes/orders.js");
const inwarding_js_1 = require("./routes/inwarding.js");
const analytics_js_1 = require("./routes/analytics.js");
const staff_js_1 = require("./routes/staff.js");
const audit_js_1 = require("./routes/audit.js");
const seed_js_1 = require("./seed.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// CORS configuration - supports both development and deployed Render domains
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Initialize database seed if first run
(0, seed_js_1.runSeed)(false);
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
app.use('/api/auth', auth_js_1.authRouter);
app.use('/api/inventory', inventory_js_1.inventoryRouter);
app.use('/api/orders', orders_js_1.ordersRouter);
app.use('/api/inwarding', inwarding_js_1.inwardingRouter);
app.use('/api/analytics', analytics_js_1.analyticsRouter);
app.use('/api/staff', staff_js_1.staffRouter);
app.use('/api/audit', audit_js_1.auditRouter);
// Serve static frontend in production
const clientDistPath = path_1.default.resolve(process.cwd(), 'client', 'dist');
if (fs_1.default.existsSync(clientDistPath)) {
    console.log(`Serving static client files from: ${clientDistPath}`);
    app.use(express_1.default.static(clientDistPath));
    // Catch-all route to support client-side SPA routing (React Router)
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path_1.default.join(clientDistPath, 'index.html'));
    });
}
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`⚡ FlashStore Dark Store OS API running on port ${PORT}`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚡ Health check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
});
