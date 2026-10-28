import React, { useState } from 'react';
import {
  Zap,
  ThermometerSnowflake,
  Volume2,
  VolumeX,
  Barcode,
  PlusCircle,
  LogOut,
  UserCheck,
  ChevronDown,
  Sparkles,
  Store,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { UserRole } from '../types';

export const Navbar: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({
  activeTab,
  setActiveTab,
}) => {
  const { user, logout, switchDemoRole, updateStaffStatus } = useAuth();
  const {
    metrics,
    soundEnabled,
    toggleSound,
    openScanner,
    simulateIncomingOrder,
    refreshAll,
  } = useStore();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const roles: { role: UserRole; title: string; desc: string; color: string }[] = [
    {
      role: 'STORE_MANAGER',
      title: 'Store Manager',
      desc: 'Full MFC controls, KPIs & approvals',
      color: 'text-purple-400 border-purple-500/30',
    },
    {
      role: 'PICKER_PACKER',
      title: 'Picker / Packer',
      desc: '120s SLA picking terminal & scan',
      color: 'text-emerald-400 border-emerald-500/30',
    },
    {
      role: 'INVENTORY_SUPERVISOR',
      title: 'Inventory Supervisor',
      desc: 'Inwarding, GRN, cycle counts',
      color: 'text-amber-400 border-amber-500/30',
    },
    {
      role: 'OPERATIONS_LEAD',
      title: 'Operations Lead',
      desc: 'City level metrics & staff audit',
      color: 'text-blue-400 border-blue-500/30',
    },
  ];

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      await simulateIncomingOrder();
      setActiveTab('picking');
    } catch (e) {
    } finally {
      setIsSimulating(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshAll();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Brand & Store identification */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 via-purple-600 to-amber-400 shadow-lg shadow-pink-500/20">
              <Zap className="w-6 h-6 text-white fill-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
                  FlashStore
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  MFC OS
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Store className="w-3 h-3 text-slate-500" />
                <span className="font-medium text-slate-300">
                  {metrics?.summary.storeId || 'DS-BLR-04'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="truncate max-w-[130px] sm:max-w-none text-slate-400">
                  Indiranagar Dark Store
                </span>
              </div>
            </div>
          </div>

          {/* Environmental Cold Room Monitor Badge */}
          <div className="hidden lg:flex items-center gap-2 ml-4 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <div className="flex items-center gap-1 text-cyan-300">
              <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="font-mono font-semibold">{metrics?.summary.coldRoomTemp ?? 3.8}°C</span>
              <span className="text-[10px] text-cyan-400/80">Chiller</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1 text-amber-200">
              <span className="font-mono font-semibold">{metrics?.summary.ambientTemp ?? 22.4}°C</span>
              <span className="text-[10px] text-amber-300/80">Ambient</span>
            </div>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Cold Chain Compliant"></span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Barcode Scanner button */}
          <button
            onClick={openScanner}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition shadow-sm active:scale-95"
            title="Open Barcode Scanner (Press / or Click)"
          >
            <Barcode className="w-4 h-4 text-pink-400" />
            <span className="hidden sm:inline">Scan SKU</span>
          </button>

          {/* Simulate Live Quick Commerce Order */}
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:opacity-95 text-white shadow-md shadow-pink-600/20 transition active:scale-95 disabled:opacity-50"
            title="Generate a live simulated Zepto/Blinkit order to test the 120s picker flow!"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Sending...' : 'Test Live Order'}</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={handleManualRefresh}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition active:scale-95"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-pink-400' : ''}`} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg border transition active:scale-95 ${
              soundEnabled
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/60'
                : 'bg-rose-950/40 text-rose-400 border-rose-800/40'
            }`}
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Role Switcher Pill / User Avatar */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition"
            >
              <div className="relative">
                <img
                  src={
                    user?.avatarUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'staff'}`
                  }
                  alt={user?.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-600"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-slate-900" />
              </div>
              <div className="text-left hidden md:block">
                <div className="font-semibold text-slate-200 leading-none">{user?.name}</div>
                <div className="text-[10px] text-pink-400 leading-tight mt-0.5 font-mono">
                  {user?.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setRoleDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-800">
                  <div className="text-xs font-bold text-slate-200">{user?.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400">Status:</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStaffStatus(user?.status === 'ACTIVE' ? 'ON_BREAK' : 'ACTIVE');
                      }}
                      className={`px-2 py-0.5 rounded font-semibold text-[10px] border transition ${
                        user?.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {user?.status || 'ACTIVE'} (Tap to toggle)
                    </button>
                  </div>
                </div>

                {/* Quick Role Switcher */}
                <div className="p-1.5">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Active Terminal Role
                  </div>
                  <div className="space-y-1">
                    {roles.map((r) => {
                      const isActive = user?.role === r.role;
                      return (
                        <button
                          key={r.role}
                          onClick={() => switchDemoRole(r.role)}
                          className={`w-full text-left p-2 rounded-lg text-xs transition flex items-center justify-between border ${
                            isActive
                              ? 'bg-pink-500/10 border-pink-500/40 text-pink-300 font-semibold'
                              : 'hover:bg-slate-800/80 border-transparent text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                              <span>{r.title}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{r.desc}</div>
                          </div>
                          {isActive && (
                            <span className="text-[10px] font-bold text-pink-400 px-1.5 py-0.5 rounded bg-pink-500/20">
                              Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-1.5 mt-1 border-t border-slate-800">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
