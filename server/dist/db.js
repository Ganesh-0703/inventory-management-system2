"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.Database = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_FILE = process.cwd().endsWith('server')
    ? path_1.default.join(process.cwd(), 'data', 'store.json')
    : path_1.default.join(process.cwd(), 'server', 'data', 'store.json');
class Database {
    data = {
        users: [],
        products: [],
        orders: [],
        inwardBatches: [],
        adjustments: [],
        activityLogs: [],
        config: {
            storeId: 'DS-BLR-04',
            storeName: 'Zepto/Blinkit Dark Store #04 (Indiranagar MFC)',
            location: '100ft Road, Indiranagar, Bengaluru, Karnataka',
            pincode: '560038',
            totalAisles: 6,
            totalBins: 180,
            activePickersCount: 8,
            targetPickTimeSec: 150, // 2.5 minutes
            coldRoomTemp: 3.8,
            ambientTemp: 22.4,
        },
    };
    constructor() {
        this.init();
    }
    init() {
        try {
            const dir = path_1.default.dirname(DB_FILE);
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
            }
            if (fs_1.default.existsSync(DB_FILE)) {
                const raw = fs_1.default.readFileSync(DB_FILE, 'utf-8');
                this.data = JSON.parse(raw);
            }
            else {
                this.save();
            }
        }
        catch (err) {
            console.error('Error initializing database, using defaults:', err);
        }
    }
    save() {
        try {
            const dir = path_1.default.dirname(DB_FILE);
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
            }
            const tmpFile = `${DB_FILE}.tmp`;
            fs_1.default.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
            fs_1.default.renameSync(tmpFile, DB_FILE);
        }
        catch (err) {
            console.error('Failed to write database file:', err);
        }
    }
    // Users
    get users() {
        return {
            getAll: () => this.data.users,
            getById: (id) => this.data.users.find(u => u.id === id),
            getByEmail: (email) => this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()),
            create: (user) => {
                this.data.users.push(user);
                this.save();
                return user;
            },
            update: (id, updates) => {
                const index = this.data.users.findIndex(u => u.id === id);
                if (index !== -1) {
                    this.data.users[index] = { ...this.data.users[index], ...updates };
                    this.save();
                    return this.data.users[index];
                }
                return null;
            },
            delete: (id) => {
                this.data.users = this.data.users.filter(u => u.id !== id);
                this.save();
                return true;
            }
        };
    }
    // Products
    get products() {
        return {
            getAll: () => this.data.products,
            getById: (id) => this.data.products.find(p => p.id === id),
            getBySku: (sku) => this.data.products.find(p => p.sku === sku),
            getByBarcode: (barcode) => this.data.products.find(p => p.barcode === barcode),
            create: (prod) => {
                this.data.products.push(prod);
                this.save();
                return prod;
            },
            update: (id, updates) => {
                const index = this.data.products.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.data.products[index] = {
                        ...this.data.products[index],
                        ...updates,
                        updatedAt: new Date().toISOString()
                    };
                    // Recalculate status
                    const p = this.data.products[index];
                    if (p.stockOnHand <= 0) {
                        p.status = 'OUT_OF_STOCK';
                    }
                    else if (p.stockOnHand <= p.reorderPoint) {
                        p.status = 'LOW_STOCK';
                    }
                    else {
                        p.status = 'ACTIVE';
                    }
                    this.save();
                    return this.data.products[index];
                }
                return null;
            },
            delete: (id) => {
                this.data.products = this.data.products.filter(p => p.id !== id);
                this.save();
                return true;
            }
        };
    }
    // Orders
    get orders() {
        return {
            getAll: () => this.data.orders,
            getById: (id) => this.data.orders.find(o => o.id === id),
            create: (order) => {
                this.data.orders.unshift(order);
                this.save();
                return order;
            },
            update: (id, updates) => {
                const index = this.data.orders.findIndex(o => o.id === id);
                if (index !== -1) {
                    this.data.orders[index] = {
                        ...this.data.orders[index],
                        ...updates,
                        updatedAt: new Date().toISOString()
                    };
                    this.save();
                    return this.data.orders[index];
                }
                return null;
            }
        };
    }
    // Inward Batches
    get inwardBatches() {
        return {
            getAll: () => this.data.inwardBatches,
            create: (batch) => {
                this.data.inwardBatches.unshift(batch);
                this.save();
                return batch;
            }
        };
    }
    // Adjustments
    get adjustments() {
        return {
            getAll: () => this.data.adjustments,
            create: (adj) => {
                this.data.adjustments.unshift(adj);
                this.save();
                return adj;
            }
        };
    }
    // Activity Logs
    get activityLogs() {
        return {
            getAll: (limit = 100) => this.data.activityLogs.slice(0, limit),
            create: (log) => {
                const newLog = {
                    ...log,
                    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                    timestamp: new Date().toISOString()
                };
                this.data.activityLogs.unshift(newLog);
                if (this.data.activityLogs.length > 500) {
                    this.data.activityLogs = this.data.activityLogs.slice(0, 500);
                }
                this.save();
                return newLog;
            }
        };
    }
    // Config
    get config() {
        return {
            get: () => this.data.config,
            update: (updates) => {
                this.data.config = { ...this.data.config, ...updates };
                this.save();
                return this.data.config;
            }
        };
    }
    // Seed Helper
    seedDatabase(schema) {
        if (schema.users)
            this.data.users = schema.users;
        if (schema.products)
            this.data.products = schema.products;
        if (schema.orders)
            this.data.orders = schema.orders;
        if (schema.inwardBatches)
            this.data.inwardBatches = schema.inwardBatches;
        if (schema.adjustments)
            this.data.adjustments = schema.adjustments;
        if (schema.activityLogs)
            this.data.activityLogs = schema.activityLogs;
        if (schema.config)
            this.data.config = schema.config;
        this.save();
    }
}
exports.Database = Database;
exports.db = new Database();
