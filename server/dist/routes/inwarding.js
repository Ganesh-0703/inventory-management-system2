"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inwardingRouter = void 0;
const express_1 = require("express");
const db_js_1 = require("../db.js");
const auth_js_1 = require("../middleware/auth.js");
exports.inwardingRouter = (0, express_1.Router)();
// Get all inwarding GRNs
exports.inwardingRouter.get('/', auth_js_1.authenticateToken, (req, res) => {
    try {
        const batches = db_js_1.db.inwardBatches.getAll();
        res.json(batches);
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Failed to fetch inwarding batches' });
    }
});
// Process new GRN (Inward shipment into Dark Store)
exports.inwardingRouter.post('/', auth_js_1.authenticateToken, (req, res) => {
    try {
        const { supplierName, purchaseOrderNumber, items, notes } = req.body;
        if (!supplierName || !items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ error: 'Supplier name and at least one inward item are required' });
            return;
        }
        const grnNumber = `GRN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
        let totalCost = 0;
        const processedItems = items.map((item) => {
            const prod = db_js_1.db.products.getById(item.productId);
            const receivedQty = Number(item.receivedQty) || 0;
            const rejectedQty = Number(item.rejectedQty) || 0;
            if (prod) {
                // Increment stock
                const newStock = prod.stockOnHand + receivedQty;
                db_js_1.db.products.update(prod.id, {
                    stockOnHand: newStock,
                    batchNumber: item.batchNumber || prod.batchNumber,
                    expiryDate: item.expiryDate || prod.expiryDate,
                    binLocation: item.assignedBin || prod.binLocation
                });
                totalCost += (prod.costPrice || prod.sellingPrice * 0.8) * receivedQty;
            }
            return {
                productId: item.productId,
                productName: item.productName || prod?.name || 'Item',
                sku: item.sku || prod?.sku || 'SKU',
                orderedQty: Number(item.orderedQty) || receivedQty,
                receivedQty,
                rejectedQty,
                batchNumber: item.batchNumber || 'BAT-' + Date.now().toString().slice(-4),
                mfgDate: item.mfgDate || new Date().toISOString().split('T')[0],
                expiryDate: item.expiryDate || prod?.expiryDate || '',
                assignedBin: item.assignedBin || prod?.binLocation || 'A-01-A1',
                temperatureStatus: item.temperatureStatus || 'COMPLIANT'
            };
        });
        const newBatch = {
            id: 'grn_' + Date.now().toString(36),
            grnNumber,
            supplierName,
            purchaseOrderNumber: purchaseOrderNumber || `PO-${Math.floor(1000 + Math.random() * 9000)}`,
            receivedBy: req.user?.name || 'Staff',
            receivedDate: new Date().toISOString(),
            items: processedItems,
            notes: notes || '',
            totalCost
        };
        db_js_1.db.inwardBatches.create(newBatch);
        db_js_1.db.activityLogs.create({
            userId: req.user?.id || 'sys',
            userName: req.user?.name || 'Staff',
            action: 'INWARDING_COMPLETED',
            details: `${grnNumber} from ${supplierName} processed (${processedItems.length} items, total ₹${totalCost})`,
            category: 'INWARDING'
        });
        res.status(201).json(newBatch);
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Failed to process inwarding GRN' });
    }
});
