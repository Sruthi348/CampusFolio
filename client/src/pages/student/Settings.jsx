import React, { useState } from 'react';
import api from '../../api/axios';
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

export function Settings() {
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      if (res.data.success) {
        setPasswordMessage({ type: 'success', text: 'Password successfully updated!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update password.'
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-[#526175] mt-1">
          Manage your account credentials and password security.
        </p>
      </div>

      {/* Change Password Card */}
      <div className="bg-white border border-[#DCE3EC] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#142B4A]" />
            Change Account Password
          </h2>
          <p className="text-xs text-[#526175] mt-1">
            Ensure your password is at least 6 characters and distinct from your default credentials.
          </p>
        </div>

        {passwordMessage.text && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 border ${
              passwordMessage.type === 'success'
                ? 'bg-[#EBF7EE] text-[#166534] border-[#86EFAC]'
                : 'bg-[#FDF0F0] text-[#A82222] border-[#FCA5A5]'
            }`}
          >
            {passwordMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{passwordMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
              New Password * (Min 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={passwordSaving}
              className="px-5 py-2.5 bg-[#142B4A] hover:bg-[#243F64] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {passwordSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
