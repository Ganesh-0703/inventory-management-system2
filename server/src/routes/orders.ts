import { Router, Response } from 'express';
import { db, Order, OrderItem } from '../db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

export const ordersRouter = Router();

// Get orders with optional status filter
ordersRouter.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.query;
    let orders = db.orders.getAll();

    if (status && typeof status === 'string' && status !== 'ALL') {
      orders = orders.filter(o => o.status === status);
    }

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch orders' });
  }
});

// Get single order
ordersRouter.get('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const order = db.orders.getById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch order' });
  }
});

// Start picking order (Claim order by picker)
ordersRouter.post('/:id/claim', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const order = db.orders.getById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.status !== 'RECEIVED') {
      res.status(400).json({ error: `Cannot claim order with status ${order.status}` });
      return;
    }

    const updated = db.orders.update(order.id, {
      status: 'PICKING',
      assignedPickerId: req.user?.id || 'usr_pck',
      assignedPickerName: req.user?.name || 'Picker Staff',
      pickerStartTime: new Date().toISOString()
    });

    // Mark product stocks as reserved
    for (const item of order.items) {
      const prod = db.products.getById(item.productId);
      if (prod) {
        db.products.update(prod.id, {
          reservedStock: Math.max(0, (prod.reservedStock || 0) + item.quantity)
        });
      }
    }

    db.activityLogs.create({
      userId: req.user?.id || 'sys',
      userName: req.user?.name || 'Picker',
      action: 'ORDER_CLAIMED',
      details: `${req.user?.name} started picking Order #${order.orderNumber}`,
      category: 'ORDER'
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to claim order' });
  }
});

// Scan item inside picking cart
ordersRouter.post('/:id/scan', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { barcodeOrSku } = req.body;
    if (!barcodeOrSku) {
      res.status(400).json({ error: 'Barcode or SKU is required for scan verification' });
      return;
    }

    const order = db.orders.getById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.status !== 'PICKING') {
      res.status(400).json({ error: 'Order is not in PICKING state' });
      return;
    }

    const cleanInput = barcodeOrSku.trim().toLowerCase();

    // Find matching item in this order
    const itemIndex = order.items.findIndex(item => {
      const p = db.products.getById(item.productId);
      return (
        item.barcode.toLowerCase() === cleanInput ||
        item.sku.toLowerCase() === cleanInput ||
        (p && (p.barcode.toLowerCase() === cleanInput || p.sku.toLowerCase() === cleanInput))
      );
    });

    if (itemIndex === -1) {
      res.status(400).json({
        error: `Scanned item (${barcodeOrSku}) is NOT part of this order! Pick error prevention triggered.`,
        mismatch: true
      });
      return;
    }

    const item = order.items[itemIndex];
    if (item.pickedQuantity >= item.quantity) {
      res.status(400).json({
        error: `Item "${item.name}" has already been fully picked (${item.quantity}/${item.quantity})`,
        alreadyComplete: true
      });
      return;
    }

    item.pickedQuantity += 1;
    if (item.pickedQuantity >= item.quantity) {
      item.status = 'PICKED';
    }

    const allPicked = order.items.every(i => i.pickedQuantity >= i.quantity);

    const updated = db.orders.update(order.id, {
      items: order.items
    });

    res.json({
      order: updated,
      scannedItem: item,
      allPicked
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Scan processing failed' });
  }
});

// Complete packing & seal bags
ordersRouter.post('/:id/pack', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const order = db.orders.getById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const { bagCount, bagBarcodes } = req.body;

    // Deduct physical inventory & release reserved
    for (const item of order.items) {
      const prod = db.products.getById(item.productId);
      if (prod) {
        const newStock = Math.max(0, prod.stockOnHand - item.pickedQuantity);
        const newReserved = Math.max(0, (prod.reservedStock || 0) - item.quantity);
        db.products.update(prod.id, {
          stockOnHand: newStock,
          reservedStock: newReserved
        });
      }
    }

    const assignedBags = bagBarcodes && bagBarcodes.length > 0
      ? bagBarcodes
      : [`BAG-BLR04-${Math.floor(1000 + Math.random() * 9000)}`];

    const updated = db.orders.update(order.id, {
      status: 'PACKED',
      bagCount: bagCount || assignedBags.length,
      bagBarcodes: assignedBags,
      pickerCompleteTime: new Date().toISOString()
    });

    db.activityLogs.create({
      userId: req.user?.id || 'sys',
      userName: req.user?.name || 'Picker',
      action: 'ORDER_PACKED',
      details: `Order #${order.orderNumber} packed into ${updated?.bagCount} bag(s) [${assignedBags.join(', ')}]`,
      category: 'ORDER'
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to pack order' });
  }
});

// Dispatch order to rider
ordersRouter.post('/:id/dispatch', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const order = db.orders.getById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const { riderName, riderPhone } = req.body;

    const updated = db.orders.update(order.id, {
      status: 'DISPATCHED',
      riderName: riderName || 'Rider #' + Math.floor(10 + Math.random() * 90),
      riderPhone: riderPhone || '+91 98' + Math.floor(10000000 + Math.random() * 90000000)
    });

    db.activityLogs.create({
      userId: req.user?.id || 'sys',
      userName: req.user?.name || 'Supervisor',
      action: 'ORDER_DISPATCHED',
      details: `Order #${order.orderNumber} handed to ${updated?.riderName}`,
      category: 'ORDER'
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to dispatch order' });
  }
});

// Simulate incoming real-time order (For rapid demo and testing)
ordersRouter.post('/simulate', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const products = db.products.getAll().filter(p => p.stockOnHand > 5);
    if (products.length < 2) {
      res.status(400).json({ error: 'Not enough stocked products to generate order' });
      return;
    }

    // Pick 2-4 random items
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.floor(Math.random() * 3) + 2);

    const names = [
      'Vikram Malhotra', 'Sneha Reddy', 'Aditya Roy', 'Pooja Hegde',
      'Rohan Singhal', 'Divya Chawla', 'Karthik Raja', 'Meenakshi Sundaram'
    ];
    const customer = names[Math.floor(Math.random() * names.length)];

    const addresses = [
      'Apt 301, Brigade Gateway, Malleshwaram',
      'Flat 12B, Salarpuria Sattva, Koramangala 4th Block',
      'Plot 45, 8th Main, Defence Colony Indiranagar',
      'Tower 3, Apt 804, Sobha Dream Acres, Panathur'
    ];
    const address = addresses[Math.floor(Math.random() * addresses.length)];

    const items: OrderItem[] = selected.map(p => {
      const qty = Math.floor(Math.random() * 2) + 1;
      return {
        productId: p.id,
        sku: p.sku,
        name: p.name,
        quantity: qty,
        pickedQuantity: 0,
        price: p.sellingPrice,
        binLocation: p.binLocation,
        temperatureZone: p.temperatureZone,
        imageUrl: p.imageUrl,
        barcode: p.barcode,
        status: 'PENDING'
      };
    });

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const newOrder: Order = {
      id: 'ord_' + Date.now().toString(36),
      orderNumber: (Math.random() > 0.5 ? 'ZP-' : 'BK-') + Math.floor(1000 + Math.random() * 9000) + '-Q',
      customerName: customer,
      deliveryAddress: address,
      items,
      totalAmount,
      status: 'RECEIVED',
      slaTargetSeconds: 150,
      bagCount: 0,
      bagBarcodes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.create(newOrder);

    db.activityLogs.create({
      userId: 'customer_app',
      userName: 'Live Simulation',
      action: 'ORDER_PLACED',
      details: `New Order #${newOrder.orderNumber} received (${items.length} items, ₹${totalAmount})`,
      category: 'ORDER'
    });

    res.status(201).json(newOrder);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to simulate order' });
  }
});
