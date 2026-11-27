import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/axios';
import {
  Link2,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Globe,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../../components/common/Icons';

export function LinksEdit() {
  const { profileSummary, refreshProfile } = useOutletContext();
  const linksList = profileSummary?.profile?.links || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    platform: 'GitHub',
    url: '',
    label: ''
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const resetForm = () => {
    setFormData({
      platform: 'GitHub',
      url: '',
      label: ''
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
      platform: item.platform,
      url: item.url,
      label: item.label || ''
    });
    setMessage({ type: '', text: '' });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;
    try {
      const res = await api.delete(`/students/me/links/${id}`);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Link deleted successfully.' });
        await refreshProfile();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete link.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        platform: formData.platform,
        url: formData.url,
        label: formData.label || null
      };

      if (editingId) {
        await api.put(`/students/me/links/${editingId}`, payload);
        setMessage({ type: 'success', text: 'Link updated successfully!' });
      } else {
        await api.post('/students/me/links', payload);
        setMessage({ type: 'success', text: 'Link added successfully!' });
      }

      await refreshProfile();
      setModalOpen(false);
      resetForm();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save link.'
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
            Professional & Social Links
          </h1>
          <p className="text-sm text-[#526175] mt-1">
            Connect your code repositories, LinkedIn profile, personal portfolio, or research publications.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#142B4A] hover:bg-[#243F64] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Link
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

      {/* Links List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {linksList.length === 0 ? (
          <div className="sm:col-span-2 bg-white border border-[#DCE3EC] rounded-xl p-10 text-center">
            <Link2 className="w-10 h-10 text-[#B9C9DD] mx-auto mb-3" />
            <h3 className="font-semibold text-base text-[#0F172A]">No Professional Links Added</h3>
            <p className="text-xs text-[#526175] mt-1 max-w-sm mx-auto">
              Add your GitHub, LinkedIn, and personal website so evaluators and visitors can view your code and professional background.
            </p>
          </div>
        ) : (
          linksList.map((link) => {
            const platformLower = link.platform.toLowerCase();
            const isGh = platformLower.includes('github');
            const isLi = platformLower.includes('linkedin');

            return (
              <div
                key={link.id}
                className="bg-white border border-[#DCE3EC] rounded-xl p-4 shadow-xs flex items-center justify-between gap-3 hover:border-[#142B4A] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#E9EFF6] flex items-center justify-center shrink-0">
                    {isGh && <GithubIcon className="w-5 h-5 text-[#0F172A]" />}
                    {isLi && <LinkedinIcon className="w-5 h-5 text-[#142B4A]" />}
                    {!isGh && !isLi && <Globe className="w-5 h-5 text-[#243F64]" />}
                  </div>

                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-[#0F172A] block">
                      {link.platform}
                    </span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#243F64] hover:text-[#142B4A] hover:underline truncate block max-w-[200px]"
                    >
                      {link.label || link.url}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-[#526175] hover:text-[#142B4A] rounded-md transition-colors"
                    title="Open Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleOpenEdit(link)}
                    className="p-1.5 text-[#526175] hover:text-[#142B4A] rounded-md transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-1.5 text-[#526175] hover:text-[#A82222] rounded-md transition-colors cursor-pointer"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCE3EC] rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
              <h3 className="font-bold text-lg text-[#0F172A]">
                {editingId ? 'Edit Professional Link' : 'Add Professional Link'}
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
                  Platform / Category *
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
                >
                  <option value="GitHub">GitHub</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="LeetCode">LeetCode</option>
                  <option value="Twitter">Twitter / X</option>
                  <option value="Google Scholar">Google Scholar</option>
                  <option value="Other">Other URL</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                  Destination URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#0F172A] mb-1">
                  Custom Display Label (Optional)
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g. github.com/username"
                  className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
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
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
