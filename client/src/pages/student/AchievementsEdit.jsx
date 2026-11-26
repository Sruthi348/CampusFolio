import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/axios';
import {
  Trophy,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';

export function AchievementsEdit() {
  const { profileSummary, refreshProfile } = useOutletContext();
  const achievementsList = profileSummary?.profile?.achievements || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    proofUrl: ''
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      proofUrl: ''
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
      title: item.title,
      description: item.description,
      date: item.date ? item.date.slice(0, 10) : '',
      proofUrl: item.proofUrl || ''
    });
    setMessage({ type: '', text: '' });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this achievement?')) return;
    try {
      const res = await api.delete(`/students/me/achievements/${id}`);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Achievement deleted.' });
        await refreshProfile();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete achievement.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        proofUrl: formData.proofUrl || null
      };

      if (editingId) {
        await api.put(`/students/me/achievements/${editingId}`, payload);
        setMessage({ type: 'success', text: 'Achievement updated and resubmitted for verification.' });
      } else {
        await api.post('/students/me/achievements', payload);
        setMessage({ type: 'success', text: 'Achievement submitted for verification!' });
      }

      await refreshProfile();
      setModalOpen(false);
      resetForm();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save achievement.'
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
            Honors & Awards
          </span>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Honors & Achievements
          </h1>
          <p className="text-xs sm:text-sm text-[#526175] mt-1">
            Showcase hackathon prizes, academic rankings, research publications, and scholarships.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#142B4A] hover:bg-[#243F64] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Achievement
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

      {/* Achievements List */}
      <div className="space-y-3.5">
        {achievementsList.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-10 text-center shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
            <Trophy className="w-10 h-10 text-[#B9C9DD] mx-auto mb-3" />
            <h3 className="font-bold text-sm text-[#0F172A]">No Achievements Recorded</h3>
            <p className="text-xs text-[#526175] mt-1 max-w-sm mx-auto">
              Highlight hackathon victories, coding contests, open-source grants, or research paper awards.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#142B4A] hover:bg-[#243F64] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Achievement
            </button>
          </div>
        ) : (
          achievementsList.map((ach) => {
            const isVerified = ach.verificationStatus === 'VERIFIED';
            const isPending = ach.verificationStatus === 'PENDING';

            return (
              <div
                key={ach.id}
                className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl p-5 shadow-[0_1px_3px_rgba(20,43,74,0.05)] flex items-start justify-between gap-4 hover:border-[#142B4A] transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#0F172A]">{ach.title}</h3>

                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold badge-approved px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold badge-pending px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-amber-600" /> Pending Review
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold badge-rejected px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3 text-red-600" /> Rejected
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#526175]">
                    Date: {new Date(ach.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                  </p>

                  <p className="text-xs text-[#526175] mt-1.5 leading-relaxed">
                    {ach.description}
                  </p>

                  {ach.proofUrl && (
                    <a
                      href={ach.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#142B4A] hover:underline pt-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Proof Link
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(ach)}
                    className="p-1.5 text-[#526175] hover:text-[#142B4A] hover:bg-[#F4F6F9] rounded-lg transition cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ach.id)}
                    className="p-1.5 text-[#526175] hover:text-[#A82222] hover:bg-[#FDF0F0] rounded-lg transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Achievement Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
              <h3 className="font-bold text-base text-[#0F172A]">
                {editingId ? 'Edit Achievement' : 'Record Achievement'}
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
                  Achievement Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 1st Place - National Smart India Hackathon"
                  className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:ring-1 focus:ring-[#142B4A]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                  Date Received *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                  Verification / Proof Link (URL)
                </label>
                <input
                  type="url"
                  value={formData.proofUrl}
                  onChange={(e) => setFormData({ ...formData, proofUrl: e.target.value })}
                  placeholder="https://hackathon.org/winners/..."
                  className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                  Description & Impact *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the competition scope, project presented, problem solved, or prize awarded..."
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
                  Submit Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
