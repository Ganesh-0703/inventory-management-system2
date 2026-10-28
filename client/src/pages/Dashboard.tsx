import React from 'react';
import {
  Package,
  Zap,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Hourglass,
  ArrowUpRight,
  Truck,
  Sparkles,
  MapPin,
  Flame,
  Activity,
  Layers,
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { metrics, orders, products, simulateIncomingOrder } = useStore();
  const { user } = useAuth();

  const activeOrders = orders.filter((o) => o.status === 'RECEIVED' || o.status === 'PICKING');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Operations Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/40 via-slate-900 to-slate-900 border border-purple-500/20 p-6">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-pink-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-ping" />
              Micro-Fulfillment Center Active
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="text-slate-400 text-xs max-w-xl mt-1">
              Store <span className="text-slate-200 font-semibold">{metrics?.summary.storeName}</span> is operating at{' '}
              <span className="text-emerald-400 font-semibold">{metrics?.summary.slaComplianceRate ?? 96.2}%</span> SLA efficiency.
              Average fulfillment dispatch: <span className="text-emerald-400 font-mono font-semibold">{metrics?.summary.avgPickSeconds ?? 118}s</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('picking')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 transition active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>Open 120s Picker ({activeOrders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('inwarding')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
            >
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Inward GRN</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock Valuation */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Inventory Valuation</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-100">
            ₹{(metrics?.summary.totalInventoryValue ?? 0).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>{metrics?.summary.totalUnitsOnHand ?? 0} units on hand</span>
            <span className="font-semibold text-emerald-400">{metrics?.summary.totalSkus ?? 0} SKUs</span>
          </div>
        </div>

        {/* 120s SLA Performance */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Avg Pick & Pack Time</span>
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100 font-mono">
              {metrics?.summary.avgPickSeconds ?? 118}s
            </span>
            <span className="text-xs font-bold text-emerald-400">
              (Target &lt; {metrics?.summary.targetPickTimeSec ?? 150}s)
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Compliance Rate</span>
            <span className="font-semibold text-emerald-400">
              {metrics?.summary.slaComplianceRate ?? 96.2}%
            </span>
          </div>
        </div>

        {/* Low Stock & Out of Stock */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Stock Reorder Alerts</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">
              {metrics?.summary.lowStockCount ?? 0}
            </span>
            <span className="text-xs text-slate-400">Low Stock SKUs</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span className="text-rose-400 font-semibold">
              {metrics?.summary.outOfStockCount ?? 0} Out of stock
            </span>
            <span className="text-slate-500 group-hover:text-amber-400 flex items-center gap-0.5">
              Review <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* FEFO Expiry Risk */}
        <div
          onClick={() => setActiveTab('expiry')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Near Expiry (7 Days)</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400">
              {metrics?.summary.nearExpiryCount ?? 0}
            </span>
            <span className="text-xs text-slate-400">SKUs At Risk</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span className="text-slate-400">
              Value: ₹{(metrics?.summary.nearExpiryValue ?? 0).toLocaleString('en-IN')}
            </span>
            <span className="text-slate-500 group-hover:text-rose-400 flex items-center gap-0.5">
              Clearance <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Live Order Flow Pipeline */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-pink-500" />
            <div>
              <h3 className="font-bold text-sm text-slate-100">Live 10-Minute Order Fulfillment Pipeline</h3>
              <p className="text-xs text-slate-400">Real-time orders moving through dark store stations</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            onClick={() => setActiveTab('picking')}
            className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-pink-500/50 cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>1. Order Received</span>
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
            </div>
            <div className="text-2xl font-black text-pink-400 mt-2 font-mono">
              {metrics?.ordersByStatus.RECEIVED ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Waiting for picker claim</div>
          </div>

          <div
            onClick={() => setActiveTab('picking')}
            className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-cyan-500/50 cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>2. In-Cart Picking</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div className="text-2xl font-black text-cyan-300 mt-2 font-mono">
              {metrics?.ordersByStatus.PICKING ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Active picking cart</div>
          </div>

          <div
            onClick={() => setActiveTab('orders')}
            className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-amber-500/50 cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>3. Packed & Bagged</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300 mt-2 font-mono">
              {metrics?.ordersByStatus.PACKED ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">At Bagging station</div>
          </div>

          <div
            onClick={() => setActiveTab('orders')}
            className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/50 cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>4. Dispatched with Rider</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
              {metrics?.ordersByStatus.DISPATCHED ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">On delivery bike</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Category Stock Breakdown & Recent Store Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-sm text-slate-100">Category Inventory Breakdown</h3>
            </div>
            <span className="text-xs text-slate-400">{Object.keys(metrics?.categoryStats || {}).length} Departments</span>
          </div>

          <div className="space-y-3">
            {metrics?.categoryStats &&
              Object.entries(metrics.categoryStats).map(([cat, data]) => {
                const totalVal = metrics.summary.totalInventoryValue || 1;
                const percent = Math.round((data.value / totalVal) * 100);

                return (
                  <div key={cat} className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-200">{cat}</span>
                      <span className="font-mono font-bold text-slate-300">
                        ₹{data.value.toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] text-slate-500 font-normal">({percent}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>{data.count} SKUs</span>
                      <span>{data.stock} units in stock</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Live Activity & Audit Trail */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">Dark Store Activity Feed</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live Audit
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
                metrics.recentActivity.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800/70 text-xs flex items-start gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-200 truncate">{log.userName}</span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-0.5">{log.details}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 py-8 text-center">No recent activity logs</div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Dark Store ID: {metrics?.summary.storeId}</span>
            <button
              onClick={() => setActiveTab('audit')}
              className="text-pink-400 hover:text-pink-300 font-semibold"
            >
              Full Audit Log →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

