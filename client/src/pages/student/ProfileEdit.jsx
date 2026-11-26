import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/axios';
import {
  User,
  Upload,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  Save,
  Loader2
} from 'lucide-react';

export function ProfileEdit() {
  const { profileSummary, refreshProfile } = useOutletContext();
  const profile = profileSummary?.profile;

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setBio(profile.bio || '');
      setDateOfBirth(profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : '');
      setPhotoUrl(profile.photoUrl || '');
    }
  }, [profile]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image file size must be less than 2 MB.' });
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setPhotoUrl(res.data.fileUrl);
        setMessage({ type: 'success', text: 'Photo uploaded! Click Save Profile to apply changes.' });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to upload photo.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put('/students/me/profile', {
        fullName,
        bio,
        dateOfBirth: dateOfBirth || null,
        photoUrl: photoUrl || null
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Profile saved successfully! Public portfolio updated.' });
        await refreshProfile();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save profile changes.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      
      <div>
        <span className="text-xs font-bold text-[#142B4A] uppercase tracking-wider block mb-1">
          Student Information
        </span>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          Basic Profile & Biography
        </h1>
        <p className="text-xs sm:text-sm text-[#526175] mt-1">
          Manage your personal details, institutional identifiers, and public bio.
        </p>
      </div>

      {message.text && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'badge-approved'
              : 'badge-rejected'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-[#A82222]" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(20,43,74,0.05)] space-y-6">
        
        {/* Photo Upload Section */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-2">
            Profile Photo
          </label>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#142B4A] text-white flex items-center justify-center font-bold text-2xl overflow-hidden shrink-0 border border-[#B9C9DD]">
              {photoUrl ? (
                <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                fullName ? fullName.charAt(0) : 'S'
              )}
            </div>

            <div className="space-y-1.5">
              <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#DCE3EC] rounded-lg text-xs font-semibold text-[#142B4A] bg-[#F4F6F9] hover:bg-[#E9EFF6] cursor-pointer transition shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-[#142B4A]" />
                <span>{uploading ? 'Uploading...' : 'Upload Image (Max 2MB)'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <p className="text-xs text-[#526175]">
                Permitted formats: JPG, PNG, WebP. Resized and stored automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Read-Only Institutional Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#F4F6F9] border border-[#DCE3EC] text-xs">
          <div>
            <span className="font-bold text-xs text-[#526175] uppercase tracking-wider block mb-1">
              Institutional Email
            </span>
            <div className="font-mono text-[#0F172A] font-semibold">{profile?.user?.email}</div>
          </div>

          <div>
            <span className="font-bold text-xs text-[#526175] uppercase tracking-wider block mb-1">
              Roll Number
            </span>
            <div className="font-mono text-[#0F172A] font-semibold">{profile?.rollNumber}</div>
          </div>

          <div>
            <span className="font-bold text-xs text-[#526175] uppercase tracking-wider block mb-1">
              Department & Batch
            </span>
            <div className="font-semibold text-[#0F172A]">
              {profile?.department?.code} • {profile?.batch?.name}
            </div>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:ring-1 focus:ring-[#142B4A]"
            />
            <p className="text-xs text-[#526175] mt-1">
              Updating your name automatically keeps your public URL unique.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                Date of Birth
              </label>
              <span className="text-xs font-semibold badge-approved px-2 py-0.5 rounded flex items-center gap-1">
                <EyeOff className="w-3 h-3 text-emerald-600" /> Private by default
              </span>
            </div>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:ring-1 focus:ring-[#142B4A]"
            />
            <p className="text-xs text-[#526175] mt-1">
              Never displayed publicly or shared in public API responses.
            </p>
          </div>
        </div>

        {/* Short Biography (Max 150 characters) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Short Biography (Max 150 characters)
            </label>
            <span className={`text-xs font-bold ${bio.length > 150 ? 'text-red-600' : 'text-[#526175]'}`}>
              {bio.length} / 150
            </span>
          </div>
          <textarea
            rows={3}
            maxLength={150}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A concise summary of your engineering passion, career direction, and technical specialization..."
            className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl p-3 text-sm text-[#0F172A] placeholder-[#526175]/60 focus:outline-hidden focus:border-[#142B4A] focus:ring-1 focus:ring-[#142B4A]"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving || bio.length > 150}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#142B4A] hover:bg-[#243F64] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </button>
        </div>

      </form>

    </div>
  );
}
