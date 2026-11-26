import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/axios';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';

export function ExperienceEdit() {
  const { profileSummary, refreshProfile } = useOutletContext();
  const experienceList = profileSummary?.profile?.experience || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    organization: '',
    role: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: ''
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const resetForm = () => {
    setFormData({
      organization: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
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
      organization: item.organization,
      role: item.role,
      location: item.location || '',
      startDate: item.startDate ? item.startDate.slice(0, 10) : '',
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
      isCurrent: item.isCurrent,
      description: item.description
    });
    setMessage({ type: '', text: '' });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this experience record?')) return;
    try {
      const res = await api.delete(`/students/me/experience/${id}`);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Experience record deleted.' });
        await refreshProfile();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete experience.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.startDate && formData.endDate && !formData.isCurrent) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        setMessage({ type: 'error', text: 'End date cannot be earlier than start date.' });
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        organization: formData.organization,
        role: formData.role,
        location: formData.location || null,
        startDate: formData.startDate,
        endDate: formData.isCurrent || !formData.endDate ? null : formData.endDate,
        isCurrent: Boolean(formData.isCurrent),
        description: formData.description
      };

      if (editingId) {
        await api.put(`/students/me/experience/${editingId}`, payload);
        setMessage({ type: 'success', text: 'Experience updated!' });
      } else {
        await api.post('/students/me/experience', payload);
        setMessage({ type: 'success', text: 'Experience added!' });
      }

      await refreshProfile();
      setModalOpen(false);
      resetForm();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save experience.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#142B4A] uppercase tracking-wider block mb-1">
            Career History
          </span>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Work Experience & Internships
          </h1>
          <p className="text-xs sm:text-sm text-[#526175] mt-1">
            Detail internships, research roles, part-time jobs, and freelance technical engagements.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#142B4A] hover:bg-[#243F64] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
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

      {/* Experience List */}
      <div className="space-y-3.5">
        {experienceList.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-10 text-center shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
            <Briefcase className="w-10 h-10 text-[#B9C9DD] mx-auto mb-3" />
            <h3 className="font-bold text-sm text-[#0F172A]">No Experience Recorded</h3>
            <p className="text-xs text-[#526175] mt-1 max-w-sm mx-auto">
              Add corporate internships, freelance projects, or campus technical roles.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#142B4A] hover:bg-[#243F64] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Experience
            </button>
          </div>
        ) : (
          experienceList.map((exp) => (
            <div
              key={exp.id}
              className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl p-5 shadow-[0_1px_3px_rgba(20,43,74,0.05)] flex items-start justify-between gap-4 hover:border-[#142B4A] transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#0F172A]">{exp.role}</h3>
                  {exp.isCurrent && (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold badge-approved">
                      Current
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-[#142B4A]">
                  {exp.organization} {exp.location && `• ${exp.location}`}
                </p>

                <p className="text-xs text-[#526175]">
                  {new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })} - {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Completed'}
                </p>

                <p className="text-xs text-[#526175] mt-2 leading-relaxed">
                  {exp.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleOpenEdit(exp)}
                  className="p-1.5 text-[#526175] hover:text-[#142B4A] hover:bg-[#F4F6F9] rounded-lg transition cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="p-1.5 text-[#526175] hover:text-[#A82222] hover:bg-[#FDF0F0] rounded-lg transition cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Experience Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
              <h3 className="font-bold text-base text-[#0F172A]">
                {editingId ? 'Edit Experience' : 'Add Experience'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#526175] hover:text-[#0F172A] hover:bg-[#F4F6F9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                  Role / Position Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Software Engineering Intern"
                  className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:ring-1 focus:ring-[#142B4A]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                  Company / Organization *
                </label>
                <input
                  type="text"
                  required
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g. Infosys, Cisco, Research Lab"
                  className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Bengaluru, India or Remote"
                  className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                    End Date {formData.isCurrent ? '(Present)' : '*'}
                  </label>
                  <input
                    type="date"
                    disabled={formData.isCurrent}
                    required={!formData.isCurrent}
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] disabled:opacity-40 focus:outline-hidden focus:border-[#142B4A]"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isCurrent}
                    onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                    className="w-4 h-4 text-[#142B4A] rounded border-[#DCE3EC]"
                  />
                  <span className="text-xs text-[#526175] font-medium">Currently working in this role</span>
                </label>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                  Responsibilities & Achievements *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail systems built, technologies used, optimization impact, and responsibilities handled..."
                  className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg p-2.5 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                />
              </div>

              <div className="pt-4 border-t border-[#DCE3EC] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#DCE3EC] text-[#526175] rounded-lg hover:bg-[#F4F6F9] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#142B4A] hover:bg-[#243F64] text-white rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
