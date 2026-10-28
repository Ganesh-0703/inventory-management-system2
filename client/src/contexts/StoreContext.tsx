import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Order, DashboardMetrics, InwardBatch, StockAdjustment } from '../types';
import { useAuth } from './AuthContext';
import { sounds } from '../utils/audio';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface StoreContextType {
  products: Product[];
  orders: Order[];
  metrics: DashboardMetrics | null;
  loading: boolean;
  toasts: Toast[];
  soundEnabled: boolean;
  scannerOpen: boolean;
  toggleSound: () => void;
  openScanner: () => void;
  closeScanner: () => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  refreshAll: () => Promise<void>;
  claimOrder: (orderId: string) => Promise<Order>;
  scanItemForOrder: (orderId: string, barcodeOrSku: string) => Promise<{ order: Order; scannedItem: any; allPicked: boolean }>;
  packOrder: (orderId: string, bagCount: number, bagBarcodes: string[]) => Promise<Order>;
  dispatchOrder: (orderId: string, riderName?: string, riderPhone?: string) => Promise<Order>;
  simulateIncomingOrder: () => Promise<Order>;
  adjustStock: (productId: string, adjustedStock: number, reason: string, notes?: string) => Promise<void>;
  saveProduct: (productData: Partial<Product>, isEdit?: boolean, id?: string) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  processInwardGRN: (payload: any) => Promise<InwardBatch>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    addToast(next ? 'Sound effects enabled' : 'Sound effects muted', 'info');
  };

  const openScanner = () => setScannerOpen(true);
  const closeScanner = () => setScannerOpen(false);

  // Fetch all core store data
  const refreshAll = useCallback(async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [prodRes, ordRes, metRes] = await Promise.all([
        fetch('/api/inventory', { headers }),
        fetch('/api/orders', { headers }),
        fetch('/api/analytics/dashboard', { headers }),
      ]);

      if (prodRes.ok) setProducts(await prodRes.json());
      if (ordRes.ok) setOrders(await ordRes.json());
      if (metRes.ok) setMetrics(await metRes.json());
    } catch (err) {
      console.error('Failed to load store data:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      refreshAll().finally(() => setLoading(false));

      // Periodic refresh every 15s to simulate live quick-commerce flow
      const interval = setInterval(refreshAll, 15000);
      return () => clearInterval(interval);
    }
  }, [token, refreshAll]);

  // Picker claims order
  const claimOrder = async (orderId: string): Promise<Order> => {
    const res = await fetch(`/api/orders/${orderId}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      sounds.playError();
      addToast(data.error || 'Failed to claim order', 'error');
      throw new Error(data.error);
    }

    sounds.playBeep();
    addToast(`Order #${data.orderNumber} claimed! Start picking.`, 'success');
    await refreshAll();
    return data;
  };

  // Picker scans item in order
  const scanItemForOrder = async (orderId: string, barcodeOrSku: string) => {
    const res = await fetch(`/api/orders/${orderId}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ barcodeOrSku }),
    });

    const data = await res.json();
    if (!res.ok) {
      sounds.playError();
      addToast(data.error || 'Scan error', 'error');
      throw new Error(data.error);
    }

    sounds.playBeep();
    if (data.allPicked) {
      sounds.playSuccess();
      addToast('All items picked! Proceed to bagging station.', 'success');
    } else {
      addToast(`Verified: ${data.scannedItem.name}`, 'success');
    }

    setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
    return data;
  };

  // Pack order and seal bags
  const packOrder = async (orderId: string, bagCount: number, bagBarcodes: string[]): Promise<Order> => {
    const res = await fetch(`/api/orders/${orderId}/pack`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bagCount, bagBarcodes }),
    });

    const data = await res.json();
    if (!res.ok) {
      sounds.playError();
      addToast(data.error || 'Failed to pack order', 'error');
      throw new Error(data.error);
    }

    sounds.playSuccess();
    addToast(`Order #${data.orderNumber} packed and sealed ready for dispatch!`, 'success');
    await refreshAll();
    return data;
  };

  // Dispatch order to rider
  const dispatchOrder = async (orderId: string, riderName?: string, riderPhone?: string): Promise<Order> => {
    const res = await fetch(`/api/orders/${orderId}/dispatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ riderName, riderPhone }),
    });

    const data = await res.json();
    if (!res.ok) {
      sounds.playError();
      addToast(data.error || 'Failed to dispatch order', 'error');
      throw new Error(data.error);
    }

    sounds.playBeep();
    addToast(`Handed to Rider: ${data.riderName}! Out for 10-min delivery.`, 'success');
    await refreshAll();
    return data;
  };

  // Simulate new live quick-commerce order
  const simulateIncomingOrder = async (): Promise<Order> => {
    const res = await fetch('/api/orders/simulate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      sounds.playError();
      addToast(data.error || 'Simulation failed', 'error');
      throw new Error(data.error);
    }

    sounds.playAlert();
    addToast(`⚡ New Live Order #${data.orderNumber} arrived! 2.5 min pick timer started.`, 'info');
    await refreshAll();
    return data;
  };

  // Stock Adjustment
  const adjustStock = async (productId: string, adjustedStock: number, reason: string, notes?: string) => {
    const res = await fetch(`/api/inventory/${productId}/adjust`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ adjustedStock, reason, notes }),
    });

    const data = await res.json();
    if (!res.ok) {
      sounds.playError();
      addToast(data.error || 'Stock adjustment failed', 'error');
      throw new Error(data.error);
    }

    sounds.playBeep();
    addToast(`Stock adjusted for ${data.product.name} to ${adjustedStock} units`, 'success');
    await refreshAll();
  };

  // Create or Update Product
  const saveProduct = async (productData: Partial<Product>, isEdit = false, id?: string): Promise<Product> => {
    const url = isEdit ? `/api/inventory/${id}` : '/api/inventory';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    const data = await res.json();
    if (!res.ok) {
      sounds.playError();
      addToast(data.error || 'Failed to save product', 'error');
      throw new Error(data.error);
    }

    sounds.playBeep();
    addToast(`${isEdit ? 'Updated' : 'Added'} SKU: ${data.name}`, 'success');
    await refreshAll();
    return data;
  };

  // Delete product
  const deleteProduct = async (id: string) => {
    const res = await fetch(`/api/inventory/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const data = await res.json();
      sounds.playError();
      addToast(data.error || 'Failed to delete product', 'error');
      throw new Error(data.error);
    }

    sounds.playBeep();
    addToast('Product SKU removed from dark store catalog', 'info');
    await refreshAll();
  };

  // Inward GRN
  const processInwardGRN = async (payload: any): Promise<InwardBatch> => {
    const res = await fetch('/api/inwarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      sounds.playError();
      addToast(data.error || 'Inwarding failed', 'error');
      throw new Error(data.error);
    }

    sounds.playSuccess();
    addToast(`GRN #${data.grnNumber} inwarded successfully! Inventory replenished.`, 'success');
    await refreshAll();
    return data;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        metrics,
        loading,
        toasts,
        soundEnabled,
        scannerOpen,
        toggleSound,
        openScanner,
        closeScanner,
        addToast,
        removeToast,
        refreshAll,
        claimOrder,
        scanItemForOrder,
        packOrder,
        dispatchOrder,
        simulateIncomingOrder,
        adjustStock,
        saveProduct,
        deleteProduct,
        processInwardGRN,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
