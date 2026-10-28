import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  FileText,
  User,
  Clock,
  Filter,
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { StockAdjustment, Product } from '../types';

export const StockAudit: React.FC = () => {
  const { products, adjustStock, refreshAll } = useStore();
  const { user } = useAuth();

  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [reason, setReason] = useState<StockAdjustment['reason']>('CYCLE_COUNT_MISMATCH');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  useEffect(() => {
    if (selectedProduct) {
      setPhysicalCount(selectedProduct.stockOnHand);
    }
  }, [selectedProductId, selectedProduct]);

  const fetchAdjustments = async () => {
    try {
      const token = localStorage.getItem('flashstore_token');
      const res = await fetch('/api/audit/adjustments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAdjustments(await res.json());
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchAdjustments();
  }, []);

  const handlePerformAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      await adjustStock(selectedProduct.id, physicalCount, reason, notes);
      setNotes('');
      await fetchAdjustments();
    } catch (e) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const variance = selectedProduct ? physicalCount - selectedProduct.stockOnHand : 0;

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-100">Cycle Count & Discrepancy Auditing</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Shrinkage & Stock Accuracy
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Shift-wise dark store bin audits, variance logging & immutable adjustment trails
          </p>
        </div>
      </div>

      {/* Audit Action Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
          <ClipboardCheck className="w-5 h-5 text-pink-500" />
          <span>Execute Physical Cycle Count</span>
        </div>

        <form onSubmit={handlePerformAudit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-semibold mb-1">Select SKU to Audit</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-pink-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.binLocation}] {p.name} ({p.sku}) — System: {p.stockOnHand} units
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Reason for Variance</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-pink-500"
              >
                <option value="CYCLE_COUNT_MISMATCH">Routine Shift Cycle Count</option>
                <option value="DAMAGE">Damaged / Broken Packaging</option>
                <option value="EXPIRY">Perishable Spoilage</option>
                <option value="PILFERAGE">Shrinkage / Missing from Bin</option>
                <option value="CUSTOMER_RETURN">Restocked Return</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                System Count: <strong className="text-slate-200 font-mono">{selectedProduct?.stockOnHand}</strong>
              </label>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-300 font-mono font-bold">
                {selectedProduct?.stockOnHand} {selectedProduct?.unit}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Actual Physical Counted</label>
              <input
                type="number"
                min="0"
                required
                value={physicalCount}
                onChange={(e) => setPhysicalCount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono font-bold focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Variance / Discrepancy</label>
              <div
                className={`p-2.5 rounded-xl border font-mono font-black ${
                  variance === 0
                    ? 'bg-slate-800/40 text-slate-400 border-slate-700'
                    : variance < 0
                    ? 'bg-rose-950/30 text-rose-300 border-rose-500/30'
                    : 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {variance > 0 ? `+${variance}` : variance} units ({variance === 0 ? 'Match' : 'Difference'})
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-semibold mb-1">Audit Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Recounted twice with supervisor. Found 1 crushed package at back of bin."
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSubmitting || variance === 0}
                className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-600/30 transition active:scale-95 disabled:opacity-40"
              >
                {isSubmitting ? 'Recording...' : 'Commit Audit Adjustment'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Adjustments History Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-100">Stock Adjustment History & Audit Trail</h3>
          <span className="text-xs text-slate-400">{adjustments.length} Adjustments Recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-3">Bin Location</th>
                <th className="py-3 px-3">Prev → New</th>
                <th className="py-3 px-3">Variance</th>
                <th className="py-3 px-3">Reason</th>
                <th className="py-3 px-3">Auditor</th>
                <th className="py-3 px-4">Date & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {adjustments.map((adj) => (
                <tr key={adj.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-200">{adj.productName}</div>
                    <div className="text-[11px] font-mono text-pink-400">{adj.sku}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-300">{adj.binLocation}</td>
                  <td className="py-3 px-3 font-mono">
                    <span className="text-slate-400">{adj.previousStock}</span> →{' '}
                    <strong className="text-slate-100">{adj.adjustedStock}</strong>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold">
                    <span className={adj.difference < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {adj.difference > 0 ? `+${adj.difference}` : adj.difference}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {adj.reason}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-medium">{adj.performedByName}</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    <div>{new Date(adj.createdAt).toLocaleString()}</div>
                    {adj.notes && <div className="text-slate-500 italic mt-0.5">{adj.notes}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
