import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Barcode,
  ThermometerSnowflake,
  ShieldCheck,
  FileText,
  Calendar,
  X,
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { InwardBatch, InwardBatchItem, Product } from '../types';

export const InwardingGRN: React.FC = () => {
  const { products, processInwardGRN, refreshAll } = useStore();
  const { user } = useAuth();

  const [inwardBatches, setInwardBatches] = useState<InwardBatch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [supplierName, setSupplierName] = useState('Gujarat Co-operative Milk Marketing Federation (Amul)');
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState(`PO-BLR-${Math.floor(1000 + Math.random() * 9000)}`);
  const [notes, setNotes] = useState('Dock receiving temperature checked: 3.4°C. Cold chain intact.');

  const [items, setItems] = useState<Array<{
    productId: string;
    productName: string;
    sku: string;
    orderedQty: number;
    receivedQty: number;
    rejectedQty: number;
    batchNumber: string;
    expiryDate: string;
    assignedBin: string;
    temperatureStatus: 'COMPLIANT' | 'BREACHED';
  }>>([
    {
      productId: products[0]?.id || 'prod_01',
      productName: products[0]?.name || 'Amul Taaza Milk',
      sku: products[0]?.sku || 'DRY-AMUL-01',
      orderedQty: 50,
      receivedQty: 50,
      rejectedQty: 0,
      batchNumber: 'B-AML-' + Math.floor(100 + Math.random() * 900),
      expiryDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      assignedBin: products[0]?.binLocation || 'COLD-01-A',
      temperatureStatus: 'COMPLIANT',
    },
  ]);

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('flashstore_token');
      const res = await fetch('/api/inwarding', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setInwardBatches(await res.json());
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleAddItemRow = () => {
    const defaultProd = products[items.length % products.length] || products[0];
    setItems([
      ...items,
      {
        productId: defaultProd.id,
        productName: defaultProd.name,
        sku: defaultProd.sku,
        orderedQty: 30,
        receivedQty: 30,
        rejectedQty: 0,
        batchNumber: 'B-' + Math.floor(100 + Math.random() * 900),
        expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        assignedBin: defaultProd.binLocation,
        temperatureStatus: 'COMPLIANT',
      },
    ]);
  };

  const handleProductSelect = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      assignedBin: prod.binLocation,
    };
    setItems(newItems);
  };

  const handleSubmitGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await processInwardGRN({
        supplierName,
        purchaseOrderNumber,
        notes,
        items,
      });
      setIsModalOpen(false);
      await fetchBatches();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-100">Inwarding & GRN Dock Terminal</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Goods Received Notes
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Receive supplier deliveries, verify cold-chain compliance, assign bin coordinates & replenish stock
          </p>
        </div>

        <button
          onClick={() => {
            setPurchaseOrderNumber(`PO-BLR-${Math.floor(1000 + Math.random() * 9000)}`);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-amber-600/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Inward New Shipment (GRN)</span>
        </button>
      </div>

      {/* Historical GRN Batches List */}
      <div className="space-y-3">
        {inwardBatches.map((batch) => (
          <div
            key={batch.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-100 font-mono">
                      {batch.grnNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Approved & Inwarded
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Supplier: <strong className="text-slate-200">{batch.supplierName}</strong> • PO:{' '}
                    <span className="font-mono text-slate-300">{batch.purchaseOrderNumber}</span>
                  </div>
                </div>
              </div>

              <div className="text-right text-xs text-slate-400">
                <div>
                  Received by: <strong className="text-slate-200">{batch.receivedBy}</strong>
                </div>
                <div className="text-[11px] font-mono mt-0.5">
                  {new Date(batch.receivedDate).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Inward Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800/40 rounded-lg">
                  <tr>
                    <th className="py-2 px-3">Item / SKU</th>
                    <th className="py-2 px-3">Received / Ordered</th>
                    <th className="py-2 px-3">Batch Number</th>
                    <th className="py-2 px-3">Expiry Date</th>
                    <th className="py-2 px-3">Assigned Bin</th>
                    <th className="py-2 px-3">Cold Chain Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {batch.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20">
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-200">
                        {item.productName}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">
                        {item.receivedQty} / {item.orderedQty} units
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{item.batchNumber}</td>
                      <td className="py-2.5 px-3 text-pink-400">{item.expiryDate}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-200">{item.assignedBin}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {item.temperatureStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {batch.notes && (
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <ThermometerSnowflake className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{batch.notes}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New GRN Inwarding Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-slate-100 text-base">New Inward Shipment & GRN Creation</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitGRN} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Supplier Name</label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Purchase Order (PO)</label>
                  <input
                    type="text"
                    required
                    value={purchaseOrderNumber}
                    onChange={(e) => setPurchaseOrderNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Quality & Cold Chain Receiving Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">Shipment Items ({items.length})</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                  >
                    + Add Another SKU
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 space-y-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">SKU Product</label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductSelect(idx, e.target.value)}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Assign Bin Location</label>
                          <input
                            type="text"
                            value={item.assignedBin}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[idx].assignedBin = e.target.value.toUpperCase();
                              setItems(newItems);
                            }}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono font-bold text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Received Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.receivedQty}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[idx].receivedQty = Number(e.target.value);
                              setItems(newItems);
                            }}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Batch Number</label>
                          <input
                            type="text"
                            value={item.batchNumber}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[idx].batchNumber = e.target.value;
                              setItems(newItems);
                            }}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Expiry Date (FEFO)</label>
                          <input
                            type="date"
                            value={item.expiryDate}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[idx].expiryDate = e.target.value;
                              setItems(newItems);
                            }}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/30 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Approve & Replenish Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
