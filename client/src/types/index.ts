export type UserRole =
  | 'STORE_MANAGER'
  | 'INVENTORY_SUPERVISOR'
  | 'PICKER_PACKER'
  | 'OPERATIONS_LEAD';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId: string;
  phone?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'ON_BREAK' | 'OFFLINE';
  createdAt: string;
}

export type Category =
  | 'Dairy & Breakfast'
  | 'Fresh Fruits & Veg'
  | 'Cold Beverages'
  | 'Instant & Snacks'
  | 'Personal Care'
  | 'Household & Cleaning';

export type TemperatureZone = 'Ambient' | 'Chilled 4°C' | 'Frozen -18°C';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: Category;
  subCategory: string;
  brand: string;
  barcode: string;
  imageUrl: string;
  mrp: number;
  sellingPrice: number;
  costPrice: number;
  unit: string;
  stockOnHand: number;
  reservedStock: number;
  reorderPoint: number;
  safetyStock: number;
  maxCapacity: number;
  binLocation: string;
  temperatureZone: TemperatureZone;
  expiryDate: string;
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
  slaTargetSeconds: number;
  bagCount: number;
  bagBarcodes: string[];
  riderName?: string;
  riderPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InwardBatchItem {
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
}

export interface InwardBatch {
  id: string;
  grnNumber: string;
  supplierName: string;
  purchaseOrderNumber: string;
  receivedBy: string;
  receivedDate: string;
  items: InwardBatchItem[];
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

export interface DashboardMetrics {
  summary: {
    totalSkus: number;
    totalUnitsOnHand: number;
    totalInventoryValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    nearExpiryCount: number;
    nearExpiryValue: number;
    avgPickSeconds: number;
    slaComplianceRate: number;
    targetPickTimeSec: number;
    activePickersCount: number;
    coldRoomTemp: number;
    ambientTemp: number;
    storeName: string;
    storeId: string;
  };
  ordersByStatus: {
    RECEIVED: number;
    PICKING: number;
    PACKED: number;
    DISPATCHED: number;
    DELIVERED: number;
  };
  categoryStats: Record<string, { count: number; stock: number; value: number }>;
  nearExpiryProducts: Product[];
  recentActivity: ActivityLog[];
  recentAdjustments: StockAdjustment[];
}

