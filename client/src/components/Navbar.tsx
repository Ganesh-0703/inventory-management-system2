import React, { useState, useEffect } from 'react';
import {
  Zap,
  ThermometerSnowflake,
  Volume2,
  VolumeX,
  Barcode,
  LogOut,
  ChevronDown,
  Sparkles,
  Store,
  ShieldCheck,
  RefreshCw,
  Clock,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { UserRole } from '../types';
import { sounds } from '../utils/audio';

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
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

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
    sounds.playAlert();
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
    sounds.playBeep();
    setIsRefreshing(true);
    await refreshAll();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-3 max-w-[1920px] mx-auto">
        {/* Left: Brand & Store identification */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              sounds.playBeep();
              setActiveTab('dashboard');
            }}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-200">
              <span className="font-black text-lg text-slate-950 font-mono tracking-tighter">G</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-200 bg-clip-text text-transparent group-hover:opacity-90 transition">
                  Ganesh
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                  Dark Store OS
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Store className="w-3 h-3 text-slate-500" />
                <span className="font-medium text-slate-300">
                  {metrics?.summary.storeId || 'DS-BLR-01'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="truncate max-w-[140px] sm:max-w-none text-slate-400">
                  Ganesh Hub (Indiranagar MFC)
                </span>
              </div>
            </div>
          </div>

          {/* Environmental Cold Room Monitor Badge */}
          <div className="hidden lg:flex items-center gap-2.5 ml-3 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs shadow-inner">
            <div className="flex items-center gap-1.5 text-cyan-300">
              <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '9s' }} />
              <span className="font-mono font-bold">{metrics?.summary.coldRoomTemp ?? 3.8}°C</span>
              <span className="text-[10px] text-cyan-400/80 font-medium">Chiller</span>
            </div>
            <span className="text-slate-600 font-bold">|</span>
            <div className="flex items-center gap-1.5 text-amber-200">
              <span className="font-mono font-bold">{metrics?.summary.ambientTemp ?? 22.4}°C</span>
              <span className="text-[10px] text-amber-300/80 font-medium">Ambient</span>
            </div>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Cold Chain Compliant (HACCP Safe)"></span>
          </div>

          {/* Real-time Clock */}
          {currentTime && (
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTime}</span>
            </div>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Barcode Scanner button */}
          <button
            onClick={() => {
              sounds.playBeep();
              openScanner();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition shadow-sm active:scale-95 group"
            title="Open Barcode Scanner (Press / or Ctrl+K)"
          >
            <Barcode className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
            <span className="hidden sm:inline">Scan SKU</span>
            <span className="hidden md:inline px-1 py-0.2 rounded bg-slate-700 text-[10px] text-slate-400 font-mono">/</span>
          </button>

          {/* Simulate Live Quick Commerce Order */}
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-slate-950 shadow-md shadow-emerald-500/20 transition active:scale-95 disabled:opacity-50"
            title="Generate a live 120s simulated order to test dark store picking!"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Dispatching...' : 'Test Live Order'}</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={handleManualRefresh}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition active:scale-95"
            title="Refresh Store Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              toggleSound();
              sounds.playBeep();
            }}
            className={`p-2 rounded-xl border transition active:scale-95 ${
              soundEnabled
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/60'
                : 'bg-rose-950/40 text-rose-400 border-rose-800/40'
            }`}
            title={soundEnabled ? 'PDA Sounds: ON (Click to Mute)' : 'PDA Sounds: MUTED (Click to Enable)'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Role Switcher Pill / User Avatar */}
          <div className="relative">
            <button
              onClick={() => {
                sounds.playBeep();
                setRoleDropdownOpen(!roleDropdownOpen);
              }}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition shadow-sm"
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
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-900" />
              </div>
              <div className="text-left hidden md:block">
                <div className="font-semibold text-slate-100 leading-none">{user?.name}</div>
                <div className="text-[10px] text-emerald-400 leading-tight mt-0.5 font-mono">
                  {user?.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setRoleDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-800">
                  <div className="text-xs font-bold text-slate-100">{user?.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Shift Status:</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playBeep();
                        updateStaffStatus(user?.status === 'ACTIVE' ? 'ON_BREAK' : 'ACTIVE');
                      }}
                      className={`px-2 py-0.5 rounded-full font-semibold text-[10px] border transition ${
                        user?.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {user?.status || 'ACTIVE'} (Toggle)
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
                          onClick={() => {
                            sounds.playBeep();
                            switchDemoRole(r.role);
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs transition flex items-center justify-between border ${
                            isActive
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                              : 'hover:bg-slate-800/80 border-transparent text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{r.title}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{r.desc}</div>
                          </div>
                          {isActive && (
                            <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.5 rounded-full bg-emerald-500/20">
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
                    onClick={() => {
                      sounds.playBeep();
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
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
