import React from 'react';
import {
  LayoutDashboard,
  Package,
  Zap,
  Truck,
  MapPin,
  Hourglass,
  Bike,
  ClipboardCheck,
  Users,
  Activity,
  Flame,
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { sounds } from '../utils/audio';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { orders, products, metrics } = useStore();
  const { user } = useAuth();

  const receivedOrdersCount = orders.filter((o) => o.status === 'RECEIVED' || o.status === 'PICKING').length;
  const lowStockCount = metrics?.summary.lowStockCount ?? products.filter((p) => p.stockOnHand <= p.reorderPoint).length;
  const nearExpiryCount = metrics?.summary.nearExpiryCount ?? 0;

  const navItems = [
    {
      id: 'dashboard',
      label: 'MFC Command Hub',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Real-time dark store KPIs',
    },
    {
      id: 'picking',
      label: '120s Picker Terminal',
      icon: Zap,
      badge: receivedOrdersCount > 0 ? { count: receivedOrdersCount, pulse: true, color: 'bg-emerald-500 text-slate-950 font-black' } : null,
      desc: 'PDA scan & rapid pack flow',
    },
    {
      id: 'inventory',
      label: 'Inventory & SKUs',
      icon: Package,
      badge: lowStockCount > 0 ? { count: lowStockCount, pulse: false, color: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' } : null,
      desc: 'Stock, bins & aisles',
    },
    {
      id: 'inwarding',
      label: 'Inwarding & GRN',
      icon: Truck,
      badge: null,
      desc: 'PO receipt & cold chain inspection',
    },
    {
      id: 'store-map',
      label: 'Dark Store Floor Map',
      icon: MapPin,
      badge: null,
      desc: 'Aisles, racks & bin matrix',
    },
    {
      id: 'expiry',
      label: 'FEFO Expiry Tracker',
      icon: Hourglass,
      badge: nearExpiryCount > 0 ? { count: nearExpiryCount, pulse: false, color: 'bg-rose-500/20 text-rose-300 border border-rose-500/30' } : null,
      desc: 'Flash clearance & zero waste',
    },
    {
      id: 'orders',
      label: 'Orders & Dispatch',
      icon: Bike,
      badge: null,
      desc: 'Rider bag seals & handover',
    },
    {
      id: 'audit',
      label: 'Cycle Count & Audit',
      icon: ClipboardCheck,
      badge: null,
      desc: 'Variance & stock write-offs',
    },
    {
      id: 'staff',
      label: 'Store Crew Directory',
      icon: Users,
      badge: null,
      desc: 'Active pickers & shifts',
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-900/95 border-r border-slate-800/80 flex flex-col justify-between hidden md:flex select-none">
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <span>Dark Store Terminal</span>
          <span className="text-emerald-400 font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">LIVE</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  sounds.playBeep();
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all duration-150 group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-300 border-l-4 border-emerald-400 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="leading-snug">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal leading-tight">
                      {item.desc}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded-full ${item.badge.color} ${
                      item.badge.pulse ? 'animate-pulse ring-2 ring-emerald-400/50' : ''
                    }`}
                  >
                    {item.badge.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* SLA Status Widget Footer */}
      <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/60 text-xs shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold uppercase text-slate-300">Pick SLA Score</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold text-xs bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            {metrics?.summary.slaComplianceRate ?? 96.2}%
          </span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden p-0.5 border border-slate-700">
          <div
            className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-700"
            style={{ width: `${metrics?.summary.slaComplianceRate ?? 96.2}%` }}
          />
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
          <span>Target: &lt; {metrics?.summary.targetPickTimeSec ?? 150}s</span>
          <span className="text-emerald-300 font-medium font-mono">
            Avg: {metrics?.summary.avgPickSeconds ?? 118}s
          </span>
        </div>
      </div>
    </aside>
  );
};
