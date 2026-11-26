import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Settings,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  Mail,
  Server
} from 'lucide-react';

export function AdminSettings() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (res.data.success) {
        setPasswordMessage({ type: 'success', text: 'Administrator password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-[#E2E8F0]">
        <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#3730A3]" />
          Platform Administration Settings
        </h1>
        <p className="text-xs text-[#475569] mt-0.5">
          Global institutional settings, system parameters, and administrator credential management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Info Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 pb-3 border-b border-slate-100">
            <Server className="w-4 h-4 text-[#3730A3]" />
            System Architecture & Policies
          </h2>

          <div className="text-xs space-y-3 text-slate-600">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block">Separation of Responsibilities:</span>
              <p className="mt-1 leading-relaxed">
                Routine verification and approval of student certificates, achievements, and proofs is delegated to authorized <strong>Staff members (Class In-charges and Tutors)</strong>.
              </p>
              <p className="mt-1 leading-relaxed text-slate-500">
                Administration maintains overall system governance, account creation, credential lifecycle, and monitoring through centralized verification audit logs.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Database Engine:</span>
                <span className="font-semibold text-slate-800">PostgreSQL (Prisma ORM)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Security Architecture:</span>
                <span className="font-semibold text-slate-800">JWT + Bcrypt RBAC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Admin Email:</span>
                <span className="font-mono text-slate-800">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Admin Password */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
            <Lock className="w-4 h-4 text-[#3730A3]" />
            Change Admin Password
          </h2>

          {passwordMessage.text && (
            <div
              className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                passwordMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {passwordMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current admin password..."
                className="w-full bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0] focus:outline-hidden focus:border-[#3730A3]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters..."
                className="w-full bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0] focus:outline-hidden focus:border-[#3730A3]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password..."
                className="w-full bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0] focus:outline-hidden focus:border-[#3730A3]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordSaving}
                className="w-full py-2.5 rounded-xl bg-[#3730A3] text-white font-bold hover:bg-[#312E81] disabled:opacity-50 transition"
              >
                {passwordSaving ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
