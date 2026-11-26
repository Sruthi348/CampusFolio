import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/axios';
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';

export function EducationEdit() {
  const { profileSummary, refreshProfile } = useOutletContext();
  const educationList = profileSummary?.profile?.education || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    level: 'UG',
    program: '',
    institution: '',
    fieldOfStudy: '',
    startYear: new Date().getFullYear() - 2,
    endYear: new Date().getFullYear(),
    isCurrent: false,
    grade: ''
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const resetForm = () => {
    setFormData({
      level: 'UG',
      program: '',
      institution: '',
      fieldOfStudy: '',
      startYear: new Date().getFullYear() - 2,
      endYear: new Date().getFullYear(),
      isCurrent: false,
      grade: ''
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
      level: item.level,
      program: item.program,
      institution: item.institution,
      fieldOfStudy: item.fieldOfStudy,
      startYear: item.startYear,
      endYear: item.endYear || '',
      isCurrent: item.isCurrent,
      grade: item.grade || ''
    });
    setMessage({ type: '', text: '' });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this education record?')) return;
    try {
      const res = await api.delete(`/students/me/education/${id}`);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Education record deleted.' });
        await refreshProfile();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete education record.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!formData.isCurrent && formData.endYear && Number(formData.endYear) < Number(formData.startYear)) {
      setMessage({ type: 'error', text: 'End year cannot be earlier than start year.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        level: formData.level,
        program: formData.program,
        institution: formData.institution,
        fieldOfStudy: formData.fieldOfStudy,
        startYear: Number(formData.startYear),
        endYear: formData.isCurrent ? null : Number(formData.endYear),
        isCurrent: Boolean(formData.isCurrent),
        grade: formData.grade || null
      };

      if (editingId) {
        await api.put(`/students/me/education/${editingId}`, payload);
        setMessage({ type: 'success', text: 'Education record updated!' });
      } else {
        await api.post('/students/me/education', payload);
        setMessage({ type: 'success', text: 'Education record added!' });
      }

      await refreshProfile();
      setModalOpen(false);
      resetForm();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save education record.'
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
            Academic Background
          </span>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Education History
          </h1>
          <p className="text-xs sm:text-sm text-[#526175] mt-1">
            Add all secondary, undergraduate, postgraduate, and diploma qualifications.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#142B4A] hover:bg-[#243F64] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Education
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

      {/* Existing Education Records List */}
      <div className="space-y-3.5">
        {educationList.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-10 text-center shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
            <GraduationCap className="w-10 h-10 text-[#B9C9DD] mx-auto mb-3" />
            <h3 className="font-bold text-sm text-[#0F172A]">No Education Added Yet</h3>
            <p className="text-xs text-[#526175] mt-1 max-w-sm mx-auto">
              Record your degrees, institutions, and academic grades to complete your academic profile.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#142B4A] hover:bg-[#243F64] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Education
            </button>
          </div>
        ) : (
          educationList.map((edu) => (
            <div
              key={edu.id}
              className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl p-5 shadow-[0_1px_3px_rgba(20,43,74,0.05)] flex items-start justify-between gap-4 hover:border-[#142B4A] transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#E9EFF6] text-[#142B4A] border border-[#DCE3EC]">
                    {edu.level}
                  </span>
                  <h3 className="font-bold text-sm text-[#0F172A]">{edu.program}</h3>
                </div>
                <p className="text-xs font-medium text-[#526175]">
                  {edu.institution} • {edu.fieldOfStudy}
                </p>
                <div className="flex items-center gap-3 text-xs text-[#526175] pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#526175]" />
                    {edu.startYear} - {edu.isCurrent ? 'Current' : edu.endYear}
                  </span>
                  {edu.grade && (
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                      Grade: {edu.grade}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleOpenEdit(edu)}
                  className="p-1.5 text-[#526175] hover:text-[#142B4A] hover:bg-[#F4F6F9] rounded-lg transition cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(edu.id)}
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
              <h3 className="font-bold text-base text-[#0F172A]">
                {editingId ? 'Edit Education Record' : 'Add Education Record'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#526175] hover:text-[#0F172A] hover:bg-[#F4F6F9] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                    Level *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                  >
                    <option value="UG">Undergraduate (UG)</option>
                    <option value="PG">Postgraduate (PG)</option>
                    <option value="HSC">Higher Secondary (12th)</option>
                    <option value="SSLC">Secondary (10th)</option>
                    <option value="DIPLOMA">Diploma</option>
                    <option value="PHD">Doctorate (PhD)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                    Program / Degree Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    placeholder="e.g. Master of Computer Applications"
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                  Institution / University *
                </label>
                <input
                  type="text"
                  required
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="e.g. University College of Engineering"
                  className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                  Field of Study / Specialization *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fieldOfStudy}
                  onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                  placeholder="e.g. Computer Science, Cloud Systems"
                  className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                    Start Year *
                  </label>
                  <input
                    type="number"
                    required
                    min={1990}
                    max={2030}
                    value={formData.startYear}
                    onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                    End Year {formData.isCurrent ? '(Ongoing)' : '*'}
                  </label>
                  <input
                    type="number"
                    disabled={formData.isCurrent}
                    required={!formData.isCurrent}
                    min={1990}
                    max={2035}
                    value={formData.endYear}
                    onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] disabled:opacity-40 focus:outline-hidden focus:border-[#142B4A]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isCurrent}
                    onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                    className="w-4 h-4 text-[#142B4A] rounded border-[#DCE3EC]"
                  />
                  <span className="text-xs text-[#526175] font-medium">Currently studying here</span>
                </label>

                <div className="w-1/2">
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="CGPA / Grade (e.g. 8.9 / 10)"
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-1.5 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                  />
                </div>
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
                  Save Education
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
