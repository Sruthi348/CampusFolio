import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/axios';
import {
  Activity,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Calendar,
  Building2,
  Award
} from 'lucide-react';

export function ExtracurricularsEdit() {
  const { profileSummary, refreshProfile } = useOutletContext();
  const extraList = profileSummary?.profile?.extracurriculars || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    activityName: '',
    role: '',
    organization: '',
    duration: '',
    description: ''
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const resetForm = () => {
    setFormData({
      activityName: '',
      role: '',
      organization: '',
      duration: '',
      description: ''
    });
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setMessage({ type: '', text: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      activityName: item.activityName,
      role: item.role,
      organization: item.organization || '',
      duration: item.duration,
      description: item.description
    });
    setMessage({ type: '', text: '' });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    try {
      const res = await api.delete(`/students/me/extracurriculars/${id}`);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Activity deleted successfully.' });
        await refreshProfile();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete activity.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        activityName: formData.activityName,
        role: formData.role,
        organization: formData.organization || null,
        duration: formData.duration,
        description: formData.description
      };

      if (editingId) {
        await api.put(`/students/me/extracurriculars/${editingId}`, payload);
        setMessage({ type: 'success', text: 'Activity updated successfully!' });
      } else {
        await api.post('/students/me/extracurriculars', payload);
        setMessage({ type: 'success', text: 'Activity added successfully!' });
      }

      await refreshProfile();
      setModalOpen(false);
      resetForm();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save activity.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Extracurriculars & Leadership
          </h1>
          <p className="text-sm text-[#526175] mt-1">
            Showcase collegiate clubs, student committees, sports, cultural arts, and leadership initiatives.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#142B4A] hover:bg-[#243F64] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Activity
        </button>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-[#EBF7EE] text-[#166534] border-[#86EFAC]'
              : 'bg-[#FDF0F0] text-[#A82222] border-[#FCA5A5]'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Activity List */}
      <div className="space-y-4">
        {extraList.length === 0 ? (
          <div className="bg-white border border-[#DCE3EC] rounded-xl p-10 text-center">
            <Activity className="w-10 h-10 text-[#B9C9DD] mx-auto mb-3" />
            <h3 className="font-semibold text-base text-[#0F172A]">No Extracurricular Activities Added</h3>
            <p className="text-xs text-[#526175] mt-1 max-w-sm mx-auto">
              Add your roles in university societies, hackathon organizing committees, or campus leadership to highlight your versatile profile.
            </p>
          </div>
        ) : (
          extraList.map((extra) => (
            <div
              key={extra.id}
              className="bg-white border border-[#DCE3EC] rounded-xl p-5 shadow-xs flex items-start justify-between gap-4 hover:border-[#142B4A] transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#E9EFF6] text-[#142B4A] flex items-center justify-center font-bold text-xs">
                    <Award className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-base text-[#0F172A]">{extra.activityName}</h3>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-medium text-[#526175]">
                  <span className="text-[#142B4A] font-semibold">{extra.role}</span>
                  {extra.organization && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#B9C9DD]" />
                      {extra.organization}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[#526175]">
                    <Calendar className="w-3.5 h-3.5 text-[#B9C9DD]" />
                    {extra.duration}
                  </span>
                </div>

                <p className="text-xs text-[#526175] leading-relaxed pt-1">
                  {extra.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleOpenEdit(extra)}
                  className="p-2 text-[#526175] hover:text-[#142B4A] hover:bg-[#E9EFF6] rounded-lg transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(extra.id)}
                  className="p-2 text-[#526175] hover:text-[#A82222] hover:bg-[#FDF0F0] rounded-lg transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCE3EC] rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
              <h3 className="font-bold text-lg text-[#0F172A]">
                {editingId ? 'Edit Extracurricular Activity' : 'Add Extracurricular Activity'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#526175] hover:text-[#0F172A] hover:bg-[#E9EFF6] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                  Activity / Club / Initiative Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.activityName}
                  onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                  placeholder="e.g. University Open Source Society"
                  className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                    Your Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Vice President, Lead Organizer"
                    className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                    Duration *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. Aug 2024 - Present"
                    className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                  Organization / Chapter
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g. ACM Student Chapter, GDSC, NSS"
                  className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                  Description of Responsibilities & Impact *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail workshops conducted, events coordinated, mentorship delivered, or community outcomes..."
                  className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg p-2.5 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-[#DCE3EC] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#DCE3EC] text-[#526175] rounded-lg hover:bg-[#E9EFF6] font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#142B4A] hover:bg-[#243F64] text-white rounded-lg font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
