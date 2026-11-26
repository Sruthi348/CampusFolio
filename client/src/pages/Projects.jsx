import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  FolderGit2,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { GithubIcon } from '../components/common/Icons';

export function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    api.get('/public/featured-projects')
      .then((res) => {
        if (res.data.success) {
          setProjects(res.data.projects || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredProjects = projects.filter(p => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    const titleMatch = p.title.toLowerCase().includes(q);
    const descMatch = (p.summary || p.description || '').toLowerCase().includes(q);
    const techMatch = p.technologies?.some(t => t.skill.name.toLowerCase().includes(q));
    const authorMatch = p.student.fullName.toLowerCase().includes(q);
    return titleMatch || descMatch || techMatch || authorMatch;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F9] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#142B4A] bg-[#E9EFF6] px-3 py-1 rounded-full border border-[#B9C9DD] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#142B4A]" />
            Curated Innovations
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
            Institutional Featured Projects
          </h1>
          <p className="text-xs sm:text-sm text-[#526175] mt-2">
            Explore capstone projects, open-source repositories, and full-stack software architectures developed by university students.
          </p>

          <div className="mt-6 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-[#526175] absolute left-3.5 top-3" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter by title, technology (e.g. React), or author..."
              className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl pl-10 pr-4 py-2 text-xs text-[#0F172A] placeholder-[#526175]/60 shadow-[0_1px_3px_rgba(20,43,74,0.05)] focus:outline-hidden focus:border-[#142B4A]"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-[#142B4A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-[#526175]">Loading featured projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl p-12 text-center max-w-md mx-auto shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
            <FolderGit2 className="w-10 h-10 text-[#B9C9DD] mx-auto mb-3" />
            <h3 className="font-bold text-sm text-[#0F172A]">No projects found</h3>
            <p className="text-xs text-[#526175] mt-1">
              Try adjusting your search query to find other technical projects.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(20,43,74,0.05)] hover:border-[#142B4A] transition-all flex flex-col group"
              >
                {proj.screenshotUrl && (
                  <div className="h-44 w-full bg-[#F4F6F9] overflow-hidden border-b border-[#DCE3EC]">
                    <img
                      src={proj.screenshotUrl}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#142B4A] bg-[#E9EFF6] px-2 py-0.5 rounded border border-[#DCE3EC]">
                        {proj.category || 'Software Project'}
                      </span>
                      <span className="text-xs font-semibold badge-approved px-2 py-0.5 rounded flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        Featured
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#0F172A] group-hover:text-[#142B4A] transition-colors leading-snug">
                      {proj.title}
                    </h3>

                    <p className="text-xs text-[#526175] mt-2 line-clamp-3 leading-relaxed">
                      {proj.summary || proj.description}
                    </p>

                    {/* Tech stack pills */}
                    <div className="flex flex-wrap gap-1.5 my-3.5">
                      {proj.technologies?.map((t) => (
                        <span
                          key={t.skill.id}
                          className="text-xs px-2 py-0.5 rounded bg-[#F4F6F9] text-[#243F64] border border-[#DCE3EC] font-medium"
                        >
                          {t.skill.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Author footer */}
                  <div className="pt-3 border-t border-[#DCE3EC] flex items-center justify-between text-xs">
                    <Link
                      to={`/student/${proj.student.slug}`}
                      className="flex items-center gap-2 group/author hover:underline"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#142B4A] text-white flex items-center justify-center font-bold text-xs">
                        {proj.student.fullName.charAt(0)}
                      </div>
                      <span className="font-semibold text-[#0F172A]">{proj.student.fullName}</span>
                      <span className="text-[#526175]">({proj.student.department?.code})</span>
                    </Link>

                    <div className="flex items-center gap-2">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#526175] hover:text-[#0F172A] transition"
                          title="View Repository"
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
                          title="Live Demo"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
