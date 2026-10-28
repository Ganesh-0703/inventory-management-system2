import { Router, Response } from 'express';
import { db, InwardBatch } from '../db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

export const inwardingRouter = Router();

// Get all inwarding GRNs
inwardingRouter.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const batches = db.inwardBatches.getAll();
    res.json(batches);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch inwarding batches' });
  }
});

// Process new GRN (Inward shipment into Dark Store)
inwardingRouter.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { supplierName, purchaseOrderNumber, items, notes } = req.body;

    if (!supplierName || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Supplier name and at least one inward item are required' });
      return;
    }

    const grnNumber = `GRN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    let totalCost = 0;

    const processedItems = items.map((item: any) => {
      const prod = db.products.getById(item.productId);
      const receivedQty = Number(item.receivedQty) || 0;
      const rejectedQty = Number(item.rejectedQty) || 0;

      if (prod) {
        // Increment stock
        const newStock = prod.stockOnHand + receivedQty;
        db.products.update(prod.id, {
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

    const newBatch: InwardBatch = {
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

    db.inwardBatches.create(newBatch);

    db.activityLogs.create({
      userId: req.user?.id || 'sys',
      userName: req.user?.name || 'Staff',
      action: 'INWARDING_COMPLETED',
      details: `${grnNumber} from ${supplierName} processed (${processedItems.length} items, total ₹${totalCost})`,
      category: 'INWARDING'
    });

    res.status(201).json(newBatch);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to process inwarding GRN' });
  }
});

