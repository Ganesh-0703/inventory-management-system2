import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'STORE_MANAGER' | 'INVENTORY_SUPERVISOR' | 'PICKER_PACKER' | 'OPERATIONS_LEAD';
  storeId: string;
  avatarUrl?: string;
  phone?: string;
  status: 'ACTIVE' | 'ON_BREAK' | 'OFFLINE';
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'Dairy & Breakfast' | 'Fresh Fruits & Veg' | 'Cold Beverages' | 'Instant & Snacks' | 'Personal Care' | 'Household & Cleaning';
  subCategory: string;
  brand: string;
  barcode: string;
  imageUrl: string;
  mrp: number;
  sellingPrice: number;
  costPrice: number;
  unit: string; // e.g. "500ml", "1kg", "Pack of 4"
  stockOnHand: number;
  reservedStock: number; // in active picking carts
  reorderPoint: number;
  safetyStock: number;
  maxCapacity: number;
  binLocation: string; // e.g. "A-01-B1" (Aisle A, Rack 01, Bin B1)
  temperatureZone: 'Ambient' | 'Chilled 4°C' | 'Frozen -18°C';
  expiryDate: string; // ISO date string
  batchNumber: string;
  isFastMoving: boolean;
  isFragile: boolean;
  status: 'ACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED';
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  pickedQuantity: number;
  price: number;
  binLocation: string;
  temperatureZone: string;
  imageUrl: string;
  barcode: string;
  status: 'PENDING' | 'PICKED' | 'SHORTAGE' | 'SUBSTITUTED';
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'RECEIVED' | 'PICKING' | 'PACKED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  assignedPickerId?: string;
  assignedPickerName?: string;
  pickerStartTime?: string;
  pickerCompleteTime?: string;
  slaTargetSeconds: number; // e.g. 180 seconds (3 mins pick SLA)
  bagCount: number;
  bagBarcodes: string[];
  riderName?: string;
  riderPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InwardBatch {
  id: string;
  grnNumber: string; // Goods Receipt Note
  supplierName: string;
  purchaseOrderNumber: string;
  receivedBy: string;
  receivedDate: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    orderedQty: number;
    receivedQty: number;
    rejectedQty: number;
    batchNumber: string;
    mfgDate: string;
    expiryDate: string;
    assignedBin: string;
    temperatureStatus: 'COMPLIANT' | 'BREACHED';
  }[];
  notes?: string;
  totalCost: number;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  previousStock: number;
  adjustedStock: number;
  difference: number;
  reason: 'DAMAGE' | 'EXPIRY' | 'CYCLE_COUNT_MISMATCH' | 'PILFERAGE' | 'CUSTOMER_RETURN' | 'INTERNAL_USE';
  performedBy: string;
  performedByName: string;
  binLocation: string;
  notes?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  category: 'INVENTORY' | 'ORDER' | 'INWARDING' | 'AUDIT' | 'AUTH';
  timestamp: string;
}

export interface DarkStoreConfig {
  storeId: string;
  storeName: string;
  location: string;
  pincode: string;
  totalAisles: number;
  totalBins: number;
  activePickersCount: number;
  targetPickTimeSec: number;
  coldRoomTemp: number; // Celsius
  ambientTemp: number;
}

interface DatabaseSchema {
  users: User[];
  products: Product[];
  orders: Order[];
  inwardBatches: InwardBatch[];
  adjustments: StockAdjustment[];
  activityLogs: ActivityLog[];
  config: DarkStoreConfig;
}

const DB_FILE = process.cwd().endsWith('server')
  ? path.join(process.cwd(), 'data', 'store.json')
  : path.join(process.cwd(), 'server', 'data', 'store.json');

export class Database {
  private data: DatabaseSchema = {
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

  private init() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error initializing database, using defaults:', err);
    }
  }

  public save() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // Users
  get users() {
    return {
      getAll: () => this.data.users,
      getById: (id: string) => this.data.users.find(u => u.id === id),
      getByEmail: (email: string) => this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()),
      create: (user: User) => {
        this.data.users.push(user);
        this.save();
        return user;
      },
      update: (id: string, updates: Partial<User>) => {
        const index = this.data.users.findIndex(u => u.id === id);
        if (index !== -1) {
          this.data.users[index] = { ...this.data.users[index], ...updates };
          this.save();
          return this.data.users[index];
        }
        return null;
      },
      delete: (id: string) => {
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
      getById: (id: string) => this.data.products.find(p => p.id === id),
      getBySku: (sku: string) => this.data.products.find(p => p.sku === sku),
      getByBarcode: (barcode: string) => this.data.products.find(p => p.barcode === barcode),
      create: (prod: Product) => {
        this.data.products.push(prod);
        this.save();
        return prod;
      },
      update: (id: string, updates: Partial<Product>) => {
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
          } else if (p.stockOnHand <= p.reorderPoint) {
            p.status = 'LOW_STOCK';
          } else {
            p.status = 'ACTIVE';
          }
          this.save();
          return this.data.products[index];
        }
        return null;
      },
      delete: (id: string) => {
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
      getById: (id: string) => this.data.orders.find(o => o.id === id),
      create: (order: Order) => {
        this.data.orders.unshift(order);
        this.save();
        return order;
      },
      update: (id: string, updates: Partial<Order>) => {
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
      create: (batch: InwardBatch) => {
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
      create: (adj: StockAdjustment) => {
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
      create: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
        const newLog: ActivityLog = {
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
      update: (updates: Partial<DarkStoreConfig>) => {
        this.data.config = { ...this.data.config, ...updates };
        this.save();
        return this.data.config;
      }
    };
  }

  // Seed Helper
  public seedDatabase(schema: Partial<DatabaseSchema>) {
    if (schema.users) this.data.users = schema.users;
    if (schema.products) this.data.products = schema.products;
    if (schema.orders) this.data.orders = schema.orders;
    if (schema.inwardBatches) this.data.inwardBatches = schema.inwardBatches;
    if (schema.adjustments) this.data.adjustments = schema.adjustments;
    if (schema.activityLogs) this.data.activityLogs = schema.activityLogs;
    if (schema.config) this.data.config = schema.config;
    this.save();
  }
}

export const db = new Database();

