import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/axios';
import {
  FolderGit2,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Loader2
} from 'lucide-react';
import { GithubIcon } from '../../components/common/Icons';

export function ProjectsEdit() {
  const { profileSummary, refreshProfile } = useOutletContext();
  const projectsList = profileSummary?.profile?.projects || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    category: 'Web Application',
    role: '',
    startDate: '',
    endDate: '',
    isOngoing: false,
    githubUrl: '',
    demoLink: '',
    screenshotUrl: '',
    progressStatus: 'COMPLETED',
    technologies: ''
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      description: '',
      category: 'Web Application',
      role: '',
      startDate: '',
      endDate: '',
      isOngoing: false,
      githubUrl: '',
      demoLink: '',
      screenshotUrl: '',
      progressStatus: 'COMPLETED',
      technologies: ''
    });
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setMessage({ type: '', text: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setEditingId(proj.id);
    const techString = proj.technologies ? proj.technologies.map(t => t.skill.name).join(', ') : '';

    setFormData({
      title: proj.title || '',
      summary: proj.summary || '',
      description: proj.description || '',
      category: proj.category || 'Web Application',
      role: proj.role || '',
      startDate: proj.startDate ? proj.startDate.slice(0, 10) : '',
      endDate: proj.endDate ? proj.endDate.slice(0, 10) : '',
      isOngoing: proj.isOngoing || false,
      githubUrl: proj.githubUrl || '',
      demoLink: proj.demoLink || '',
      screenshotUrl: proj.screenshotUrl || '',
      progressStatus: proj.progressStatus || 'COMPLETED',
      technologies: techString
    });
    setMessage({ type: '', text: '' });
    setModalOpen(true);
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Screenshot size must be under 2 MB.' });
      return;
    }

    const uploadData = new FormData();
    uploadData.append('image', file);

    setUploading(true);
    try {
      const res = await api.post('/upload/image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setFormData(prev => ({ ...prev, screenshotUrl: res.data.fileUrl }));
        setMessage({ type: 'success', text: 'Screenshot uploaded!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload screenshot.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await api.delete(`/students/me/projects/${id}`);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Project deleted.' });
        await refreshProfile();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete project.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.startDate && formData.endDate && !formData.isOngoing) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        setMessage({ type: 'error', text: 'End date cannot be earlier than start date.' });
        return;
      }
    }

    setSaving(true);

    try {
      const techArray = formData.technologies
        ? formData.technologies.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        title: formData.title,
        summary: formData.summary || null,
        description: formData.description,
        category: formData.category || null,
        role: formData.role || null,
        startDate: formData.startDate || null,
        endDate: formData.isOngoing || !formData.endDate ? null : formData.endDate,
        isOngoing: Boolean(formData.isOngoing),
        githubUrl: formData.githubUrl || null,
        demoLink: formData.demoLink || null,
        screenshotUrl: formData.screenshotUrl || null,
        progressStatus: formData.progressStatus,
        technologies: techArray
      };

      if (editingId) {
        await api.put(`/students/me/projects/${editingId}`, payload);
        setMessage({ type: 'success', text: 'Project updated successfully!' });
      } else {
        await api.post('/students/me/projects', payload);
        setMessage({ type: 'success', text: 'Project created successfully!' });
      }

      await refreshProfile();
      setModalOpen(false);
      resetForm();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save project.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#142B4A] uppercase tracking-wider block mb-1">
            Engineering Work
          </span>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Portfolio Projects
          </h1>
          <p className="text-xs sm:text-sm text-[#526175] mt-1">
            Showcase technical applications, architecture summaries, GitHub repositories, and live demos.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#142B4A] hover:bg-[#243F64] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Project
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projectsList.length === 0 ? (
          <div className="md:col-span-2 bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-10 text-center shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
            <FolderGit2 className="w-10 h-10 text-[#B9C9DD] mx-auto mb-3" />
            <h3 className="font-bold text-sm text-[#0F172A]">No Projects Added Yet</h3>
            <p className="text-xs text-[#526175] mt-1 max-w-sm mx-auto">
              Adding at least 1 project increases your portfolio strength significantly and highlights your code to recruiters.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#142B4A] hover:bg-[#243F64] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Project
            </button>
          </div>
        ) : (
          projectsList.map((proj) => (
            <div
              key={proj.id}
              className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-5 shadow-[0_1px_3px_rgba(20,43,74,0.05)] flex flex-col justify-between hover:border-[#142B4A] transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#142B4A] bg-[#E9EFF6] px-2 py-0.5 rounded border border-[#DCE3EC]">
                    {proj.category || 'Project'}
                  </span>
                  {proj.isFeatured && (
                    <span className="text-xs font-semibold badge-approved px-2 py-0.5 rounded flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Featured
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-[#0F172A] leading-snug">
                  {proj.title}
                </h3>

                {proj.role && (
                  <p className="text-xs text-[#526175] font-medium mt-0.5">
                    Role: {proj.role}
                  </p>
                )}

                <p className="text-xs text-[#526175] mt-2 line-clamp-3 leading-relaxed">
                  {proj.summary || proj.description}
                </p>

                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 my-3">
                    {proj.technologies.map((t) => (
                      <span
                        key={t.skill.id}
                        className="text-xs px-2 py-0.5 rounded bg-[#F4F6F9] text-[#243F64] border border-[#DCE3EC] font-medium"
                      >
                        {t.skill.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#DCE3EC] flex items-center justify-between text-xs">
                <span className="text-[#526175] font-medium text-xs">
                  {proj.progressStatus}
                </span>

                <div className="flex items-center gap-2">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#526175] hover:text-[#0F172A] transition"
                      title="GitHub"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                  {proj.demoLink && (
                    <a
                      href={proj.demoLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#142B4A] hover:text-[#243F64] transition"
                      title="Demo"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleOpenEdit(proj)}
                    className="p-1.5 text-[#526175] hover:text-[#142B4A] hover:bg-[#F4F6F9] rounded-md transition cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="p-1.5 text-[#526175] hover:text-[#A82222] hover:bg-[#FDF0F0] rounded-md transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl max-w-xl w-full p-6 shadow-xl relative my-8 animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
              <h3 className="font-bold text-base text-[#0F172A]">
                {editingId ? 'Edit Project' : 'Add New Project'}
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
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. EduSphere - Credential Verification Platform"
                  className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:ring-1 focus:ring-[#142B4A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Web Application, AI/ML, Cloud"
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                    Your Role
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Lead Architect, Fullstack Dev"
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                  Technologies (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  placeholder="React, Node.js, PostgreSQL, Docker"
                  className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                  One-Line Summary
                </label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="High-level description of what the project solves"
                  className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                  Full Description & Architecture *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain system architecture, technical challenges, database schema decisions, and performance metrics..."
                  className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg p-2.5 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                    GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/username/repo"
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={formData.demoLink}
                    onChange={(e) => setFormData({ ...formData, demoLink: e.target.value })}
                    placeholder="https://myproject.dev"
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                  />
                </div>
              </div>

              {/* Progress Status & Dates */}
              <div className="grid grid-cols-3 gap-3 items-center">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                    Status
                  </label>
                  <select
                    value={formData.progressStatus}
                    onChange={(e) => setFormData({ ...formData, progressStatus: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-3 py-2 text-xs font-medium text-[#0F172A]"
                  >
                    <option value="COMPLETED">Completed</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="PROTOTYPE">Prototype</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-2.5 py-1.5 text-xs text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    disabled={formData.isOngoing}
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg px-2.5 py-1.5 text-xs text-[#0F172A] disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                  Project Screenshot (Max 2MB)
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#DCE3EC] rounded-lg text-xs font-semibold text-[#142B4A] bg-[#F4F6F9] hover:bg-[#E9EFF6] cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5 text-[#142B4A]" />
                    <span>{uploading ? 'Uploading...' : 'Choose Image'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleScreenshotUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  {formData.screenshotUrl && (
                    <span className="text-xs text-emerald-700 font-semibold truncate max-w-xs">
                      Uploaded ({formData.screenshotUrl})
                    </span>
                  )}
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
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
