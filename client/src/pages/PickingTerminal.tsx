import React, { useState, useEffect } from 'react';
import {
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Barcode,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Check,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { Order, OrderItem } from '../types';
import { sounds } from '../utils/audio';

export const PickingTerminal: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const {
    orders,
    claimOrder,
    scanItemForOrder,
    packOrder,
    simulateIncomingOrder,
    addToast,
  } = useStore();
  const { user } = useAuth();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [scanInput, setScanInput] = useState('');
  const [isBaggingModalOpen, setIsBaggingModalOpen] = useState(false);
  const [bagCount, setBagCount] = useState(1);
  const [bagBarcodes, setBagBarcodes] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(150);
  const [isPacking, setIsPacking] = useState(false);

  // Active orders queue
  const pendingOrders = orders.filter((o) => o.status === 'RECEIVED' || o.status === 'PICKING');
  const activeOrder = orders.find((o) => o.id === selectedOrderId) || pendingOrders[0];

  useEffect(() => {
    if (activeOrder && activeOrder.id !== selectedOrderId) {
      setSelectedOrderId(activeOrder.id);
    }
  }, [activeOrder, selectedOrderId]);

  // SLA Countdown Timer effect
  useEffect(() => {
    if (!activeOrder) return;

    // Calculate remaining seconds based on order creation or picker start time
    const startTimestamp = new Date(activeOrder.pickerStartTime || activeOrder.createdAt).getTime();
    const targetSeconds = activeOrder.slaTargetSeconds || 150;

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
      const remaining = Math.max(0, targetSeconds - elapsed);
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeOrder]);

  const handleClaim = async (orderId: string) => {
    try {
      await claimOrder(orderId);
      setSelectedOrderId(orderId);
    } catch (e) {}
  };

  const handleScanItem = async (barcodeOrSku: string) => {
    if (!activeOrder) return;
    try {
      const res = await scanItemForOrder(activeOrder.id, barcodeOrSku);
      setScanInput('');
      if (res.allPicked) {
        // Open bagging prompt automatically
        setBagBarcodes([`BAG-GANESH-${Math.floor(1000 + Math.random() * 9000)}`]);
        setIsBaggingModalOpen(true);
      }
    } catch (e) {}
  };

  const handleCompleteBagging = async () => {
    if (!activeOrder) return;
    setIsPacking(true);
    try {
      await packOrder(activeOrder.id, bagCount, bagBarcodes);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ec4899', '#8b5cf6', '#10b981', '#f59e0b'],
        });
      } catch (err) {}

      setIsBaggingModalOpen(false);
      // Select next order in queue if available
      const next = pendingOrders.find((o) => o.id !== activeOrder.id);
      if (next) {
        setSelectedOrderId(next.id);
      }
    } catch (e) {
    } finally {
      setIsPacking(false);
    }
  };

  // Helper for timer styling
  const getTimerColor = (sec: number) => {
    if (sec > 60) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (sec > 25) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/20 animate-pulse';
  };

  if (!activeOrder) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
        <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
          <Zap className="w-10 h-10 animate-bounce-short" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">All Order Queues Clear!</h2>
        <p className="text-slate-400 text-xs max-w-md mt-1 mb-6">
          There are no pending 10-minute picking orders in Ganesh Dark Store right now.
          Generate a realistic customer order to test the rapid picking PDA engine!
        </p>
        <button
          onClick={simulateIncomingOrder}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Simulate Incoming Order</span>
        </button>
      </div>
    );
  }

  const allItemsPicked = activeOrder.items.every((i) => i.pickedQuantity >= i.quantity);
  const totalItemsCount = activeOrder.items.reduce((s, i) => s + i.quantity, 0);
  const totalPickedCount = activeOrder.items.reduce((s, i) => s + i.pickedQuantity, 0);

  return (
    <div className="space-y-4 pb-12">
      {/* Top SLA Pick Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/30">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-100">
                Order #{activeOrder.orderNumber}
              </h2>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  activeOrder.status === 'PICKING'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse'
                    : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                }`}
              >
                {activeOrder.status}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Customer: <strong className="text-slate-200">{activeOrder.customerName}</strong></span>
              <span>•</span>
              <span>{activeOrder.items.length} SKUs ({totalItemsCount} units)</span>
            </div>
          </div>
        </div>

        {/* SLA Countdown Display */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-black text-lg ${getTimerColor(timeLeft)}`}>
            <Clock className="w-5 h-5" />
            <span>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
              SLA Rem.
            </span>
          </div>

          {activeOrder.status === 'RECEIVED' ? (
            <button
              onClick={() => handleClaim(activeOrder.id)}
              className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-black text-xs shadow-lg shadow-pink-600/30 transition active:scale-95"
            >
              Claim & Start Timer
            </button>
          ) : (
            <button
              onClick={() => {
                setBagBarcodes([`BAG-BLR04-${Math.floor(1000 + Math.random() * 9000)}`]);
                setIsBaggingModalOpen(true);
              }}
              disabled={!allItemsPicked}
              className={`px-5 py-2.5 rounded-xl font-black text-xs transition shadow-lg ${
                allItemsPicked
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 animate-bounce-short cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              Seal & Bag ({totalPickedCount}/{totalItemsCount})
            </button>
          )}
        </div>
      </div>

      {/* Main Terminal Grid: Order Queue Selector + Active Picking Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column: Waiting Orders Queue */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span>Pending Orders ({pendingOrders.length})</span>
            <button
              onClick={simulateIncomingOrder}
              className="text-[11px] text-pink-400 hover:text-pink-300 font-semibold"
            >
              + Add Sim Order
            </button>
          </div>

          <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
            {pendingOrders.map((ord) => {
              const isCurrent = ord.id === activeOrder.id;
              const ordPicked = ord.items.reduce((s, i) => s + i.pickedQuantity, 0);
              const ordTotal = ord.items.reduce((s, i) => s + i.quantity, 0);

              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrderId(ord.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-xs ${
                    isCurrent
                      ? 'bg-slate-800 border-pink-500/50 shadow-md ring-1 ring-pink-500/20'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-slate-200">#{ord.orderNumber}</span>
                    <span className="text-[10px] font-mono text-pink-400 font-bold">
                      {ord.status}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] truncate">{ord.customerName}</div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{ord.items.length} SKUs</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {ordPicked}/{ordTotal} Picked
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 3 Columns: Active Pick Route & Item Scanning */}
        <div className="lg:col-span-3 space-y-4">
          {/* Quick Scanner Bar for active order */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <Barcode className="w-5 h-5 text-pink-400 shrink-0" />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (scanInput.trim()) {
                  handleScanItem(scanInput);
                }
              }}
              className="flex-1 flex gap-2"
            >
              <input
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Scan item barcode or type SKU (e.g. 8901262010053)..."
                disabled={activeOrder.status === 'RECEIVED'}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-pink-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={activeOrder.status === 'RECEIVED' || !scanInput.trim()}
                className="px-4 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition active:scale-95 disabled:opacity-40"
              >
                Verify
              </button>
            </form>
          </div>

          {/* Optimized Shortest Walking Path Banner */}
          <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>
                <strong>Smart Walk Sequence:</strong> Sorted by shortest picking route inside Indiranagar MFC.
              </span>
            </div>
            <span className="text-slate-400 font-mono">
              Progress: {totalPickedCount} of {totalItemsCount} units
            </span>
          </div>

          {/* Item Picking Cards */}
          <div className="space-y-3">
            {activeOrder.items.map((item, idx) => {
              const isComplete = item.pickedQuantity >= item.quantity;

              return (
                <div
                  key={item.productId}
                  className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isComplete
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Item Image */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                    />

                    <div>
                      {/* Bin Coordinate Badge */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[11px] font-black bg-pink-500/20 text-pink-300 border border-pink-500/30 font-mono">
                          BIN: {item.binLocation}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {item.temperatureZone}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          #{idx + 1} in walk path
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-100">{item.name}</h4>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        SKU: {item.sku} • Barcode: {item.barcode}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity & Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Qty Needed</div>
                      <div className="text-lg font-black font-mono">
                        <span
                          className={isComplete ? 'text-emerald-400' : 'text-slate-200'}
                        >
                          {item.pickedQuantity}
                        </span>{' '}
                        / {item.quantity}
                      </div>
                    </div>

                    {isComplete ? (
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Verified</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleScanItem(item.barcode)}
                        disabled={activeOrder.status === 'RECEIVED'}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-pink-600 text-slate-200 hover:text-white border border-slate-700 hover:border-pink-500 font-bold text-xs transition active:scale-95 disabled:opacity-50"
                        title="Simulate scanning this barcode"
                      >
                        <Barcode className="w-4 h-4 text-pink-400" />
                        <span>Scan Verify</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bagging & Sealing Modal */}
      {isBaggingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="text-center">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Dark Store Bagging Station</h3>
              <p className="text-xs text-slate-400 mt-1">
                All {totalItemsCount} items picked! Seal bags with tamper-proof security barcode for rider handover.
              </p>
            </div>

            <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Bag Count:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBagCount(Math.max(1, bagCount - 1))}
                    className="w-7 h-7 rounded bg-slate-700 text-slate-200 font-bold hover:bg-slate-600"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-sm text-slate-100">{bagCount}</span>
                  <button
                    onClick={() => {
                      const next = bagCount + 1;
                      setBagCount(next);
                      setBagBarcodes((prev) => [
                        ...prev,
                        `BAG-BLR04-${Math.floor(1000 + Math.random() * 9000)}`,
                      ]);
                    }}
                    className="w-7 h-7 rounded bg-slate-700 text-slate-200 font-bold hover:bg-slate-600"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                  Generated Bag Barcodes:
                </div>
                <div className="space-y-1">
                  {bagBarcodes.map((code, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-xs text-pink-400 font-bold flex items-center justify-between"
                    >
                      <span>{code}</span>
                      <span className="text-[10px] text-slate-400 font-normal">Tamper Sealed</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsBaggingModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteBagging}
                disabled={isPacking}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition active:scale-95 disabled:opacity-50"
              >
                {isPacking ? 'Sealing...' : 'Complete & Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

