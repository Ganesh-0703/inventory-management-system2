import React, { useState } from 'react';
import {
  Zap,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
  Package,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export const Login: React.FC<{ onSwitchToRegister: () => void }> = ({ onSwitchToRegister }) => {
  const { login, switchDemoRole } = useAuth();
  const [email, setEmail] = useState('manager@flashstore.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoRoles: { role: UserRole; title: string; desc: string; icon: any; color: string }[] = [
    {
      role: 'STORE_MANAGER',
      title: 'Store Manager',
      desc: 'Full MFC controls, KPIs & approvals',
      icon: ShieldCheck,
      color: 'from-purple-600/30 to-pink-600/30 border-purple-500/40 text-purple-300',
    },
    {
      role: 'PICKER_PACKER',
      title: 'Picker / Packer',
      desc: '120s SLA rapid picking & bag seal',
      icon: Zap,
      color: 'from-pink-600/30 to-rose-600/30 border-pink-500/40 text-pink-300',
    },
    {
      role: 'INVENTORY_SUPERVISOR',
      title: 'Inventory Supervisor',
      desc: 'Inbound GRN, cycle counts & audits',
      icon: Package,
      color: 'from-amber-600/30 to-yellow-600/30 border-amber-500/40 text-amber-300',
    },
    {
      role: 'OPERATIONS_LEAD',
      title: 'Operations Lead',
      desc: 'Dark store fleet & city operations',
      icon: Layers,
      color: 'from-blue-600/30 to-cyan-600/30 border-blue-500/40 text-blue-300',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 via-purple-600 to-amber-400 shadow-xl shadow-pink-600/30 mb-2">
            <Zap className="w-8 h-8 text-white fill-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-pink-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
            FlashStore MFC OS
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Quick-Commerce Store & Micro-Fulfillment Inventory Management System (Zepto & Blinkit Architecture)
          </p>
        </div>

        {/* 1-Click Demo Login Panel */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ⚡ 1-Click Instant Demo Login (Choose Role)
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">No Password Needed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {demoRoles.map((demo) => {
              const Icon = demo.icon;
              return (
                <button
                  key={demo.role}
                  onClick={() => switchDemoRole(demo.role)}
                  className={`p-3 rounded-xl border bg-gradient-to-br text-left transition hover:scale-[1.02] active:scale-95 shadow-md ${demo.color}`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{demo.title}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-tight">{demo.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-950 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            Or Sign In With Credentials
          </span>
          <div className="border-t border-slate-800 w-full" />
        </div>

        {/* Form Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Staff Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@flashstore.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-pink-600/30 transition active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to StoreOps Terminal'}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            Need to onboard new store staff?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-pink-400 hover:text-pink-300 font-bold underline"
            >
              Register Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
