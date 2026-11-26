import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Settings,
  User,
  Lock,
  Mail,
  Building,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

export function StaffSettings() {
  const { user, refreshUser } = useAuth();
  const staff = user?.staffProfile;

  const [phone, setPhone] = useState(staff?.phone || '');
  const [designation, setDesignation] = useState(staff?.designation || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const res = await api.put('/staff/settings', {
        phone,
        designation
      });

      if (res.data.success) {
        setProfileMessage({ type: 'success', text: 'Staff contact details updated successfully.' });
        await refreshUser?.();
      }
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update settings.' });
    } finally {
      setProfileSaving(false);
    }
  };

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
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
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
      <div className="pb-4 border-b border-[#DCE3EC]">
        <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#142B4A]" />
          Staff Account Settings
        </h1>
        <p className="text-xs text-[#526175] mt-0.5">
          Manage your faculty profile information, contact channels, and institutional credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-xl border border-[#DCE3EC] shadow-xs">
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 pb-3 border-b border-[#DCE3EC] mb-4">
            <User className="w-4 h-4 text-[#142B4A]" />
            Faculty Information
          </h2>

          {profileMessage.text && (
            <div
              className={`p-3 rounded-lg mb-4 text-xs flex items-center gap-2 border ${
                profileMessage.type === 'success'
                  ? 'bg-[#EBF7EE] text-[#166534] border-[#86EFAC]'
                  : 'bg-[#FDF0F0] text-[#A82222] border-[#FCA5A5]'
              }`}
            >
              {profileMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#166534]" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-[#A82222]" />
              )}
              <span>{profileMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={staff?.fullName || ''}
                className="w-full bg-[#F4F6F9] p-2.5 rounded-lg border border-[#DCE3EC] text-[#526175] cursor-not-allowed font-medium"
              />
              <span className="text-xs text-[#526175]">Institutional names are administered centrally.</span>
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">Staff ID / Code</label>
              <input
                type="text"
                disabled
                value={staff?.staffId || ''}
                className="w-full bg-[#F4F6F9] p-2.5 rounded-lg border border-[#DCE3EC] text-[#526175] font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">Institutional Email</label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full bg-[#F4F6F9] p-2.5 rounded-lg border border-[#DCE3EC] text-[#526175] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">Designation / Role Title</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Class In-charge / Tutor"
                className="w-full bg-[#F4F6F9] p-2.5 rounded-lg border border-[#DCE3EC] text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-[#F4F6F9] p-2.5 rounded-lg border border-[#DCE3EC] text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-2.5 rounded-lg bg-[#142B4A] text-white font-semibold hover:bg-[#243F64] disabled:opacity-50 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                {profileSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {profileSaving ? 'Saving...' : 'Update Faculty Details'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white p-6 rounded-xl border border-[#DCE3EC] shadow-xs">
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 pb-3 border-b border-[#DCE3EC] mb-4">
            <Lock className="w-4 h-4 text-[#142B4A]" />
            Change Password
          </h2>

          {passwordMessage.text && (
            <div
              className={`p-3 rounded-lg mb-4 text-xs flex items-center gap-2 border ${
                passwordMessage.type === 'success'
                  ? 'bg-[#EBF7EE] text-[#166534] border-[#86EFAC]'
                  : 'bg-[#FDF0F0] text-[#A82222] border-[#FCA5A5]'
              }`}
            >
              {passwordMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#166534]" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-[#A82222]" />
              )}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password..."
                className="w-full bg-[#F4F6F9] p-2.5 rounded-lg border border-[#DCE3EC] text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters..."
                className="w-full bg-[#F4F6F9] p-2.5 rounded-lg border border-[#DCE3EC] text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password..."
                className="w-full bg-[#F4F6F9] p-2.5 rounded-lg border border-[#DCE3EC] text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordSaving}
                className="w-full py-2.5 rounded-lg bg-[#142B4A] text-white font-semibold hover:bg-[#243F64] disabled:opacity-50 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                {passwordSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {passwordSaving ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
