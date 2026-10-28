import React, { useState } from 'react';
import { X, Barcode, Search, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { sounds } from '../utils/audio';
import { Product } from '../types';

export const QuickScannerModal: React.FC = () => {
  const { scannerOpen, closeScanner, products, adjustStock, addToast } = useStore();
  const [scanInput, setScanInput] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState<number | ''>('');

  if (!scannerOpen) return null;

  const handleScan = (codeToTest?: string) => {
    const code = (codeToTest || scanInput).trim().toLowerCase();
    if (!code) return;

    const matched = products.find(
      (p) =>
        p.barcode.toLowerCase() === code ||
        p.sku.toLowerCase() === code ||
        p.name.toLowerCase().includes(code)
    );

    if (matched) {
      sounds.playBeep();
      setFoundProduct(matched);
      setErrorMsg(null);
      setAdjustmentQty(matched.stockOnHand);
    } else {
      sounds.playError();
      setErrorMsg(`No product found for scan code: "${code}"`);
      setFoundProduct(null);
    }
  };

  const handleQuickAdjust = async () => {
    if (!foundProduct || adjustmentQty === '') return;
    try {
      await adjustStock(foundProduct.id, Number(adjustmentQty), 'CYCLE_COUNT_MISMATCH', 'Direct scanner adjustment');
      sounds.playSuccess();
      addToast(`Updated ${foundProduct.name} stock to ${adjustmentQty}`, 'success');
      setFoundProduct({ ...foundProduct, stockOnHand: Number(adjustmentQty) });
    } catch (err: any) {
      // handled
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Zebra PDA / Laser Barcode Scanner</h3>
              <p className="text-xs text-slate-400">Scan Dark Store SKU, Bin Barcode or verify item</p>
            </div>
          </div>
          <button
            onClick={closeScanner}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Simulation Body */}
        <div className="p-6 space-y-5">
          {/* Virtual Scanner Viewfinder */}
          <div className="relative h-32 rounded-xl bg-slate-950 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center overflow-hidden">
            {/* Animated Laser Line */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent animate-pulse-fast shadow-[0_0_12px_#ec4899]" />
            <Barcode className="w-12 h-12 text-slate-700 mb-1" />
            <span className="text-xs font-mono text-slate-400 tracking-wider">
              READY TO SCAN BARCODE OR SKU
            </span>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScan();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Scan or enter Barcode / SKU (e.g. 8901262010053, DRY-AMUL-01)..."
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-600/30 transition active:scale-95"
            >
              Scan
            </button>
          </form>

          {/* Quick Click Samples */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 mb-2">
              Quick Test: Click any item barcode to simulate scan:
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {products.slice(0, 8).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setScanInput(p.barcode);
                    handleScan(p.barcode);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-[11px] text-slate-300 transition font-mono flex items-center gap-1.5"
                >
                  <span className="truncate max-w-[100px] text-slate-200">{p.name}</span>
                  <span className="text-[10px] text-pink-400">({p.barcode.slice(-4)})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Feedback */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Found Product Result Card */}
          {foundProduct && (
            <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-start gap-4">
                <img
                  src={foundProduct.imageUrl}
                  alt={foundProduct.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-pink-400">{foundProduct.sku}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">
                      Bin: {foundProduct.binLocation}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {foundProduct.temperatureZone}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-100 truncate mt-1">
                    {foundProduct.name}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                    <div>
                      Stock on Hand:{' '}
                      <span className="font-bold text-slate-100">{foundProduct.stockOnHand}</span>
                    </div>
                    <div>
                      Selling Price:{' '}
                      <span className="font-bold text-emerald-400">₹{foundProduct.sellingPrice}</span>
                    </div>
                    <div>
                      Batch: <span className="font-mono text-slate-300">{foundProduct.batchNumber}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fast Inline Stock Adjustment */}
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-400 font-medium">Quick Count Audit:</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={adjustmentQty}
                    onChange={(e) => setAdjustmentQty(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-20 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono text-center focus:outline-none focus:border-pink-500"
                  />
                  <button
                    onClick={handleQuickAdjust}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition active:scale-95"
                  >
                    Save Stock
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
