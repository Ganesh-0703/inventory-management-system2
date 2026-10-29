import React, { useState } from 'react';
import {
  Hourglass,
  AlertTriangle,
  Tag,
  Trash2,
  TrendingDown,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Product } from '../types';

export const ExpiryTracker: React.FC = () => {
  const { products, saveProduct, adjustStock, addToast } = useStore();
  const [selectedFilter, setSelectedFilter] = useState<'3-days' | '7-days' | '15-days' | 'all'>('7-days');

  const now = new Date();

  const getDaysToExpiry = (expiryDateStr: string) => {
    const exp = new Date(expiryDateStr);
    const diff = exp.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  // Filter products by expiration threshold
  const expiringProducts = products
    .map((p) => ({
      ...p,
      daysLeft: getDaysToExpiry(p.expiryDate),
    }))
    .filter((p) => {
      if (selectedFilter === '3-days') return p.daysLeft <= 3;
      if (selectedFilter === '7-days') return p.daysLeft <= 7;
      if (selectedFilter === '15-days') return p.daysLeft <= 15;
      return true;
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const valueAtRisk = expiringProducts.reduce((sum, p) => sum + p.stockOnHand * p.sellingPrice, 0);

  // Apply Flash Clearance Discount (e.g. 30% discount to accelerate turnover)
  const applyClearanceDiscount = async (prod: Product, discountPercent: number) => {
    const discountedPrice = Math.max(1, Math.round(prod.mrp * (1 - discountPercent / 100)));
    try {
      await saveProduct(
        {
          sellingPrice: discountedPrice,
          isFastMoving: true,
        },
        true,
        prod.id
      );
      addToast(
        `Applied ${discountPercent}% clearance discount to ${prod.name}! New price: ₹${discountedPrice}`,
        'success'
      );
    } catch (e) {}
  };

  // Write off spoiled / expired stock
  const handleWriteOff = async (prod: Product) => {
    if (window.confirm(`Write off ${prod.stockOnHand} expired units of ${prod.name}?`)) {
      try {
        await adjustStock(prod.id, 0, 'EXPIRY', 'Expired perishable disposal');
        addToast(`Written off expired units for ${prod.name}`, 'info');
      } catch (e) {}
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-100">FEFO Expiry Tracker & Waste Prevention</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              First-Expired-First-Out
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify fresh perishables near expiration, trigger flash clearance promotions, and prevent store shrinkage
          </p>
        </div>

        {/* Value at Risk KPI */}
        <div className="px-4 py-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
            <Hourglass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Inventory Value At Risk</div>
            <div className="text-base font-black text-rose-300 font-mono">
              ₹{valueAtRisk.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
        <span className="text-xs font-bold text-slate-400 px-2">Expiry Window:</span>
        {[
          { id: '3-days', label: '🔥 Urgent (&lt; 3 Days)' },
          { id: '7-days', label: '⏳ Next 7 Days' },
          { id: '15-days', label: '📅 Next 15 Days' },
          { id: 'all', label: 'All Catalog' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              selectedFilter === tab.id
                ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Products List */}
      <div className="space-y-3">
        {expiringProducts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h3 className="font-bold text-slate-100">Zero Critical Expiries!</h3>
            <p className="text-xs text-slate-400 mt-1">
              All items in Ganesh Dark Store have healthy shelf life beyond this window.
            </p>
          </div>
        ) : (
          expiringProducts.map((p) => {
            const isUrgent = p.daysLeft <= 3;
            const isExpired = p.daysLeft <= 0;

            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isExpired
                    ? 'bg-rose-950/40 border-rose-500/60'
                    : isUrgent
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                          isExpired
                            ? 'bg-rose-500 text-white'
                            : isUrgent
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {isExpired ? 'EXPIRED' : `${p.daysLeft} Day${p.daysLeft > 1 ? 's' : ''} Left`}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 font-mono">
                        BIN: {p.binLocation}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Batch: {p.batchNumber}</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-100">{p.name}</h4>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Expiry Date: <strong className="text-slate-200 font-mono">{p.expiryDate}</strong> • In
                      Stock: <span className="text-slate-200 font-bold font-mono">{p.stockOnHand}</span> {p.unit}
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Current Price</div>
                    <div className="text-base font-black text-slate-100 font-mono">
                      ₹{p.sellingPrice}{' '}
                      <span className="text-xs text-slate-500 font-normal line-through">MRP: ₹{p.mrp}</span>
                    </div>
                  </div>

                  {isExpired ? (
                    <button
                      onClick={() => handleWriteOff(p)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Write Off Stock</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => applyClearanceDiscount(p, 25)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
                        title="Reduce price by 25%"
                      >
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span>-25% Flash</span>
                      </button>
                      <button
                        onClick={() => applyClearanceDiscount(p, 50)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-600/30 transition active:scale-95"
                        title="Reduce price by 50% clearance"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>-50% Clearance</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

