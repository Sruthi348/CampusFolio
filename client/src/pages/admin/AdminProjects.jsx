import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  FolderGit2,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Search
} from 'lucide-react';
import { GithubIcon } from '../../components/common/Icons';

export function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/projects');
      if (res.data.success) {
        setProjects(res.data.projects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleToggleFeatured = async (id, currentStatus) => {
    setMessage({ type: '', text: '' });
    try {
      const res = await api.patch(`/admin/projects/${id}/feature`, {
        isFeatured: !currentStatus
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message });
        await fetchProjects();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to toggle featured status.' });
    }
  };

  const filtered = projects.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.student.fullName.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Featured Projects Management
          </h1>
          <p className="text-sm text-[#526175] mt-1">
            Toggle which projects are spotlighted on the public homepage and innovation showcase.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#B9C9DD] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects or student..."
            className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg pl-9 pr-3 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
          />
        </div>
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
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#166534]" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-[#A82222]" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="md:col-span-2 py-12 text-center text-[#526175] text-xs">
            Loading projects...
          </div>
        ) : filtered.length === 0 ? (
          <div className="md:col-span-2 bg-white border border-[#DCE3EC] rounded-xl p-10 text-center text-xs text-[#526175]">
            No projects found.
          </div>
        ) : (
          filtered.map((proj) => (
            <div
              key={proj.id}
              className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between transition-colors ${
                proj.isFeatured ? 'border-[#FDE68A] ring-1 ring-[#FDE68A]/50' : 'border-[#DCE3EC]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-[#142B4A] bg-[#E9EFF6] px-2 py-0.5 rounded border border-[#B9C9DD]">
                    {proj.category || 'Project'}
                  </span>
                  {proj.isFeatured && (
                    <span className="text-xs font-bold text-[#9A5B0B] bg-[#FEF7EA] px-2 py-0.5 rounded border border-[#FDE68A] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#9A5B0B]" /> Featured
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-[#0F172A] leading-snug">
                  {proj.title}
                </h3>

                <p className="text-xs text-[#142B4A] font-semibold mt-1">
                  Author: {proj.student.fullName} ({proj.student.rollNumber} • {proj.student.department?.code})
                </p>

                <p className="text-xs text-[#526175] mt-2 line-clamp-3 leading-relaxed">
                  {proj.summary || proj.description}
                </p>

                <div className="flex flex-wrap gap-1 mt-3">
                  {proj.technologies?.map((t) => (
                    <span key={t.skill.id} className="text-xs px-2 py-0.5 rounded bg-[#F4F6F9] text-[#526175] border border-[#DCE3EC]">
                      {t.skill.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#DCE3EC] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {proj.githubUrl && (
                    <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-[#526175] hover:text-[#0F172A] transition-colors">
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                  {proj.demoLink && (
                    <a href={proj.demoLink} target="_blank" rel="noreferrer" className="text-[#142B4A] hover:underline flex items-center gap-1 font-semibold">
                      <ExternalLink className="w-4 h-4" /> Demo
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleFeatured(proj.id, proj.isFeatured)}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                    proj.isFeatured
                      ? 'bg-[#FEF7EA] text-[#9A5B0B] hover:bg-[#FDE68A] border border-[#FDE68A]'
                      : 'bg-[#F4F6F9] text-[#526175] hover:bg-[#E9EFF6] hover:text-[#142B4A] border border-[#DCE3EC]'
                  }`}
                >
                  {proj.isFeatured ? '★ Featured on Home' : '☆ Mark as Featured'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
