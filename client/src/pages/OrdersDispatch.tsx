import React, { useState } from 'react';
import {
  Bike,
  CheckCircle2,
  Clock,
  Package,
  Barcode,
  ShoppingBag,
  User,
  MapPin,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Order } from '../types';

export const OrdersDispatch: React.FC = () => {
  const { orders, dispatchOrder, addToast } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [dispatchModalOrder, setDispatchModalOrder] = useState<Order | null>(null);
  const [riderName, setRiderName] = useState('Sunil Gowda (Rider #88)');
  const [riderPhone, setRiderPhone] = useState('+91 98450 12345');

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return o.status === filterStatus;
  });

  const handleConfirmDispatch = async () => {
    if (!dispatchModalOrder) return;
    try {
      await dispatchOrder(dispatchModalOrder.id, riderName, riderPhone);
      setDispatchModalOrder(null);
    } catch (e) {}
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/30 animate-pulse';
      case 'PICKING':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'PACKED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'DISPATCHED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-100">Orders & Rider Dispatch Bay</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              10-Minute Delivery Dispatch
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor dark store order lifecycle, verify sealed bags & hand over to Zepto/Blinkit delivery fleet
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'RECEIVED', 'PICKING', 'PACKED', 'DISPATCHED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                filterStatus === st
                  ? 'bg-pink-600 text-white border-pink-500 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-500">
            No orders matching filter "{filterStatus}".
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                    <Bike className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-slate-100 font-mono">
                        #{ord.orderNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getStatusBadge(ord.status)}`}>
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>Customer: <strong className="text-slate-200">{ord.customerName}</strong></span>
                      <span>•</span>
                      <span>Placed: {new Date(ord.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Total Value</div>
                    <div className="text-base font-black text-emerald-400 font-mono">
                      ₹{ord.totalAmount}
                    </div>
                  </div>

                  {ord.status === 'PACKED' && (
                    <button
                      onClick={() => {
                        setDispatchModalOrder(ord);
                        setRiderName(`Zepto Rider #${Math.floor(10 + Math.random() * 90)}`);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Bike className="w-4 h-4" />
                      <span>Dispatch to Rider</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Items & Bags Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Items in order */}
                <div>
                  <div className="font-semibold text-slate-400 mb-1.5">
                    Order Items ({ord.items.length}):
                  </div>
                  <div className="space-y-1.5">
                    {ord.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 text-slate-300"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-pink-400 font-bold">x{item.quantity}</span>
                          <span className="truncate">{item.name}</span>
                        </div>
                        <span className="font-mono text-slate-400 shrink-0">
                          Bin: {item.binLocation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dispatch Details */}
                <div className="bg-slate-800/30 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-start gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">Delivery Address</div>
                      <div className="text-slate-200 mt-0.5">{ord.deliveryAddress}</div>
                    </div>
                  </div>

                  {ord.bagBarcodes && ord.bagBarcodes.length > 0 && (
                    <div className="pt-2 border-t border-slate-700/50 flex items-center gap-2">
                      <Barcode className="w-4 h-4 text-amber-400" />
                      <span className="text-slate-400">Sealed Bags:</span>
                      <div className="flex gap-1.5">
                        {ord.bagBarcodes.map((bag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-pink-400 font-mono font-bold text-[11px]"
                          >
                            {bag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {ord.riderName && (
                    <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-slate-300">
                      <div>
                        Assigned Delivery Partner: <strong className="text-slate-100">{ord.riderName}</strong>
                      </div>
                      <div className="font-mono text-slate-400">{ord.riderPhone}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dispatch Modal */}
      {dispatchModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Bike className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="font-bold text-slate-100 text-base">Rider Handover</h3>
                <p className="text-xs text-slate-400">Order #{dispatchModalOrder.orderNumber}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Rider Name / Partner ID</label>
                <input
                  type="text"
                  value={riderName}
                  onChange={(e) => setRiderName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Rider Phone</label>
                <input
                  type="text"
                  value={riderPhone}
                  onChange={(e) => setRiderPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDispatchModalOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDispatch}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30"
              >
                Confirm Handover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
