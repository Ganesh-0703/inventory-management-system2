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
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';

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
      label: 'MFC Dashboard',
      icon: LayoutDashboard,
      badge: null,
      desc: 'SLA & real-time ops',
    },
    {
      id: 'picking',
      label: '120s Picker Terminal',
      icon: Zap,
      badge: receivedOrdersCount > 0 ? { count: receivedOrdersCount, pulse: true, color: 'bg-pink-500 text-white' } : null,
      desc: 'Pick & pack workflow',
    },
    {
      id: 'inventory',
      label: 'Inventory & SKUs',
      icon: Package,
      badge: lowStockCount > 0 ? { count: lowStockCount, pulse: false, color: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' } : null,
      desc: 'Catalog, bins & stock',
    },
    {
      id: 'inwarding',
      label: 'Inwarding & GRN',
      icon: Truck,
      badge: null,
      desc: 'PO receipt & cold chain',
    },
    {
      id: 'store-map',
      label: 'Dark Store Layout',
      icon: MapPin,
      badge: null,
      desc: 'Aisles, racks & bins',
    },
    {
      id: 'expiry',
      label: 'FEFO Expiry Tracker',
      icon: Hourglass,
      badge: nearExpiryCount > 0 ? { count: nearExpiryCount, pulse: false, color: 'bg-rose-500/20 text-rose-300 border border-rose-500/30' } : null,
      desc: 'Clearance & waste prevention',
    },
    {
      id: 'orders',
      label: 'Orders & Dispatch',
      icon: Bike,
      badge: null,
      desc: 'Rider handover & bags',
    },
    {
      id: 'audit',
      label: 'Cycle Count & Audit',
      icon: ClipboardCheck,
      badge: null,
      desc: 'Discrepancy & adjustments',
    },
    {
      id: 'staff',
      label: 'Staff Directory',
      icon: Users,
      badge: null,
      desc: 'Store team & roles',
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Dark Store Operations
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-transparent text-pink-300 border-l-4 border-pink-500'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition ${
                      isActive ? 'text-pink-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
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
                      item.badge.pulse ? 'animate-pulse ring-2 ring-pink-500/50' : ''
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
      <div className="p-3 m-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold uppercase text-slate-400">Dark Store Pick SLA</span>
          <span className="text-emerald-400 font-mono font-bold text-xs">
            {metrics?.summary.slaComplianceRate ?? 96.2}%
          </span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${metrics?.summary.slaComplianceRate ?? 96.2}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
          <span>Target: &lt; 150s</span>
          <span className="text-slate-300 font-medium font-mono">
            Avg: {metrics?.summary.avgPickSeconds ?? 118}s
          </span>
        </div>
      </div>
    </aside>
  );
};
