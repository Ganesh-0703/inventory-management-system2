"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryRouter = void 0;
const express_1 = require("express");
const db_js_1 = require("../db.js");
const auth_js_1 = require("../middleware/auth.js");
exports.inventoryRouter = (0, express_1.Router)();
// Get products with query filters
exports.inventoryRouter.get('/', auth_js_1.authenticateToken, (req, res) => {
    try {
        let products = db_js_1.db.products.getAll();
        const { search, category, zone, status, lowStock, expiringSoon, sort } = req.query;
        if (search && typeof search === 'string') {
            const q = search.toLowerCase();
            products = products.filter(p => p.name.toLowerCase().includes(q) ||
                p.sku.toLowerCase().includes(q) ||
                p.barcode.includes(q) ||
                p.brand.toLowerCase().includes(q) ||
                p.binLocation.toLowerCase().includes(q));
        }
        if (category && typeof category === 'string' && category !== 'ALL') {
            products = products.filter(p => p.category === category);
        }
        if (zone && typeof zone === 'string' && zone !== 'ALL') {
            products = products.filter(p => p.temperatureZone === zone);
        }
        if (status && typeof status === 'string' && status !== 'ALL') {
            products = products.filter(p => p.status === status);
        }
        if (lowStock === 'true') {
            products = products.filter(p => p.stockOnHand <= p.reorderPoint);
        }
        if (expiringSoon === 'true') {
            const now = new Date();
            const inSevenDays = new Date();
            inSevenDays.setDate(inSevenDays.getDate() + 7);
            products = products.filter(p => {
                const exp = new Date(p.expiryDate);
                return exp >= now && exp <= inSevenDays;
            });
        }
        // Sorting
        if (sort === 'stock-asc') {
            products.sort((a, b) => a.stockOnHand - b.stockOnHand);
        }
        else if (sort === 'stock-desc') {
            products.sort((a, b) => b.stockOnHand - a.stockOnHand);
        }
        else if (sort === 'expiry-soon') {
            products.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
        }
        else if (sort === 'name-asc') {
            products.sort((a, b) => a.name.localeCompare(b.name));
        }
        else {
            // Default: low stock first, then alphabetically
            products.sort((a, b) => (a.stockOnHand - a.reorderPoint) - (b.stockOnHand - b.reorderPoint));
        }
        res.json(products);
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Failed to fetch inventory' });
    }
});
// Scan barcode / SKU lookup
exports.inventoryRouter.get('/scan/:code', auth_js_1.authenticateToken, (req, res) => {
    try {
        const { code } = req.params;
        const product = db_js_1.db.products.getAll().find(p => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase());
        if (!product) {
            res.status(404).json({ error: `No SKU found matching barcode/SKU: ${code}` });
            return;
        }
        res.json(product);
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Scan lookup failed' });
    }
});
// Get single product
exports.inventoryRouter.get('/:id', auth_js_1.authenticateToken, (req, res) => {
    try {
        const product = db_js_1.db.products.getById(req.params.id);
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(product);
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Failed to fetch product' });
    }
});
// Create product
exports.inventoryRouter.post('/', auth_js_1.authenticateToken, (req, res) => {
    try {
        const { name, category, subCategory, brand, barcode, mrp, sellingPrice, costPrice, unit, stockOnHand, reorderPoint, safetyStock, maxCapacity, binLocation, temperatureZone, expiryDate, batchNumber, imageUrl, isFastMoving, isFragile } = req.body;
        if (!name || !category || !sellingPrice || !binLocation) {
            res.status(400).json({ error: 'Missing required product fields' });
            return;
        }
        const skuPrefix = category.slice(0, 3).toUpperCase();
        const sku = `${skuPrefix}-${Date.now().toString(36).toUpperCase()}`;
        const stock = Number(stockOnHand) || 0;
        const reorder = Number(reorderPoint) || 20;
        let status = 'ACTIVE';
        if (stock <= 0)
            status = 'OUT_OF_STOCK';
        else if (stock <= reorder)
            status = 'LOW_STOCK';
        const newProduct = {
            id: 'prod_' + Date.now().toString(36),
            sku,
            name,
            category,
            subCategory: subCategory || 'General',
            brand: brand || 'Store Brand',
            barcode: barcode || ('890' + Math.floor(1000000000 + Math.random() * 9000000000)),
            imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300',
            mrp: Number(mrp) || Number(sellingPrice),
            sellingPrice: Number(sellingPrice),
            costPrice: Number(costPrice) || Math.round(Number(sellingPrice) * 0.8),
            unit: unit || '1 pc',
            stockOnHand: stock,
            reservedStock: 0,
            reorderPoint: reorder,
            safetyStock: Number(safetyStock) || 10,
            maxCapacity: Number(maxCapacity) || 100,
            binLocation: binLocation.toUpperCase(),
            temperatureZone: temperatureZone || 'Ambient',
            expiryDate: expiryDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
            batchNumber: batchNumber || 'BAT-' + Date.now().toString().slice(-4),
            isFastMoving: !!isFastMoving,
            isFragile: !!isFragile,
            status,
            updatedAt: new Date().toISOString()
        };
        db_js_1.db.products.create(newProduct);
        db_js_1.db.activityLogs.create({
            userId: req.user?.id || 'sys',
            userName: req.user?.name || 'Staff',
            action: 'PRODUCT_CREATED',
            details: `Created SKU ${newProduct.sku} (${newProduct.name}) at Bin ${newProduct.binLocation}`,
            category: 'INVENTORY'
        });
        res.status(201).json(newProduct);
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Failed to create product' });
    }
});
// Update product
exports.inventoryRouter.put('/:id', auth_js_1.authenticateToken, (req, res) => {
    try {
        const existing = db_js_1.db.products.getById(req.params.id);
        if (!existing) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        const updated = db_js_1.db.products.update(req.params.id, req.body);
        db_js_1.db.activityLogs.create({
            userId: req.user?.id || 'sys',
            userName: req.user?.name || 'Staff',
            action: 'PRODUCT_UPDATED',
            details: `Updated SKU ${existing.sku} (${existing.name}). Stock: ${updated?.stockOnHand}`,
            category: 'INVENTORY'
        });
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Failed to update product' });
    }
});
// Stock Adjustment (Damage, Expiry, Cycle count mismatch)
exports.inventoryRouter.post('/:id/adjust', auth_js_1.authenticateToken, (req, res) => {
    try {
        const product = db_js_1.db.products.getById(req.params.id);
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        const { adjustedStock, reason, notes } = req.body;
        if (adjustedStock === undefined || adjustedStock === null) {
            res.status(400).json({ error: 'Adjusted stock quantity is required' });
            return;
        }
        const targetStock = Math.max(0, Number(adjustedStock));
        const difference = targetStock - product.stockOnHand;
        const adjustment = {
            id: 'adj_' + Date.now().toString(36),
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            previousStock: product.stockOnHand,
            adjustedStock: targetStock,
            difference,
            reason: reason || 'CYCLE_COUNT_MISMATCH',
            performedBy: req.user?.id || 'usr',
            performedByName: req.user?.name || 'Staff',
            binLocation: product.binLocation,
            notes: notes || '',
            createdAt: new Date().toISOString()
        };
        db_js_1.db.adjustments.create(adjustment);
        const updatedProduct = db_js_1.db.products.update(product.id, { stockOnHand: targetStock });
        db_js_1.db.activityLogs.create({
            userId: req.user?.id || 'sys',
            userName: req.user?.name || 'Staff',
            action: 'STOCK_ADJUSTMENT',
            details: `Adjusted ${product.name} from ${product.stockOnHand} to ${targetStock} (${difference > 0 ? '+' : ''}${difference}) [${reason}]`,
            category: 'AUDIT'
        });
        res.json({ product: updatedProduct, adjustment });
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Failed to record stock adjustment' });
    }
});
// Delete product
exports.inventoryRouter.delete('/:id', auth_js_1.authenticateToken, (req, res) => {
    try {
        const product = db_js_1.db.products.getById(req.params.id);
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        db_js_1.db.products.delete(req.params.id);
        db_js_1.db.activityLogs.create({
            userId: req.user?.id || 'sys',
            userName: req.user?.name || 'Staff',
            action: 'PRODUCT_DELETED',
            details: `Deleted SKU ${product.sku} (${product.name})`,
            category: 'INVENTORY'
        });
        res.json({ message: 'Product deleted successfully', id: req.params.id });
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Failed to delete product' });
    }
});
