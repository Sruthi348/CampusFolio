import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/axios';
import {
  Settings as SettingsIcon,
  Lock,
  Eye,
  EyeOff,
  Globe,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  ShieldCheck
} from 'lucide-react';

export function Settings() {
  const { profileSummary, refreshProfile } = useOutletContext();
  const profile = profileSummary?.profile;

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Visibility toggles state
  const [visibility, setVisibility] = useState({
    showEducation: true,
    showSkills: true,
    showProjects: true,
    showCertifications: true,
    showExperience: true,
    showAchievements: true,
    showExtracurriculars: true,
    showLinks: true
  });

  const [isPublished, setIsPublished] = useState(true);
  const [visSaving, setVisSaving] = useState(false);
  const [visMessage, setVisMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (profile) {
      if (profile.visibilitySettings) {
        setVisibility(prev => ({
          ...prev,
          ...profile.visibilitySettings
        }));
      }
      setIsPublished(profile.isPublished !== false);
    }
  }, [profile]);

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

  const handleToggleVisibility = (key) => {
    setVisibility(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveVisibility = async () => {
    setVisSaving(true);
    setVisMessage({ type: '', text: '' });

    try {
      const [visRes, pubRes] = await Promise.all([
        api.put('/students/me/visibility', visibility),
        api.put('/students/me/publish', { isPublished })
      ]);

      if (visRes.data.success && pubRes.data.success) {
        setVisMessage({ type: 'success', text: 'Visibility settings and publish status updated successfully!' });
        await refreshProfile();
      }
    } catch (err) {
      setVisMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update visibility settings.'
      });
    } finally {
      setVisSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          Account & Privacy Settings
        </h1>
        <p className="text-sm text-[#526175] mt-1">
          Control your public portfolio discovery, section privacy, and account security credentials.
        </p>
      </div>

      {/* Visibility & Publishing Card */}
      <div className="bg-white border border-[#DCE3EC] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#142B4A]" />
            Public Visibility & Section Privacy
          </h2>
          <p className="text-xs text-[#526175] mt-1">
            Configure which sections appear on your public showcase portfolio. Hidden sections are omitted from public directory searches.
          </p>
        </div>

        {visMessage.text && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 border ${
              visMessage.type === 'success'
                ? 'bg-[#EBF7EE] text-[#166534] border-[#86EFAC]'
                : 'bg-[#FDF0F0] text-[#A82222] border-[#FCA5A5]'
            }`}
          >
            {visMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{visMessage.text}</span>
          </div>
        )}

        {/* Master Publish Switch */}
        <div className="p-4 rounded-xl bg-[#F4F6F9] border border-[#DCE3EC] flex items-center justify-between">
          <div>
            <span className="font-semibold text-sm text-[#0F172A] block">
              Portfolio Published Status
            </span>
            <span className="text-xs text-[#526175]">
              {isPublished
                ? 'Your portfolio is live and visible in institutional talent searches.'
                : 'Your portfolio is currently unpublished and concealed from public visitors.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsPublished(!isPublished)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              isPublished ? 'bg-[#142B4A]' : 'bg-[#B9C9DD]'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                isPublished ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Individual Section Switches */}
        <div className="space-y-3 pt-2 text-xs">
          <span className="font-semibold uppercase tracking-wider text-[#526175] block">
            Toggle Visible Sections
          </span>

          {[
            { key: 'showEducation', label: 'Education Records & Timeline' },
            { key: 'showSkills', label: 'Skills & Technical Interests' },
            { key: 'showProjects', label: 'Engineering Projects' },
            { key: 'showCertifications', label: 'Verified Certifications' },
            { key: 'showExperience', label: 'Work Experience & Internships' },
            { key: 'showAchievements', label: 'Honors & Achievements' },
            { key: 'showExtracurriculars', label: 'Extracurricular Activities' },
            { key: 'showLinks', label: 'Professional Links (GitHub, LinkedIn, Website)' }
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 rounded-lg border border-[#DCE3EC] bg-white hover:bg-[#F4F6F9] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {visibility[item.key] ? (
                  <Eye className="w-4 h-4 text-[#142B4A]" />
                ) : (
                  <EyeOff className="w-4 h-4 text-[#B9C9DD]" />
                )}
                <span className="font-medium text-[#0F172A]">{item.label}</span>
              </div>

              <button
                type="button"
                onClick={() => handleToggleVisibility(item.key)}
                className={`px-3 py-1 rounded-md font-semibold text-xs border transition-colors cursor-pointer ${
                  visibility[item.key]
                    ? 'bg-[#EBF7EE] text-[#166534] border-[#86EFAC]'
                    : 'bg-[#F4F6F9] text-[#526175] border-[#DCE3EC]'
                }`}
              >
                {visibility[item.key] ? 'Visible' : 'Hidden'}
              </button>
            </div>
          ))}
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="button"
            onClick={handleSaveVisibility}
            disabled={visSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#142B4A] hover:bg-[#243F64] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {visSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Visibility Settings
          </button>
        </div>
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
