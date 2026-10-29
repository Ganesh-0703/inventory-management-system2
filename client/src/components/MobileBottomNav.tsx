import React, { useState } from 'react';
import {
  LayoutDashboard,
  Zap,
  Package,
  Bike,
  Menu,
  X,
  Truck,
  MapPin,
  Hourglass,
  ClipboardCheck,
  Users,
  Barcode,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { sounds } from '../utils/audio';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { orders, products, metrics, openScanner } = useStore();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const activeOrdersCount = orders.filter((o) => o.status === 'RECEIVED' || o.status === 'PICKING').length;
  const lowStockCount = metrics?.summary.lowStockCount ?? products.filter((p) => p.stockOnHand <= p.reorderPoint).length;

  const handleTabClick = (tabId: string) => {
    sounds.playBeep();
    setActiveTab(tabId);
    setMoreMenuOpen(false);
  };

  const moreItems = [
    { id: 'inwarding', label: 'Inwarding & GRN', icon: Truck, desc: 'Receive stock & verify temperature' },
    { id: 'store-map', label: 'Dark Store Layout', icon: MapPin, desc: 'Interactive aisle & bin map' },
    { id: 'expiry', label: 'FEFO Expiry Tracker', icon: Hourglass, desc: 'Clearance sales & waste prevention' },
    { id: 'audit', label: 'Stock Audit & Cycle Count', icon: ClipboardCheck, desc: 'Physical vs system count adjustments' },
    { id: 'staff', label: 'Crew & Shift Management', icon: Users, desc: 'Staff roles & active picker fleet' },
  ];

  return (
    <>
      {/* Slide-Up Bottom Sheet for "More" Menu */}
      {moreMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setMoreMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative bg-slate-900 border-t border-slate-700/80 rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto -mt-1 mb-2" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                  <span>Ganesh Store Operations</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Menu
                  </span>
                </h3>
                <p className="text-xs text-slate-400">All warehouse modules & controls</p>
              </div>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions in Sheet */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setMoreMenuOpen(false);
                  openScanner();
                }}
                className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-slate-200 active:scale-95 transition"
              >
                <Barcode className="w-4 h-4 text-emerald-400" />
                <span>Barcode Scanner</span>
              </button>
              <button
                onClick={() => handleTabClick('picking')}
                className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300 active:scale-95 transition"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Picker Queue ({activeOrdersCount})</span>
              </button>
            </div>

            {/* Navigation List */}
            <div className="space-y-1.5 pt-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs transition active:scale-98 ${
                      isActive
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 text-xs">{item.label}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{item.desc}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar (like Flipkart & Amazon mobile app) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/90 px-2 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
        <div className="grid grid-cols-5 items-center">
          {/* 1. Dashboard */}
          <button
            onClick={() => handleTabClick('dashboard')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[10px] mt-0.5 tracking-tight">Hub</span>
          </button>

          {/* 2. 120s Picker */}
          <button
            onClick={() => handleTabClick('picking')}
            className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'picking' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Zap className={`w-5 h-5 ${activeTab === 'picking' ? 'scale-110 fill-emerald-400' : ''} transition-transform`} />
              {activeOrdersCount > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 min-w-[16px] h-4 text-[9px] font-black rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center animate-pulse shadow-md shadow-emerald-500/40">
                  {activeOrdersCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Pick (120s)</span>
          </button>

          {/* 3. Center Scanner Button (Hero Action) */}
          <button
            onClick={() => {
              sounds.playBeep();
              openScanner();
            }}
            className="flex flex-col items-center justify-center -mt-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/35 border-2 border-slate-900 group-active:scale-90 transition-transform">
              <Barcode className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[9px] mt-0.5 font-extrabold text-emerald-400 tracking-wider uppercase">Scan</span>
          </button>

          {/* 4. Products / Inventory */}
          <button
            onClick={() => handleTabClick('inventory')}
            className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'inventory' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Package className={`w-5 h-5 ${activeTab === 'inventory' ? 'scale-110' : ''} transition-transform`} />
              {lowStockCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Store</span>
          </button>

          {/* 5. More Menu */}
          <button
            onClick={() => {
              sounds.playBeep();
              setMoreMenuOpen(!moreMenuOpen);
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              moreMenuOpen || ['orders', 'inwarding', 'store-map', 'expiry', 'audit', 'staff'].includes(activeTab)
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
