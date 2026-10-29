import React, { useState } from 'react';
import {
  Zap,
  Lock,
  Mail,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  Sparkles,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { sounds } from '../utils/audio';

export const Login: React.FC<{ onSwitchToRegister: () => void }> = ({ onSwitchToRegister }) => {
  const { login, switchDemoRole } = useAuth();
  const [email, setEmail] = useState('manager@flashstore.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playBeep();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      sounds.playSuccess();
    } catch (err: any) {
      sounds.playError();
      setError(err.message || 'Login failed. Please check credentials or use 1-click login.');
    } finally {
      setLoading(false);
    }
  };

  const demoRoles: { role: UserRole; title: string; desc: string; icon: any; color: string; emailHint: string }[] = [
    {
      role: 'STORE_MANAGER',
      title: 'Store Manager',
      desc: 'Full MFC controls, KPIs & approvals',
      icon: ShieldCheck,
      color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/40 text-emerald-300 hover:border-emerald-400',
      emailHint: 'manager@flashstore.com',
    },
    {
      role: 'PICKER_PACKER',
      title: 'Picker / Packer',
      desc: '120s SLA rapid picking & bag seal',
      icon: Zap,
      color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/40 text-cyan-300 hover:border-cyan-400',
      emailHint: 'picker@flashstore.com',
    },
    {
      role: 'INVENTORY_SUPERVISOR',
      title: 'Inventory Supervisor',
      desc: 'Inbound GRN, cycle counts & audits',
      icon: Package,
      color: 'from-amber-500/20 to-yellow-600/20 border-amber-500/40 text-amber-300 hover:border-amber-400',
      emailHint: 'supervisor@flashstore.com',
    },
    {
      role: 'OPERATIONS_LEAD',
      title: 'Operations Lead',
      desc: 'Dark store fleet & city operations',
      icon: Layers,
      color: 'from-purple-500/20 to-indigo-600/20 border-purple-500/40 text-purple-300 hover:border-purple-400',
      emailHint: 'ops@flashstore.com',
    },
  ];

  const handleQuickDemoClick = async (role: UserRole) => {
    sounds.playBeep();
    setLoading(true);
    setError(null);
    try {
      await switchDemoRole(role);
      sounds.playSuccess();
    } catch (err: any) {
      sounds.playError();
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 shadow-xl shadow-emerald-500/30 mb-2 border border-emerald-400/30">
            <span className="font-black text-3xl text-slate-950 font-mono tracking-tighter">G</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
            Ganesh Dark Store OS
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            High-Velocity Micro-Fulfillment & Quick-Commerce Inventory Management System
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Store Hub: <strong className="text-emerald-300 font-mono">DS-BLR-01 Indiranagar</strong></span>
          </div>
        </div>

        {/* 1-Click Demo Login Panel */}
        <div className="p-5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              1-Click Instant Demo Login
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              No Password Needed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {demoRoles.map((demo) => {
              const Icon = demo.icon;
              return (
                <button
                  key={demo.role}
                  disabled={loading}
                  onClick={() => handleQuickDemoClick(demo.role)}
                  className={`p-3 rounded-xl border bg-gradient-to-br text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-md ${demo.color} disabled:opacity-50`}
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
            Or Sign In With Email
          </span>
          <div className="border-t border-slate-800 w-full" />
        </div>

        {/* Form Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Staff Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@flashstore.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition"
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
                  placeholder="admin123"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Ganesh Dark Store'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            Need to onboard store personnel?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-emerald-400 hover:text-emerald-300 font-bold underline"
            >
              Register Crew Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
