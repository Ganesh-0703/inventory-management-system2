import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Phone,
  Mail,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { User, UserRole } from '../types';

export const UsersManagement: React.FC = () => {
  const { user: currentUser, switchDemoRole } = useAuth();
  const { addToast } = useStore();
  const [staffList, setStaffList] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('flashstore_token');
      const res = await fetch('/api/staff', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setStaffList(await res.json());
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: User['status']) => {
    try {
      const token = localStorage.getItem('flashstore_token');
      const res = await fetch(`/api/staff/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        addToast('Staff status updated', 'success');
        fetchStaff();
      }
    } catch (e) {}
  };

  const roleColors: Record<UserRole, string> = {
    STORE_MANAGER: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    INVENTORY_SUPERVISOR: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    PICKER_PACKER: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    OPERATIONS_LEAD: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-100">Dark Store Staff & Terminal Access</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
              Shift Directory
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage store managers, picking associates, inbound supervisors and operational leads
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Current Login:</span>
          <span className="font-bold text-pink-400 font-mono">{currentUser?.name}</span>
          <span className="text-slate-600">({currentUser?.role})</span>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staffList.map((st) => {
          const isMe = currentUser?.id === st.id;

          return (
            <div
              key={st.id}
              className={`p-5 rounded-2xl border transition space-y-4 ${
                isMe
                  ? 'bg-slate-900 border-pink-500/50 ring-1 ring-pink-500/30'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        st.avatarUrl ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${st.name}`
                      }
                      alt={st.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ring-2 ring-slate-900 ${
                        st.status === 'ACTIVE'
                          ? 'bg-emerald-500'
                          : st.status === 'ON_BREAK'
                          ? 'bg-amber-500'
                          : 'bg-slate-500'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-100">{st.name}</h3>
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-pink-500/20 text-pink-300">
                          You
                        </span>
                      )}
                    </div>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                        roleColors[st.role]
                      }`}
                    >
                      {st.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Quick Switch Button */}
                <button
                  onClick={() => switchDemoRole(st.role)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition active:scale-95"
                  title="Switch session to this user"
                >
                  Switch To
                </button>
              </div>

              {/* Contact info & Status */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300 font-mono">{st.email}</span>
                </div>
                {st.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-300 font-mono">{st.phone}</span>
                  </div>
                )}
              </div>

              {/* Shift status toggles */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400 font-medium">Shift Status:</span>
                <div className="flex gap-1">
                  {(['ACTIVE', 'ON_BREAK', 'OFFLINE'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleUpdateStatus(st.id, s)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition border ${
                        st.status === s
                          ? s === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : s === 'ON_BREAK'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-slate-900 text-slate-500 border-transparent hover:text-slate-300'
                      }`}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
